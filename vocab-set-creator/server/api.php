<?php
/* Bokogo cloud API · english.learn8.co/api/
   SQLite in ../../data/app.db (outside the web root). Pictures go to ../media/<user>/<sha1>.<ext>.
   Actions (?a=): register, login, me, prefs, logout, list, put, del, all (every teacher's sets), get (one shared set),
   pics (central picture library search), pic (upload one picture to the library), log. Auth: "Authorization: Bearer <token>".
   Languages: users.mother = mother tongue (th first), users.learning = target language (en). Picture names are {lang: text} maps. */
declare(strict_types=1);
$DATA = realpath(__DIR__ . '/../../data');
$CFG = require $DATA . '/config.php';           // ['invite'=>'...', 'base'=>'https://english.learn8.co']
$ALLOW = ['https://english.learn8.co', 'https://tim3flies.github.io'];

$o = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($o, $ALLOW, true)) {
  header('Access-Control-Allow-Origin: ' . $o);
  header('Vary: Origin');
  header('Access-Control-Allow-Headers: Authorization, Content-Type');
  header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
  header('Access-Control-Max-Age: 86400');
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function out($x, int $code = 200) { http_response_code($code); echo json_encode($x, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit; }
function fail(string $m, int $code = 400) { out(['error' => $m], $code); }

$db = new PDO('sqlite:' . $DATA . '/app.db', null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
$db->exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
$db->exec('CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT UNIQUE COLLATE NOCASE, pass TEXT NOT NULL, created INTEGER);
 CREATE TABLE IF NOT EXISTS tokens(tok TEXT PRIMARY KEY, uid INTEGER NOT NULL, created INTEGER, last INTEGER);
 CREATE TABLE IF NOT EXISTS sets(uid INTEGER NOT NULL, id TEXT NOT NULL, name TEXT, data TEXT NOT NULL, updated INTEGER NOT NULL, deleted INTEGER DEFAULT 0, PRIMARY KEY(uid, id));
 CREATE TABLE IF NOT EXISTS fails(k TEXT PRIMARY KEY, n INTEGER, t INTEGER);
 CREATE TABLE IF NOT EXISTS pictures(id TEXT PRIMARY KEY, url TEXT NOT NULL, owner INTEGER, kind TEXT, shared INTEGER DEFAULT 1, name TEXT, tags TEXT, created INTEGER, used INTEGER DEFAULT 0);
 CREATE INDEX IF NOT EXISTS pic_owner ON pictures(owner);');
foreach (["ALTER TABLE users ADD COLUMN mother TEXT DEFAULT 'th'", "ALTER TABLE users ADD COLUMN learning TEXT DEFAULT 'en'"] as $q) { try { $db->exec($q); } catch (PDOException $e) {} }
$LANGS = ['en','th','zh','ja','ko','vi','id','ms','my','lo','km','fil','hi','ar','es','fr','de','pt','ru'];
function lang($v, string $def): string { global $LANGS; $v = (string)$v; return in_array($v, $LANGS, true) ? $v : $def; }

$a = $_GET['a'] ?? '';
$in = [];
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
  $raw = file_get_contents('php://input');
  if (strlen($raw) > 40 * 1024 * 1024) fail('Too big', 413);
  $in = json_decode($raw ?: '{}', true);
  if (!is_array($in)) fail('Bad JSON');
}

function newToken(PDO $db, int $uid): string {
  $t = bin2hex(random_bytes(24));
  $db->prepare('INSERT INTO tokens(tok,uid,created,last) VALUES(?,?,?,?)')->execute([hash('sha256', $t), $uid, time(), time()]);
  return $t;
}
function user(PDO $db): array {
  $h = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
  if (!preg_match('/^Bearer\s+([a-f0-9]{48})$/', $h, $m)) fail('Sign in first', 401);
  $k = hash('sha256', $m[1]);
  $st = $db->prepare('SELECT u.id,u.name,u.mother,u.learning,t.last FROM tokens t JOIN users u ON u.id=t.uid WHERE t.tok=?');
  $st->execute([$k]);
  $u = $st->fetch();
  if (!$u) fail('Sign in again', 401);
  if (time() - (int)$u['last'] > 3600) $db->prepare('UPDATE tokens SET last=? WHERE tok=?')->execute([time(), $k]);
  $u['tok'] = $k;
  return $u;
}
function slow(PDO $db, string $k): void {   // simple brute-force brake per name+ip
  $st = $db->prepare('SELECT n,t FROM fails WHERE k=?'); $st->execute([$k]); $f = $st->fetch();
  if ($f && $f['n'] >= 8 && time() - $f['t'] < 900) fail('Too many tries. Wait 15 minutes.', 429);
}
function failed(PDO $db, string $k): void {
  $db->prepare('INSERT INTO fails(k,n,t) VALUES(?,1,?) ON CONFLICT(k) DO UPDATE SET n=CASE WHEN ?-t>900 THEN 1 ELSE n+1 END, t=?')->execute([$k, time(), time(), time()]);
  usleep(400000);
}
function cleanName($s): string {
  $s = trim((string)$s);
  if (!preg_match('/^[\p{L}\p{N}._@-]{3,40}$/u', $s)) fail('Name: 3–40 letters, numbers, . _ - @');
  return $s;
}

/* Central picture library: every picture is one file in ../media/lib/<sha1>.<ext> plus one row in `pictures`.
   name = {lang: text} so the library can be searched in any language. Older files in ../media/<uid>/ are registered too. */
function saveBin(PDO $db, string $bin, string $ext, int $uid, string $kind, array $name, array $CFG): array {
  $id = sha1($bin); $dir = __DIR__ . '/../media/lib';
  if (!is_dir($dir)) mkdir($dir, 0755, true);
  $f = "$id.$ext";
  if (!is_file("$dir/$f")) file_put_contents("$dir/$f", $bin, LOCK_EX);
  $url = rtrim($CFG['base'], '/') . "/media/lib/$f";
  regPic($db, $id, $url, $uid, $kind, $name);
  return ['id' => $id, 'url' => $url];
}
function regPic(PDO $db, string $id, string $url, int $uid, string $kind, array $name): void {
  $name = array_filter(array_map(fn($v) => mb_substr(trim((string)$v), 0, 80), $name), 'strlen');
  $st = $db->prepare('SELECT name,url FROM pictures WHERE id=?'); $st->execute([$id]); $r = $st->fetch();
  if (!$r) { $db->prepare('INSERT INTO pictures(id,url,owner,kind,shared,name,tags,created,used) VALUES(?,?,?,?,1,?,?,?,1)')
      ->execute([$id, $url, $uid, $kind, json_encode((object)$name, JSON_UNESCAPED_UNICODE), '{}', time()]); return; }
  $old = json_decode((string)$r['name'], true) ?: [];
  $new = $old + $name;   // keep names already there, add missing languages
  if ($new != $old) $db->prepare('UPDATE pictures SET name=? WHERE id=?')->execute([json_encode((object)$new, JSON_UNESCAPED_UNICODE), $id]);
}
function dataPic(string $v): ?array {
  if (!preg_match('#^data:image/(png|jpeg|jpg|webp|gif);base64,#', $v, $m)) return null;
  $bin = base64_decode(substr($v, strlen($m[0])), true);
  if ($bin === false || strlen($bin) > 8 * 1024 * 1024 || !@getimagesizefromstring($bin)) return ['bad' => 1];
  return ['bin' => $bin, 'ext' => $m[1] === 'jpeg' ? 'jpg' : $m[1]];
}
/* Turn data: pictures (words + stories) into library files; keep URLs; register every picture of the set. */
function storeImages(PDO $db, array &$set, int $uid, array $CFG): void {
  $base = rtrim($CFG['base'], '/') . '/media/';
  $L = lang($set['lang'] ?? 'en', 'en'); $M = lang($set['mt'] ?? 'th', 'th');
  $reg = function (string &$img, string $kind, array $name) use ($db, $uid, $CFG, $base) {
    if ($img === '') return;
    $d = dataPic($img);
    if ($d !== null) { if (isset($d['bad'])) { $img = ''; return; } $img = saveBin($db, $d['bin'], $d['ext'], $uid, $kind, $name, $CFG)['url']; return; }
    if (str_starts_with($img, $base) && preg_match('#/([0-9a-f]{40})\.(png|jpg|webp|gif)$#', $img, $m)) regPic($db, $m[1], $img, $uid, $kind, $name);
  };
  if (isset($set['words']) && is_array($set['words'])) foreach ($set['words'] as &$w) {
    if (!is_array($w) || !isset($w['img']) || !is_string($w['img'])) continue;
    $reg($w['img'], 'word', [$L => $w['w'] ?? '', $M => $w['m'] ?? '']);
  }
  unset($w);
  if (isset($set['stories']) && is_array($set['stories'])) foreach ($set['stories'] as &$s) {
    if (!is_array($s) || !isset($s['pic']) || !is_array($s['pic'])) continue;
    foreach (['img', 'orig'] as $k) if (isset($s['pic'][$k]) && is_string($s['pic'][$k])) $reg($s['pic'][$k], 'scene', [$L => $s['title'] ?? '', $M => $s['tr'][$M]['title'] ?? '']);
  }
  unset($s);
}

switch ($a) {
  case 'register': {
    if (!hash_equals((string)$CFG['invite'], (string)($in['invite'] ?? ''))) { usleep(600000); fail('Invite code is wrong', 403); }
    $n = cleanName($in['name'] ?? ''); $p = (string)($in['pass'] ?? '');
    if (strlen($p) < 8) fail('Password: at least 8 characters');
    try { $db->prepare('INSERT INTO users(name,pass,created) VALUES(?,?,?)')->execute([$n, password_hash($p, PASSWORD_DEFAULT), time()]); }
    catch (PDOException $e) { fail('That name is taken', 409); }
    $uid = (int)$db->lastInsertId();
    $mo = lang($in['mother'] ?? 'th', 'th'); $le = lang($in['learning'] ?? 'en', 'en');
    $db->prepare('UPDATE users SET mother=?, learning=? WHERE id=?')->execute([$mo, $le, $uid]);
    out(['tok' => newToken($db, $uid), 'name' => $n, 'mother' => $mo, 'learning' => $le]);
  }
  case 'login': {
    $n = trim((string)($in['name'] ?? '')); $p = (string)($in['pass'] ?? '');
    $k = strtolower($n) . '|' . ($_SERVER['REMOTE_ADDR'] ?? '');
    slow($db, $k);
    $st = $db->prepare('SELECT id,name,pass,mother,learning FROM users WHERE name=?'); $st->execute([$n]); $u = $st->fetch();
    if (!$u || !password_verify($p, $u['pass'])) { failed($db, $k); fail('Name or password is wrong', 401); }
    $db->prepare('DELETE FROM fails WHERE k=?')->execute([$k]);
    out(['tok' => newToken($db, (int)$u['id']), 'name' => $u['name'], 'mother' => $u['mother'] ?: 'th', 'learning' => $u['learning'] ?: 'en']);
  }
  case 'me': { $u = user($db); out(['name' => $u['name'], 'mother' => $u['mother'] ?: 'th', 'learning' => $u['learning'] ?: 'en']); }
  case 'prefs': {
    $u = user($db); $mo = lang($in['mother'] ?? $u['mother'], 'th'); $le = lang($in['learning'] ?? $u['learning'], 'en');
    $db->prepare('UPDATE users SET mother=?, learning=? WHERE id=?')->execute([$mo, $le, $u['id']]);
    out(['mother' => $mo, 'learning' => $le]);
  }
  case 'pics': {   // central picture library: ?q= (any language) &mine=1 &kind=word|scene
    $u = user($db); $q = mb_strtolower(trim((string)($_GET['q'] ?? ''))); $mine = !empty($_GET['mine']); $kind = (string)($_GET['kind'] ?? '');
    $sql = 'SELECT p.id,p.url,p.kind,p.name,p.owner,p.created,u.name AS by FROM pictures p LEFT JOIN users u ON u.id=p.owner WHERE (p.shared=1 OR p.owner=?)';
    $arg = [$u['id']];
    if ($mine) { $sql .= ' AND p.owner=?'; $arg[] = $u['id']; }
    if (in_array($kind, ['word', 'scene'], true)) { $sql .= ' AND p.kind=?'; $arg[] = $kind; }
    $st = $db->prepare($sql . ' ORDER BY p.created DESC LIMIT 2000'); $st->execute($arg);
    $list = [];
    foreach ($st as $r) {
      $nm = json_decode((string)$r['name'], true) ?: [];
      if ($q !== '' && mb_strpos(mb_strtolower(implode(' ', $nm) . ' ' . $r['by']), $q) === false) continue;
      $list[] = ['id' => $r['id'], 'url' => $r['url'], 'kind' => $r['kind'], 'name' => (object)$nm, 'by' => (string)$r['by'], 'mine' => (int)$r['owner'] === (int)$u['id']];
      if (count($list) >= 240) break;
    }
    out(['pics' => $list]);
  }
  case 'pic': {   // upload one picture to the library: {img: data:..., kind, name:{lang:text}}
    $u = user($db); $d = dataPic((string)($in['img'] ?? ''));
    if (!$d || isset($d['bad'])) fail('Not a picture');
    $nm = is_array($in['name'] ?? null) ? $in['name'] : [];
    $clean = []; foreach ($nm as $k => $v) $clean[lang($k, 'en')] = (string)$v;
    out(saveBin($db, $d['bin'], $d['ext'], (int)$u['id'], ($in['kind'] ?? '') === 'word' ? 'word' : 'scene', $clean, $CFG));
  }
  case 'logout': { $u = user($db); $db->prepare('DELETE FROM tokens WHERE tok=?')->execute([$u['tok']]); out(['ok' => 1]); }
  case 'list': {
    $u = user($db); $since = (int)($_GET['since'] ?? 0);
    $st = $db->prepare('SELECT id,data,updated,deleted FROM sets WHERE uid=? AND updated>? ORDER BY updated');
    $st->execute([$u['id'], $since]);
    $sets = []; $gone = [];
    foreach ($st as $r) { if ($r['deleted']) $gone[] = ['id' => $r['id'], 'updated' => (int)$r['updated']]; else $sets[] = json_decode($r['data'], true); }
    out(['sets' => $sets, 'gone' => $gone, 'now' => (int)round(microtime(true) * 1000)]);
  }
  case 'put': {
    $u = user($db); $s = $in['set'] ?? null;
    if (!is_array($s) || !isset($s['id']) || !preg_match('/^[A-Za-z0-9_-]{4,40}$/', (string)$s['id'])) fail('Bad set');
    $upd = (int)($s['updated'] ?? 0);
    $st = $db->prepare('SELECT data,updated,deleted FROM sets WHERE uid=? AND id=?'); $st->execute([$u['id'], $s['id']]); $old = $st->fetch();
    if ($old && (int)$old['updated'] > $upd) out(['set' => $old['deleted'] ? null : json_decode($old['data'], true), 'newer' => 1, 'deleted' => (int)$old['deleted']]);
    storeImages($db, $s, (int)$u['id'], $CFG);
    $json = json_encode($s, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if (strlen($json) > 4 * 1024 * 1024) fail('Set too big (store pictures as files)', 413);
    $db->prepare('INSERT INTO sets(uid,id,name,data,updated,deleted) VALUES(?,?,?,?,?,0) ON CONFLICT(uid,id) DO UPDATE SET name=excluded.name,data=excluded.data,updated=excluded.updated,deleted=0')
       ->execute([$u['id'], $s['id'], mb_substr((string)($s['name'] ?? ''), 0, 200), $json, $upd]);
    out(['set' => $s]);
  }
  case 'del': {
    $u = user($db); $id = (string)($in['id'] ?? ''); $upd = (int)($in['updated'] ?? round(microtime(true) * 1000));
    $db->prepare('INSERT INTO sets(uid,id,name,data,updated,deleted) VALUES(?,?,?,?,?,1) ON CONFLICT(uid,id) DO UPDATE SET data=\'{}\',updated=excluded.updated,deleted=1')
       ->execute([$u['id'], $id, '', '{}', $upd]);
    out(['ok' => 1]);
  }
  case 'log': {   // browser error reports (no sign-in); capped file in ../../logs
    $f = __DIR__ . '/../../logs/client.log';
    if (is_file($f) && filesize($f) > 5 * 1024 * 1024) out(['ok' => 0]);
    $row = ['t' => gmdate('c'), 'ip' => $_SERVER['REMOTE_ADDR'] ?? ''];
    foreach (['p' => 300, 'm' => 400, 's' => 300, 'l' => 12, 'c' => 12, 'st' => 1600, 'ua' => 300] as $k => $n) $row[$k] = mb_substr((string)($in[$k] ?? ''), 0, $n);
    file_put_contents($f, json_encode($row, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n", FILE_APPEND | LOCK_EX);
    out(['ok' => 1]);
  }
  case 'all': {   // every teacher's sets (summaries) for the "All vocab sets" page
    $u = user($db); $q = mb_strtolower(trim((string)($_GET['q'] ?? '')));
    $st = $db->query('SELECT s.uid,s.id,s.data,s.updated,u.name AS owner FROM sets s JOIN users u ON u.id=s.uid WHERE s.deleted=0 ORDER BY s.updated DESC LIMIT 1000');
    $list = [];
    foreach ($st as $r) {
      $d = json_decode($r['data'], true); if (!is_array($d)) continue;
      $words = is_array($d['words'] ?? null) ? $d['words'] : [];
      if ($q !== '') {
        $hay = mb_strtolower(($d['name'] ?? '') . ' ' . $r['owner'] . ' ' . implode(' ', array_map(fn($w) => is_array($w) ? (string)($w['w'] ?? '') : '', $words)));
        if (mb_strpos($hay, $q) === false) continue;
      }
      $lines = fn($t) => count(array_filter(array_map('trim', explode("\n", (string)$t)), 'strlen'));
      $list[] = ['u' => (int)$r['uid'], 'owner' => $r['owner'], 'mine' => (int)$r['uid'] === (int)$u['id'], 'id' => $r['id'],
        'name' => (string)($d['name'] ?? ''), 'icon' => (string)($d['icon'] ?? '📚'), 'updated' => (int)$r['updated'],
        'n' => ['w' => count($words), 's' => $lines($d['sen'] ?? ''), 'd' => $lines($d['dlg'] ?? ''), 't' => is_array($d['stories'] ?? null) ? count($d['stories']) : count(array_filter(preg_split('/\n\s*\n/', (string)($d['sto'] ?? '')), fn($b) => trim($b) !== ''))],
        'strip' => array_map(fn($w) => ['img' => (is_string($w['img'] ?? null) && str_starts_with($w['img'], 'http')) ? $w['img'] : '', 'e' => (string)($w['e'] ?? '')], array_slice(array_values(array_filter($words, 'is_array')), 0, 8))];
      if (count($list) >= 300) break;
    }
    out(['sets' => $list]);
  }
  case 'get': {   // one set from any teacher (to copy into my sets)
    user($db);
    $st = $db->prepare('SELECT s.data,u.name AS owner FROM sets s JOIN users u ON u.id=s.uid WHERE s.uid=? AND s.id=? AND s.deleted=0');
    $st->execute([(int)($_GET['u'] ?? 0), (string)($_GET['id'] ?? '')]); $r = $st->fetch();
    if (!$r) fail('Set not found', 404);
    out(['set' => json_decode($r['data'], true), 'owner' => $r['owner']]);
  }
  default: out(['app' => 'bokogo', 'ok' => 1]);
}
