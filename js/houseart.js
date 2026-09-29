// Art for houses and keepsakes: small pieces as ASCII pixel maps (merged into pixelart.js's
// DEFS, so they follow its palette conventions -- an UPPERCASE key is its lowercase color's
// highlight), and big rectilinear furniture plus the two building exteriors painted in code.

// ---------------------------------------------------------------- shared tones
const OUT = '#2e1e16';                                   // warm near-black outline
const WOOD = '#9a6a3c', WOOD_L = '#c08c56', WOOD_D = '#6a4428', WOOD_DD = '#4a2e1c';
const BRASS = '#d8a83a';

// ---------------------------------------------------------------- ASCII sprites
export const HOUSE_DEFS = {};
const D = HOUSE_DEFS;

// ---- keepsakes (8-11px, outlined, readable on a stand or on the ground) ----
D.ks_lure = { colors: { r: '#e04a4a', y: '#ffe066', d: '#3a1c1c', s: '#c8ccd4' }, map: [
  '..rR.rR..',
  '.rRrrRrr.',
  '..rrrrr..',
  '..dyYyd..',
  '...dyd...',
  '....s....',
  '.s..s....',
  '.ss.s....',
  '..sss....',
]};
D.ks_stone = { colors: { s: '#8a929c', d: '#3e4652' }, map: [
  '...dddd...',
  '..dSSSsd..',
  '.dSsddssd.',
  '.dsd..dsd.',
  '.dsd..dsd.',
  '.dssddssd.',
  '..dssssd..',
  '...dddd...',
]};
D.ks_boomerang = { colors: { w: '#c08a4a', d: '#4a2a14', y: '#ffe066', r: '#e04a4a' }, map: [
  '.dd........',
  'dWwd.......',
  'dwWyd......',
  '.dwwyd.dddd',
  '..dwrwdWWyd',
  '..dwwywwwd.',
  '...dwwwdd..',
  '....ddd....',
]};
D.ks_bottle = { colors: { g: '#7ac8c0', d: '#1e4a4a', c: '#b07838', p: '#f0e6c8' }, map: [
  '...cc...',
  '...dd...',
  '..dggd..',
  '.dgGppd.',
  '.dgppgd.',
  '.dGppgd.',
  '.dgppgd.',
  '.dggggd.',
  '..dddd..',
]};
D.ks_egg = { colors: { e: '#f0d8b0', s: '#d8603a', d: '#6a3420' }, map: [
  '..ddd..',
  '.dEEed.',
  'dEesesd',
  'deeeeed',
  'dseesed',
  'deeseed',
  '.desed.',
  '..ddd..',
]};
D.ks_opal = { colors: { o: '#2e3a78', r: '#ff6a3a', g: '#4ae08a', b: '#6ad0ff', y: '#ffe066', d: '#141836', w: '#ffffff' }, map: [
  '..dddd..',
  '.dbwgod.',
  'dorgbyod',
  'dgoyrbgd',
  'dybgorbd',
  '.dygrbd.',
  '..dddd..',
]};
D.ks_arrowhead = { colors: { k: '#3a3048', d: '#100c18', h: '#9a8ab8' }, map: [
  '...dd...',
  '..dhkd..',
  '..dhkd..',
  '.dhkkkd.',
  '.dhkkkd.',
  'dhkkkkkd',
  'dkkddkkd',
  'dd....dd',
]};
D.ks_pearl = { colors: { p: '#ffc8dc', w: '#ffffff', k: '#d890b0', s: '#c8b8d8', d: '#5a4a6a' }, map: [
  '...ddd...',
  '..dwPpd..',
  '.dwPpppd.',
  '.dPppppd.',
  '.dppppkd.',
  '..dpkkd..',
  'dssdddssd',
  'dSsSsSssd',
  '.ddddddd.',
]};
D.ks_seaglass = { colors: { g: '#6ac8a0', b: '#6aa8e0', d: '#1e4a4a', w: '#e0fff0' }, map: [
  '.ddd.....',
  'dwGgd....',
  'dGggd.dd.',
  'dgggddbwd',
  '.ddd.dBbd',
  '.....dbbd',
  '......dd.',
]};
D.ks_compass = { colors: { g: BRASS, d: '#5a3a10', w: '#f0ead8', r: '#e04a4a', k: '#303040' }, map: [
  '...dd...',
  '..d..d..',
  '.dGggGd.',
  'dgwwwrgd',
  'dgwwrwgd',
  'dgwkwwgd',
  'dgkwwwgd',
  '.dgggGd.',
  '..dddd..',
]};
D.ks_kite = { colors: { r: '#e04a4a', y: '#ffe066', d: '#5a1422', w: '#e8dcc0' }, map: [
  '...d....',
  '..dRd...',
  '.dRryd..',
  'drryyrd.',
  '.dryrd..',
  '..drd...',
  '...d....',
  '...w....',
  '....y...',
  '...w....',
  '...r....',
]};
D.ks_meteor = { colors: { m: '#5a5a6e', d: '#1e1e2c', b: '#7ad4ff' }, map: [
  '..ddd...',
  '.dMmmd..',
  'dMmbmmd.',
  'dmmmmbmd',
  'dmbmmmmd',
  '.dmmbmd.',
  '..dddd..',
]};
D.ks_feather = { colors: { y: '#ffd84a', o: '#d8902a', d: '#6a3e10', w: '#fff6c8' }, map: [
  '......ddd.',
  '.....dyyyd',
  '....dyywod',
  '...dyywyod',
  '..dyywyod.',
  '..dywyyod.',
  '.dywyod...',
  '.dwod.....',
  'dwd.......',
  'dd........',
]};
D.ks_mushroom = { colors: { c: '#3ec87a', w: '#e8ffe0', s: '#e8dcc0', d: '#12462c' }, map: [
  '..dddd..',
  '.dCwCcd.',
  'dcCccwcd',
  'dcwcccwd',
  '.dddddd.',
  '..dssd..',
  '..dssd..',
  '.dsSssd.',
  '..dddd..',
]};
D.ks_amber = { colors: { a: '#f0a830', d: '#7a3e08', k: '#4a2408', w: '#fff0c0' }, map: [
  '...dd...',
  '..dAad..',
  '.dAwaad.',
  'dAaakaad',
  'dakkkad.',
  'daakaad.',
  '.daaad..',
  '..ddd...',
]};
D.ks_fossil = { colors: { s: '#c8b8a0', d: '#5a4a38', k: '#8a7a62' }, map: [
  '...ddd...',
  '.ddSSsdd.',
  'dSskkkssd',
  'dskssskkd',
  'dsksdkskd',
  'dskkkkskd',
  'dssssssd.',
  '.ddssdd..',
  '...dd....',
]};
D.ks_coin = { colors: { g: '#e9b64c', d: '#6a3e1a', h: '#fff0b5', k: '#a8742a' }, map: [
  '..dddddd..',
  '.dgHHgggd.',
  'dHgkgkgkgd',
  'dHgkkkkkgd',
  'dggkkkkkgd',
  'dgggggggkd',
  '.dgggggkd.',
  '..dddddd..',
]};
D.ks_thunder = { colors: { s: '#8a8298', d: '#2e2838', p: '#b07ae0', w: '#f4e8ff', v: '#6a3aa0' }, map: [
  '..dddd..',
  '.dsSssd.',
  'dsvpwvsd',
  'dspwpvsd',
  'dsvppvsd',
  '.dsvvsd.',
  '..dddd..',
]};
D.ks_trophy = { colors: { g: '#f0c83a', d: '#6a4a10', h: '#fff6c8', k: '#b08a20', b: '#6a4a2a' }, map: [
  '..dddddddd..',
  'dddhGgggkddd',
  'd.dGggggkd.d',
  'd.dGggggkd.d',
  '.ddgggggkdd.',
  '...dgggkd...',
  '....dgkd....',
  '....dgkd....',
  '...dbbbbd...',
  '..dbbbbbbd..',
  '..dddddddd..',
]};
D.ks_drawing = { colors: { p: '#f4eee0', d: '#6a4a2a', b: '#4a6ad8', r: '#e04a4a', g: '#5ab04a', y: '#ffd84a', k: '#946044' }, map: [
  'dddddddddd',
  'dppypppbpd',
  'dpypkkppbd',
  'dppkkkrrpd',
  'dppkkpprpd',
  'dpkpkpprpd',
  'dggggggggd',
  'dddddddddd',
]};

// ---- small furniture and wall hangings ----
D.plant = { colors: { g: '#4a8a4a', l: '#7ab86a', d: '#1e3a22', p: '#b86a44', k: '#6e3a24' }, map: [
  '....l.......',
  '..l.gl..l...',
  '...ggl.gl...',
  '.l.dgglgd...',
  '..gdlggdgl..',
  '.lggdgdgg...',
  '..dgggggd...',
  '.dkkkkkkkd..',
  '.dpPpppppd..',
  '..dpppppd...',
  '..dpppppd...',
  '...dkkkd....',
]};
D.stool = { colors: { w: WOOD, d: OUT, k: WOOD_D }, map: [
  '.dddddd.',
  'dWWWWWWd',
  'dwwwwwwd',
  '.dkddkd.',
  '.dk..kd.',
  '.dd..dd.',
]};
D.basket = { colors: { w: '#c8a060', k: '#8a6a34', d: OUT, t: '#3f8c86', s: '#c8ccd4' }, map: [
  '.......s....',
  '..tt..s.....',
  '.tTttst.....',
  'dtttttttd...',
  'dwkwkwkwd...',
  'dkwkwkwkd...',
  '.dwkwkwd....',
  '..ddddd.....',
]};
D.armchair = { colors: { r: '#a8443a', d: OUT, w: WOOD_D, k: '#7a2e28' }, map: [
  '..dddddddddd..',
  '.dRRRRRRRRRRd.',
  '.drrrrrrrrrrd.',
  'ddrrrrrrrrrrdd',
  'dRdrrrrrrrrdRd',
  'drdkkkkkkkkdrd',
  'drdRRRRRRRRdrd',
  'drdrrrrrrrrdrd',
  'dkdkkkkkkkkdkd',
  'dddddddddddddd',
  '.dw........wd.',
]};
D.rocker = { colors: { w: WOOD, d: OUT, k: WOOD_D, c: '#e8a0b8' }, map: [
  '...dddddddd...',
  '..dwWWWWWWwd..',
  '..dwkwkwkwkd..',
  '..dwkwkwkwkd..',
  '..dwkwkwkwkd..',
  '..dwwwwwwwwd..',
  '.dccccccccccd.',
  '.dCCccccccCCd.',
  '.dwwwwwwwwwwd.',
  '..dkd....dkd..',
  '..dkd....dkd..',
  'd.dkd....dkd.d',
  '.dddddddddddd.',
]};
// a cuckoo clock: a little wooden house with a pendulum and pine-cone weights
D.clock = { colors: { w: WOOD, d: OUT, k: WOOD_D, r: '#5a3a24', f: '#f0ead8', h: '#303040', g: BRASS }, map: [
  '.....dd.....',
  '....dRrd....',
  '...dRrrrd...',
  '..dRrrrrrd..',
  '.dRrrrrrrrd.',
  'dddddddddddd',
  '.dwwdkkdwwd.',
  '.dwwdkkdwwd.',
  '.dwdffffdwd.',
  '.dwfhffffwd.',
  '.dwffhhffwd.',
  '.dwdffffdwd.',
  '.dddddddddd.',
  '....g..g....',
  '....g..g....',
  '...dgd.dgd..',
  '...dgd.dgd..',
  '....d...d...',
]};
D.lamp = { colors: { d: OUT, m: '#5a5a66', y: '#ffe08a', w: '#fff6d0' }, map: [
  '...dd...',
  '...dd...',
  '.dddddd.',
  '.dmmmmd.',
  'dmyyyymd',
  'dmywwymd',
  'dmyyyymd',
  '.dmmmmd.',
  '..dddd..',
]};
D.plaque = { colors: { w: WOOD, d: OUT, g: '#f0c83a', k: WOOD_D }, map: [
  '.dddddddddddd.',
  'dWWWWWWWWWWWWd',
  'dwwwwwgwwwwwkd',
  'dwwwwgggwwwwkd',
  'dwwgggggggwwkd',
  'dwwwwgggwwwwkd',
  'dwwwgwwwgwwwkd',
  'dwwwwwwwwwwwkd',
  'dkkkkkkkkkkkkd',
  '.dddddddddddd.',
]};
D.swordrack = { colors: { w: WOOD, d: OUT, k: WOOD_D, s: '#7a5a3c', p: '#c8ccd4' }, map: [
  '.dddddddddddddd.',
  'dWWWWWWWWWWWWWWd',
  'dwpwwwwwwwwwwpwd',
  'dwpwsssssssswpwd',
  'dwwwswwwwwwswwwd',
  'dwwwsssssssswwwd',
  'dkkkkkkkkkkkkkkd',
  '.dddddddddddddd.',
]};
D.heightchart = { colors: { p: '#efe4c8', d: OUT, k: '#6a5a4a', r: '#d8704a', b: '#4a6ad8' }, map: [
  'ddddddd',
  'dpbbbpd',
  'dpppppd',
  'dkpkkpd',
  'dpppppd',
  'dkpppkd',
  'dpppppd',
  'dkkpppd',
  'dpppppd',
  'dkkkppd',
  'dpppppd',
  'dkprrpd',
  'dpppppd',
  'dkpppkd',
  'dpppppd',
  'dkkkkpd',
  'dpppppd',
  'dkpppkd',
  'dpppppd',
  'ddddddd',
]};
D.growthchart = { colors: { p: '#fde8f0', d: '#8a4a5e', k: '#d8708e', y: '#ffd84a' }, map: [
  'ddddddd',
  'dpyyypd',
  'dpppppd',
  'dpppppd',
  'dpppppd',
  'dpppppd',
  'dpppppd',
  'dpppppd',
  'dpppppd',
  'dpppppd',
  'dpppppd',
  'dpppppd',
  'dkkkkkd',
  'dkkkkkd',
  'dkkkkkd',
  'dpppppd',
  'dpppppd',
  'ddddddd',
]};
D.portrait = { colors: { d: OUT, g: '#c8a03a', s: '#a8d8e8', h: '#6a9a5a', b: '#946044', l: '#e2b879', o: '#e9ad52', e: '#201d2c', m: '#d8708e', t: '#388c86' }, map: [
  'dddddddddddddddd',
  'dGGGGGGGGGGGGGGd',
  'dGssssssssssssgd',
  'dGsbbbsssssbbbgd',
  'dGbbebosssobebgd',
  'dGbbbbsssssbbbgd',
  'dGsbtbssssbmbsgd',
  'dGsbllbhhblbbbgd',
  'dGhbllbhbbbblbgd',
  'dGhbllbhhbbllbgd',
  'dGhhbbhhhhbbhhgd',
  'dGhhhhhhhhhhhhgd',
  'dggggggggggggggd',
  'dddddddddddddddd',
]};
D.portrait2 = { colors: { d: OUT, g: '#8a8078', s: '#c8d8e8', b: '#a06a3a', l: '#d8b088', o: '#e9ad52', e: '#201d2c', y: '#f0c83a', h: '#5e7e96' }, map: [
  'dddddddddddd',
  'dGGGGGGGGGGd',
  'dGssssssssgd',
  'dGssbbbsssgd',
  'dGsbbebossgd',
  'dGsbbbbbssgd',
  'dGssbllbssgd',
  'dGsbbllbbsgd',
  'dGsbllllybgd',
  'dGhbllllbhgd',
  'dGhhbbbbhhgd',
  'dggggggggggd',
  'dddddddddddd',
]};
D.puggleportrait = { colors: { d: OUT, g: '#e8a0b8', s: '#fff0f4', b: '#8a5a44', m: '#e27aa4', o: '#e9ad52', p: '#b07a52', k: '#d6a878', c: '#7a4a30' }, map: [
  'dddddddddddddddddd',
  'dGGGGGGGGGGGGGGGGd',
  'dGsssssbbbssssssgd',
  'dGssssbbbbosssssgd',
  'dGsssssbmmbssssssd',
  'dGssssbmmmmbsssssd',
  'dGspospkospcospssd',
  'dGsppsskkspccsppsd',
  'dGsspospcospkospgd',
  'dGsskksppsskksccgd',
  'dGssssssssssssssgd',
  'dggggggggggggggggd',
  'dddddddddddddddddd',
]};
D.kidart = { colors: { p: '#f4eee0', d: '#8a7a6a', b: '#6aa8e0', k: '#3a5a90', r: '#e04a4a', y: '#ffd84a' }, map: [
  '..r........r..',
  'dddddddddddddd',
  'dpppppppyypppd',
  'dpppppppyypppd',
  'dpppbbbbpppppd',
  'dppbbbbbbpbppd',
  'dpbbkbbbbbbppd',
  'dpbbbbbbbpbppd',
  'dppbbbbbbppppd',
  'dpppppppppkkpd',
  'dddddddddddddd',
]};
D.mountedfish = { colors: { w: WOOD, d: OUT, f: '#6a9a8a', l: '#b8d8c8', e: '#111', k: '#3a6a5a' }, map: [
  '.dddddddddddddddddd.',
  'dWWWWWWWWWWWWWWWWWWd',
  'dwwddwwwwwwwwwwwddwd',
  'dwdffdddddddddddfdwd',
  'dwdffFffffffffeffdwd',
  'dwwdfllllllllfffdwwd',
  'dwdffkkkkkkkkkffdwwd',
  'dwdkdddddddddddddwwd',
  'dwwwwwwwwwwwwwwwwwwd',
  '.dddddddddddddddddd.',
]};
D.net = { colors: { n: '#c8b890', d: '#6a5a3a', w: WOOD_D, f: '#e9ad52' }, map: [
  'wwwwwwwwwwwwwwww',
  '.n..n..n..n..n..',
  'n.nn.nn.nn.nn.n.',
  '.n..n..n..n..n..',
  'n.nn.nn.nn.nn.n.',
  '.n..n..n...f.n..',
  '.n.nn.nn...fn...',
  '..n..n..n.nn....',
  '...n..n..n......',
  '....nn.nn.......',
  '......n.........',
]};
D.crochead = { colors: { g: '#4e7a44', d: '#1e3020', l: '#9db86a', w: '#f0ead8', e: '#e0b23a', b: WOOD, k: WOOD_D }, map: [
  '..dddddddddddd..',
  '.dbbbbbbbbbbbbd.',
  '.dbdddddbbbbbbd.',
  '.dbdgGgddddddbd.',
  '.dbdgegggGGggdd.',
  '.dbdgggggggggld.',
  '.dbdwgwgwgwgwld.',
  '.dbddddddddddd..',
  '.dkkkkkkkkkkkd..',
  '..ddddddddddd...',
]};
D.books = { colors: { d: OUT, r: '#a8443a', b: '#4a6ab0', g: '#5a8a4a', y: '#d8b040', p: '#efe4c8' }, map: [
  '...dddddddd...',
  '..dyyyyyyyyd..',
  '..dpppppppyd..',
  '.ddddddddddd..',
  '.dbbbbbbbbbbd.',
  '.dBbbbbbbbbpd.',
  'ddddddddddddd.',
  'drrrrrrrrrrrd.',
  'dRrrrrrrrrrpd.',
  'dddddddddddddd',
  'dgggggggggggpd',
  'dddddddddddddd',
]};
D.telescope = { colors: { g: BRASS, d: '#4a3010', k: '#303040', w: WOOD_D, l: '#bfe0f0' }, map: [
  '..........dd',
  '........ddgl',
  '......ddgGgd',
  '....ddgGggd.',
  '..ddkgGgdd..',
  '.dkkgggd....',
  '.dkkdd......',
  '..d.dw......',
  '....ww......',
  '...w.w......',
  '...w..w.....',
  '..w...w.....',
  '..w....w....',
  '.dd....dd...',
]};
D.fishbowl = { colors: { g: '#a8d8f0', d: '#3a6a8a', o: '#f08a2a', w: '#ffffff', k: WOOD_D }, map: [
  '...dddddd...',
  '..dwggggwd..',
  '.dwggggggwd.',
  '.dgggoggggd.',
  '.dggoOoogwd.',
  '.dgggoggggd.',
  '..dggggggd..',
  '...dddddd...',
  '...dkkkkd...',
  '....dkkd....',
  '....dkkd....',
  '...dkkkkd...',
]};
D.ringbox = { colors: { r: '#8a2a4a', d: '#3a1020', k: '#5a1a30', v: '#2a1a24' }, map: [
  '.dddddddd.',
  'dRRRRRRRRd',
  'drvvvvvvrd',
  'drvvvvvvrd',
  'dddddddddd',
  'drkrrrrkrd',
  'drrrrrrrrd',
  'dddddddddd',
]};
D.ringbox_full = { colors: { r: '#8a2a4a', d: '#3a1020', k: '#5a1a30', v: '#2a1a24', g: '#f0c83a', h: '#fff6c8' }, map: [
  '.dddddddd.',
  'dRRRRRRRRd',
  'drvvggvvrd',
  'drvgvhgvrd',
  'dddgddgddd',
  'drkrggrkrd',
  'drrrrrrrrd',
  'dddddddddd',
]};
D.pedestal = { colors: { w: WOOD, d: OUT, k: WOOD_D, g: '#c8a03a' }, map: [
  'dddddddddddd',
  'dWWWWWWWWWWd',
  'dgggggggggkd',
  '.dkkkkkkkkd.',
  '..dwwwwwkd..',
  '..dwWwwwkd..',
  '..dwWwwwkd..',
  '..dwwwwwkd..',
  '.dkkkkkkkkd.',
  'dwwwwwwwwwkd',
  'dddddddddddd',
]};
D.emptycard = { colors: { p: '#d8ccb0', d: '#6a5a4a', k: '#7a6a54' }, map: [
  'ddddddd',
  'dpkkkpd',
  'dppppkd',
  'dppkkpd',
  'dppkppd',
  'dpppppd',
  'dppkppd',
  'ddddddd',
]};
D.armorstand = { colors: { w: WOOD, d: OUT, k: WOOD_D, m: '#5a7a9a', h: '#8aa8c8', s: '#3a5270' }, map: [
  '....dddd....',
  '...dwWwwd...',
  '...dwwwwd...',
  '....dwwd....',
  '.ddddddddd..',
  'dmhmhmhmhmd.',
  'dhmhmhmhmsd.',
  'dmhmhmhmhsd.',
  '.dmhmhmhsd..',
  '.dhmhmhmsd..',
  '.dmhmhmssd..',
  '..ddddddd...',
  '.....wk.....',
  '.....wk.....',
  '.....wk.....',
  '...dddddd...',
  '..dkkkkkkd..',
  '..dddddddd..',
]};
D.toybox = { colors: { w: '#c0703a', d: OUT, k: '#8a4a24', y: '#ffd84a', b: '#4a8ad8', r: '#e04a4a', g: '#5ab04a' }, map: [
  '....r..b.....',
  '..y.rr.bb.g..',
  '.yyyrrbbbggg.',
  'ddddddddddddd',
  'dWWWWWWWWWWWd',
  'dwwwwyywwwwkd',
  'dwwwyyyywwwkd',
  'dwwwwyywwwwkd',
  'dkkkkkkkkkkkd',
  'ddddddddddddd',
]};
D.crib = { colors: { w: '#e8c8a0', d: '#6a4a3a', k: '#b89070', p: '#f8e0ea', b: '#a8d0f0' }, map: [
  'dd............dd',
  'dwddddddddddddwd',
  'dwWWWWWWWWWWWWwd',
  'dwWwwwwwwwwwwWwd',
  'dwwwwwwwwwwwwwwd',
  'dwddddddddddddwd',
  'dwppppppbbbbbbwd',
  'dwpPPppbbBbbbbwd',
  'dwppppbbbbbbbbwd',
  'dWddddddddddddWd',
  'dwkbkbkbkbkbkbwd',
  'dwkbkbkbkbkbkbwd',
  'dwkbkbkbkbkbkbwd',
  'dWddddddddddddWd',
  'dd............dd',
]};

// Tully the echidna: a curio collector with a snout for sniffing out treasure and a pair
// of spectacles perched on it. Faces right like every sprite.
D.tully = { colors: { d: '#241a1e', b: '#5a4232', s: '#efe0c0', k: '#3a2c24', f: '#b08458', e: '#111', g: '#c8e0f0', o: '#6a5040' }, map: [
  '....s..s.s......',
  '..s.ks.ksks.....',
  '.sksksksksks....',
  'skkskkskkksks...',
  '.kskkskkskskd...',
  'skkkskkskkkdfd..',
  '.kskkkskkskdffd.',
  'skkkskkkkkdfgggd',
  '.kkskkkskkdfgeg.',
  'skkkkskkkkdffgff',
  '.dkkkkkkkbbfffff',
  '..dkkkkkbbbbd.dd',
  '...dbbbbbbbbd...',
  '...dbbbbbbbd....',
  '....do.dod......',
  '....oo..oo......',
]};

// ---------------------------------------------------------------- painted sprites
function canvasSprite(w, h, paint) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const px = (x, y, col, ww = 1, hh = 1) => { g.fillStyle = col; g.fillRect(x, y, ww, hh); };
  paint(px, g);
  return { canvas: c, w, h };
}
// tiny seeded rng so painted clutter (book spines, grass tufts) is the same every load
function lcg(seed) {
  let s = seed >>> 0;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}
// a pixel-exact filled ellipse, for the burrow mound and round windows
function ellipse(px, cx, cy, rx, ry, col, clipBottom = Infinity) {
  for (let y = Math.ceil(cy - ry); y <= cy + ry; y++) {
    if (y >= clipBottom) break;
    const t = 1 - ((y - cy) / ry) ** 2;
    if (t < 0) continue;
    const half = Math.round(rx * Math.sqrt(t));
    px(Math.round(cx - half), y, col, half * 2, 1);
  }
}
// an outlined wooden cabinet body, shared by the bookshelf, curio cabinet and pebble shelf
function carcass(px, w, h) {
  px(0, 0, OUT, w, h);
  px(1, 1, WOOD, w - 2, h - 2);
  px(1, 1, WOOD_L, w - 2, 1);
  px(1, h - 3, WOOD_D, w - 2, 2);
}
const BOOK_COLORS = ['#a8443a', '#4a6ab0', '#5a8a4a', '#d8b040', '#8a4a8a', '#3a8a86', '#c8703a', '#e8dcc0'];
function bookRow(px, rnd, x0, x1, yBottom, maxH) {
  for (let x = x0; x < x1;) {
    const bw = 2 + Math.floor(rnd() * 2), bh = maxH - Math.floor(rnd() * 3);
    if (x + bw > x1) break;
    if (rnd() < 0.12) { x += 2; continue; }               // a gap on the shelf
    const col = BOOK_COLORS[Math.floor(rnd() * BOOK_COLORS.length)];
    px(x, yBottom - bh, col, bw, bh);
    px(x, yBottom - bh + 1, '#ffffff40', bw, 1);          // a band on the spine
    px(x + bw - 1, yBottom - bh, '#00000040', 1, bh);     // spine shadow
    x += bw;
  }
}

function buildBookshelf(seed = 7) {
  return canvasSprite(32, 38, (px) => {
    const rnd = lcg(seed);
    carcass(px, 32, 38);
    px(3, 3, WOOD_DD, 26, 30);                             // back panel
    for (const y of [12, 22, 32]) { px(2, y, WOOD_D, 28, 2); px(2, y, WOOD_L, 28, 1); }
    bookRow(px, rnd, 3, 29, 12, 8);
    bookRow(px, rnd, 3, 29, 22, 8);
    bookRow(px, rnd, 3, 29, 32, 8);
    px(0, 36, OUT, 32, 2);
  });
}
function buildCabinet() {
  return canvasSprite(32, 38, (px) => {
    carcass(px, 32, 38);
    px(3, 3, '#2a2030', 26, 30);
    for (const y of [13, 23, 33]) { px(2, y, WOOD_D, 28, 2); px(2, y, WOOD_L, 28, 1); }
    // top shelf: a bottled cloud, a skull-ish rock, a spiral shell
    px(5, 6, '#c8e0f0', 5, 7); px(6, 5, '#b07838', 3, 1); px(6, 8, '#ffffff', 3, 2);
    px(13, 8, '#d8d0c0', 6, 5); px(14, 9, OUT, 1, 1); px(17, 9, OUT, 1, 1);
    px(22, 8, '#f0c8d8', 5, 5); px(23, 9, '#c88aa0', 3, 3); px(24, 10, '#f0c8d8');
    // middle: a spoon, a crayfish-shaped rock, a jar of marbles
    px(5, 17, '#c8ccd4', 1, 6); px(4, 16, '#c8ccd4', 3, 2);
    px(10, 19, '#8a8078', 7, 4); px(9, 18, '#8a8078', 2, 2); px(16, 18, '#8a8078', 2, 2);
    px(21, 16, '#a8d8e8', 6, 7); px(22, 19, '#e04a4a'); px(24, 20, '#ffd84a'); px(23, 21, '#4a6ab0'); px(25, 18, '#5ab04a');
    // bottom: a hourglass and a tiny chest
    px(5, 26, BRASS, 5, 1); px(6, 27, '#f0e0b0', 3, 2); px(7, 29, '#f0e0b0'); px(6, 30, '#e8c880', 3, 2); px(5, 32, BRASS, 5, 1);
    px(15, 28, '#8a5a2a', 10, 5); px(15, 28, '#b07838', 10, 1); px(19, 30, '#f0c83a', 2, 1);
    // glass doors catch the light
    px(3, 3, '#ffffff22', 1, 30); px(16, 3, '#00000033', 1, 30); px(17, 3, '#ffffff22', 1, 30);
    px(0, 36, OUT, 32, 2);
  });
}
function buildPebbleShelf() {
  return canvasSprite(32, 22, (px) => {
    carcass(px, 32, 22);
    px(3, 3, WOOD_DD, 26, 15);
    px(2, 10, WOOD_D, 28, 2); px(2, 10, WOOD_L, 28, 1);
    // thirty-seven pebbles that all look exactly the same
    for (const [y0, n] of [[6, 7], [15, 7]]) {
      for (let i = 0; i < n; i++) {
        const x = 4 + i * 4;
        px(x, y0, '#8a929c', 3, 3); px(x, y0, '#b8c0c8'); px(x + 2, y0 + 2, '#5a626c');
      }
    }
    px(0, 20, OUT, 32, 2);
  });
}
function buildFireplace(frame) {
  return canvasSprite(32, 36, (px) => {
    const st = '#8a8078', stL = '#aaa096', stD = '#5a524c';
    px(4, 0, OUT, 24, 12);                                 // chimney breast
    px(5, 1, st, 22, 11);
    for (let y = 1; y < 12; y += 4) for (let x = 5 + (y % 8 ? 0 : 3); x < 27; x += 6) { px(x, y, stL, 5, 1); px(x + 5, y, stD, 1, 3); }
    px(0, 11, OUT, 32, 4);                                 // mantle
    px(1, 12, WOOD_L, 30, 1); px(1, 13, WOOD_D, 30, 1);
    px(6, 7, '#f0ead8', 2, 4); px(6, 5, frame ? '#ffe08a' : '#ffb84a', 2, 2);   // candle
    px(22, 6, '#6aa8c8', 4, 5); px(22, 6, '#bfe0f0', 1, 3);                      // a jar
    px(1, 15, OUT, 30, 21);                                // surround
    px(2, 15, st, 28, 18);
    for (let y = 16; y < 33; y += 4) { px(2, y, stL, 3, 1); px(27, y + 2, stL, 3, 1); px(4, y + 2, stD, 1, 2); }
    px(7, 19, '#1a1010', 18, 14); px(8, 18, '#1a1010', 16, 1); px(10, 17, '#1a1010', 12, 1);   // firebox
    px(9, 30, '#6e4628', 14, 3); px(9, 30, '#8a5a34', 14, 1);                                   // logs
    const fl = frame ? [[10, 24, 3, 6], [14, 21, 4, 9], [19, 25, 3, 5]] : [[11, 23, 3, 7], [15, 22, 3, 8], [18, 24, 4, 6]];
    for (const [x, y, w, h] of fl) { px(x, y, '#ff7a2a', w, h); px(x + 1, y + 2, '#ffc84a', w - 1, h - 2); px(x + 1, y + h - 3, '#fff0a0', Math.max(1, w - 2), 2); }
    px(0, 33, stD, 32, 3); px(1, 33, stL, 30, 1);         // hearth
  });
}
function buildStove(frame) {
  return canvasSprite(32, 28, (px) => {
    px(22, 0, OUT, 5, 8); px(23, 0, '#4a4a56', 3, 8);      // flue
    px(0, 8, OUT, 32, 20); px(1, 9, '#3a3a46', 30, 17);    // body
    px(1, 9, '#5a5a66', 30, 2);                            // top plate
    px(6, 4, OUT, 12, 6); px(7, 5, '#8a929c', 10, 4); px(7, 5, '#b8c0c8', 10, 1);   // pot
    px(4, 6, OUT, 3, 1); px(17, 6, OUT, 3, 1);
    px(9, frame ? 1 : 2, '#e8f0f8aa', 2, 2); px(13, frame ? 2 : 0, '#e8f0f8aa', 2, 2);   // steam
    px(5, 15, OUT, 12, 8); px(6, 16, frame ? '#ff9a3a' : '#ff7a2a', 10, 6); px(7, 18, '#ffd84a', 8, 3);   // firebox
    px(21, 15, '#5a5a66', 7, 8); px(22, 18, '#8a929c', 5, 1);
    px(2, 26, OUT, 3, 2); px(27, 26, OUT, 3, 2);
  });
}
function buildTable(kind) {
  const low = kind === 'low';
  const W = 32, H = low ? 14 : 18, top = low ? 8 : 11;
  return canvasSprite(W, H, (px) => {
    px(0, 0, OUT, W, top);
    px(1, 1, WOOD_L, W - 2, top - 4); px(1, top - 3, WOOD, W - 2, 2);
    px(1, 2, '#ffffff22', W - 2, 1);
    px(2, top, OUT, 3, H - top); px(3, top, WOOD_D, 1, H - top - 1);
    px(W - 5, top, OUT, 3, H - top); px(W - 4, top, WOOD_D, 1, H - top - 1);
    if (low) {
      // a row of tiny bowls, each with a dab of mash
      for (let i = 0; i < 6; i++) { const x = 3 + i * 5; px(x, 2, '#f0ead8', 4, 2); px(x + 1, 2, '#8a6a4a', 2, 1); px(x, 4, '#c8b8a0', 4, 1); }
    } else {
      px(5, 2, '#f0ead8', 9, 4); px(6, 3, '#d84a2a', 3, 2); px(10, 3, '#d84a2a', 2, 2);   // plate of crayfish
      px(19, 1, '#4a6ab0', 5, 5); px(24, 2, '#4a6ab0', 1, 3); px(20, 1, '#8ab0e0', 3, 1); // mug
    }
  });
}
function buildCounter() {
  return canvasSprite(80, 28, (px) => {
    px(0, 8, OUT, 80, 20);
    px(1, 9, WOOD_L, 78, 4); px(1, 13, WOOD, 78, 2);       // counter top
    px(1, 15, WOOD_D, 78, 12);                             // front
    for (let i = 0; i < 5; i++) { px(3 + i * 15, 17, WOOD, 13, 8); px(3 + i * 15, 17, WOOD_L, 13, 1); px(4 + i * 15, 18, WOOD_D, 11, 6); }
    // till, a bell, a bundle of arrows and a jar of snacks -- the middle (x 30-50) stays
    // clear, since that's where Wombeau peeks over the counter
    px(8, 0, OUT, 14, 11); px(9, 1, '#8a929c', 12, 9); px(10, 2, '#303040', 5, 3); px(16, 2, '#f0c83a', 4, 1); px(16, 4, '#f0c83a', 4, 1);
    px(9, 6, '#b8c0c8', 12, 1);
    px(24, 6, BRASS, 5, 3); px(25, 5, BRASS, 3, 1); px(26, 4, '#fff0a0'); px(23, 9, '#8a6a2a', 7, 1);
    px(50, 2, '#a0764a', 1, 8); px(52, 3, '#a0764a', 1, 7); px(54, 2, '#a0764a', 1, 8);
    px(49, 1, '#c8c8d0', 7, 1); px(50, 7, '#d84a2a', 5, 2);
    px(64, 3, OUT, 8, 8); px(65, 4, '#bfe0f0', 6, 6); px(66, 6, '#d84a2a', 4, 3); px(65, 3, '#b07838', 6, 1);
  });
}
function buildWeaponRack() {
  return canvasSprite(32, 18, (px) => {
    px(0, 2, OUT, 32, 14); px(1, 3, WOOD, 30, 12); px(1, 3, WOOD_L, 30, 1);
    // two swords crossed with a bow between
    for (let i = 0; i < 11; i++) { px(4 + i, 13 - i, '#c8ccd4', 1, 1); px(27 - i, 13 - i, '#c8ccd4', 1, 1); }
    px(3, 12, '#8a5a2a', 3, 3); px(26, 12, '#8a5a2a', 3, 3); px(4, 11, '#f0c83a', 3, 1); px(25, 11, '#f0c83a', 3, 1);
    for (let y = 0; y < 18; y++) { const b = Math.round(3 * Math.sin((y / 17) * Math.PI)); px(15 + b, y, '#8a5a34', 1, 1); }
    px(15, 0, '#e8dcc0', 1, 18);
  });
}
function buildJarShelf() {
  return canvasSprite(16, 14, (px) => {
    px(0, 10, OUT, 16, 3); px(1, 10, WOOD_L, 14, 1); px(1, 11, WOOD, 14, 1);
    px(2, 13, OUT, 1, 1); px(13, 13, OUT, 1, 1);
    for (const [x, h, c] of [[1, 7, '#6ab04a'], [6, 9, '#b86ad8'], [11, 6, '#e8a03a']]) {
      px(x, 10 - h, OUT, 4, h); px(x + 1, 11 - h, c, 2, h - 2); px(x + 1, 11 - h, '#ffffff66', 1, 2);
      px(x, 9 - h, '#b07838', 4, 1);
    }
  });
}
function buildCrate() {
  return canvasSprite(14, 14, (px) => {
    px(0, 0, OUT, 14, 14); px(1, 1, WOOD, 12, 12);
    px(1, 1, WOOD_L, 12, 2); px(1, 11, WOOD_L, 12, 2);
    for (let i = 0; i < 8; i++) { px(3 + i, 3 + i, WOOD_D, 1, 1); px(10 - i, 3 + i, WOOD_D, 1, 1); }
  });
}
function buildBarrel(apples) {
  return canvasSprite(14, 17, (px) => {
    if (apples) for (const [x, c] of [[3, '#e04a4a'], [6, '#c83a3a'], [9, '#e04a4a'], [5, '#5ab04a']]) px(x, 1, c, 3, 3);
    else for (const x of [4, 6, 8, 10]) { px(x, 0, '#a0764a', 1, 5); px(x - 1, 0, '#e8dcc0', 1, 2); }
    px(1, 3, OUT, 12, 14); px(0, 5, OUT, 14, 10);
    px(2, 4, WOOD, 10, 12); px(1, 6, WOOD, 12, 8);
    px(3, 4, WOOD_L, 2, 12); px(9, 5, WOOD_D, 2, 11);
    px(1, 6, '#5a5a66', 12, 1); px(1, 12, '#5a5a66', 12, 1);
    px(2, 4, WOOD_DD, 10, 1);
  });
}
function buildTank() {
  return canvasSprite(32, 22, (px) => {
    px(0, 0, OUT, 32, 16); px(1, 1, '#6aa8c8', 30, 14);
    px(1, 1, '#a8d8f0', 30, 3); px(2, 5, '#ffffff44', 1, 9);
    px(1, 12, '#c8b890', 30, 3);                           // sand
    for (const [x, y] of [[5, 8], [15, 6], [23, 9]]) { px(x, y, '#d84a2a', 5, 3); px(x - 1, y - 1, '#d84a2a', 1, 1); px(x + 5, y - 1, '#d84a2a', 1, 1); px(x + 1, y + 1, '#f08a5a', 2, 1); }
    px(12, 3, '#ffffff99'); px(20, 2, '#ffffff99');        // bubbles
    px(2, 16, OUT, 28, 6); px(3, 16, WOOD_D, 26, 5); px(3, 16, WOOD, 26, 1);
  });
}
function buildBed(bunk) {
  return canvasSprite(16, bunk ? 36 : 30, (px) => {
    const quilt = (y0, cols) => {
      for (let band = 0; band < 3; band++) for (let c = 0; c < 3; c++) {
        const col = cols[(band + c * 2) % cols.length];
        px(2 + c * 4, y0 + band * 4, col, 4, 4);
        px(3 + c * 4, y0 + band * 4 + 1, '#ffffff33', 1, 1);
      }
    };
    const one = (y, cols) => {
      px(0, y, OUT, 16, 6); px(1, y + 1, WOOD_L, 14, 1); px(1, y + 2, WOOD, 14, 3);   // headboard
      px(0, y + 6, OUT, 16, 18); px(1, y + 6, WOOD_D, 14, 18);
      px(2, y + 6, '#f0ead8', 12, 4); px(3, y + 7, '#ffffff', 5, 1);                  // pillow
      quilt(y + 10, cols);
      px(2, y + 22, '#00000033', 12, 1);
    };
    if (bunk) {
      one(0, ['#e04a4a', '#ffd84a', '#4a8ad8']);
      one(14, ['#5ab04a', '#f0ead8', '#4a8ad8']);
      px(0, 0, OUT, 1, 36); px(15, 0, OUT, 1, 36);
      px(0, 32, OUT, 16, 4); px(1, 32, WOOD, 14, 2); px(1, 35, OUT, 2, 1); px(13, 35, OUT, 2, 1);
    } else {
      one(0, ['#3f8c86', '#d8704a', '#5a7ab0', '#e8b860']);
      px(0, 24, OUT, 16, 6); px(1, 24, WOOD, 14, 3); px(1, 24, WOOD_L, 14, 1);          // footboard
      px(1, 29, OUT, 2, 1); px(13, 29, OUT, 2, 1);
    }
  });
}
// Gus's fishing rod, leaning in the corner: cork grip, reel, and a bobber on the line
function buildRod() {
  return canvasSprite(12, 30, (px) => {
    for (let y = 0; y < 20; y++) { const x = 2 + Math.floor(y / 5); px(x, y, OUT, 2, 1); px(x, y, '#c08c56', 1, 1); }
    px(5, 19, OUT, 4, 11); px(6, 20, '#d8b888', 2, 9); px(6, 20, '#f0d8b0', 1, 9);   // cork grip
    px(8, 21, OUT, 4, 4); px(9, 22, '#c8ccd4', 2, 2);                               // reel
    px(2, 1, '#e8e8e8', 1, 9);                                                        // line
    px(1, 10, OUT, 4, 4); px(2, 10, '#e04a4a', 2, 2); px(2, 12, '#ffffff', 2, 1);     // bobber
  });
}
function buildValeMap() {
  return canvasSprite(32, 22, (px) => {
    px(0, 0, OUT, 32, 22); px(1, 1, '#efe0b8', 30, 20);
    px(1, 1, '#d8c89c', 30, 1); px(1, 20, '#c8b88c', 30, 1);
    px(3, 3, '#e8f0ff', 8, 6);                              // Skyreach (NW)
    px(21, 3, '#c86a4a', 8, 6);                             // Cinderscale (NE)
    px(3, 13, '#3e6a3e', 8, 6);                             // Rootdeep (SW)
    px(21, 13, '#4a8ad8', 8, 6);                            // the lagoon (SE)
    px(12, 3, '#5a4a6a', 8, 5);                             // the Confluence
    px(13, 10, '#f0c83a', 6, 3);                            // the village
    for (let y = 3; y < 19; y++) px(20 + (y > 10 ? 1 : 0), y, '#4a8ad8', 1, 1);   // the river
    px(15, 16, '#e04a4a', 2, 2);                            // "YOU ARE HERE"
    px(29, 2, '#e04a4a', 1, 3); px(29, 6, '#e04a4a', 1, 1); // Tully's scribbles
  });
}

// Gus's burrow: a grassy mound with a round teal door (his scarf's color), a lit round
// window, a lantern and a clay chimney. 80x56: the 5x3-tile footprint plus 8px of mound
// rising above it. The door tile is the footprint's bottom-middle tile.
function buildBurrow() {
  return canvasSprite(80, 56, (px) => {
    const rnd = lcg(11);
    ellipse(px, 40, 56, 40, 50, '#23301e');                 // outline
    ellipse(px, 40, 56, 39, 49, '#4e7f52');                 // turf
    ellipse(px, 36, 56, 32, 43, '#5c8f5e');
    ellipse(px, 30, 50, 20, 30, '#6a9e66');                 // lit crown, upper left
    for (let i = 0; i < 70; i++) {                          // tufts
      const x = 6 + Math.floor(rnd() * 68), y = 8 + Math.floor(rnd() * 40);
      if (((x - 40) / 38) ** 2 + ((y - 56) / 48) ** 2 > 0.92) continue;
      const light = x < 40 && y < 36;
      px(x, y, light ? '#8ab878' : '#3e6a48', 1, 2);
      px(x + 1, y - 1, light ? '#a8c888' : '#47765c', 1, 1);
    }
    for (let i = 0; i < 14; i++) {                          // wildflowers
      const x = 8 + Math.floor(rnd() * 64), y = 10 + Math.floor(rnd() * 26);
      if (((x - 40) / 36) ** 2 + ((y - 56) / 46) ** 2 > 0.85) continue;
      px(x, y, ['#ffe066', '#ff9ad0', '#f0f0f0', '#c8a0ff'][i % 4], 2, 1);
      px(x, y + 1, '#fff6c8', 1, 1);
    }
    // clay chimney pipe
    px(55, 4, '#2e1e16', 7, 12); px(56, 5, '#b8704a', 5, 11); px(56, 5, '#d89068', 1, 11);
    px(54, 3, '#2e1e16', 9, 3); px(55, 4, '#c88058', 7, 1);
    // stone arch around the door
    ellipse(px, 40, 50, 14, 13, '#2e1e16', 56);
    ellipse(px, 40, 50, 13, 12, '#8a8078', 56);
    for (let a = 0; a < 9; a++) {
      const ang = Math.PI + (a / 8) * Math.PI;
      px(Math.round(40 + Math.cos(ang) * 11.5), Math.round(50 + Math.sin(ang) * 10.5), '#5a524c', 2, 1);
    }
    // the round door, teal planks and a brass knob dead center
    ellipse(px, 40, 49, 9, 9, '#16302e', 56);
    ellipse(px, 40, 49, 8, 8, '#3f8c86', 56);
    for (const x of [35, 38, 42, 45]) px(x, 41, '#2e6a66', 1, 15);
    ellipse(px, 38, 46, 3, 3, '#5cb0a8', 49);
    px(39, 48, '#f0c83a', 2, 2); px(39, 48, '#fff6c8', 1, 1);
    px(30, 55, '#6a625a', 20, 1); px(32, 54, '#9a9086', 16, 1);   // doorstep
    // round window, warm and lit
    ellipse(px, 62, 42, 6, 6, '#2e1e16');
    ellipse(px, 62, 42, 5, 5, WOOD);
    ellipse(px, 62, 42, 4, 4, '#ffd88a');
    px(61, 38, WOOD, 2, 9); px(58, 41, WOOD, 9, 2);
    px(59, 39, '#fff6d0', 2, 2);
    // a lantern on a post by the door
    px(20, 36, '#2e1e16', 2, 20); px(18, 36, '#2e1e16', 6, 1);
    px(17, 37, '#2e1e16', 5, 6); px(18, 38, '#ffe08a', 3, 4); px(18, 38, '#fff6d0', 1, 1);
  });
}

// Mama Pearl's cottage: rose shingles, cream walls, flower boxes and a heart over the
// arched door. 80x64: the 5x3-tile footprint plus a 16px roof peak above it.
function buildCottage() {
  return canvasSprite(80, 64, (px) => {
    // roof: scalloped shingle rows, lit toward the top
    px(2, 4, '#3a1c26', 76, 34);
    px(0, 30, '#3a1c26', 80, 8);
    for (let row = 0; row < 8; row++) {
      const y = 5 + row * 4, inset = row < 1 ? 3 : 1;
      const base = row < 3 ? '#e888a4' : row < 6 ? '#d8708e' : '#c05a78';
      px(inset + (row > 6 ? -1 : 2), y, base, 80 - (inset + (row > 6 ? -1 : 2)) * 2, 4);
      for (let x = (row % 2) * 4 + 2; x < 78; x += 8) px(x, y + 3, '#a8405e', 5, 1);
      px(inset + 2, y, row < 3 ? '#f8b0c4' : '#e888a4', 76 - inset * 2, 1);
    }
    px(8, 2, '#3a1c26', 64, 3); px(9, 3, '#f8b0c4', 62, 1);          // ridge
    px(60, 0, '#3a1c26', 8, 10); px(61, 0, '#e8e0d8', 6, 9);        // chimney
    px(61, 0, '#fff', 6, 1); px(62, 3, '#c8b8a8', 4, 1);
    // walls
    px(1, 37, '#3a2a22', 78, 27);
    px(2, 38, '#f4e4c4', 76, 24); px(2, 38, '#fff4dc', 76, 1);
    px(2, 60, '#9a8a78', 76, 3); px(2, 60, '#b8a894', 76, 1);         // stone footing
    px(2, 37, '#00000033', 76, 2);                                    // eave shadow
    // windows with shutters and flower boxes
    for (const wx of [9, 57]) {
      px(wx - 4, 42, '#d8708e', 3, 11); px(wx + 14, 42, '#d8708e', 3, 11);   // shutters
      px(wx - 1, 41, '#3a2a22', 16, 12); px(wx, 42, '#9ad0e8', 14, 10);
      px(wx, 42, '#d8f0fa', 5, 3); px(wx + 6, 42, '#3a2a22', 2, 10); px(wx, 46, '#3a2a22', 14, 1);
      px(wx - 2, 53, '#8a5a34', 18, 3); px(wx - 2, 53, '#a4703e', 18, 1);
      for (let i = 0; i < 6; i++) px(wx - 1 + i * 3, 51, ['#ff9ad0', '#ffe066', '#e04a5a'][i % 3], 2, 2);
    }
    // arched door, a heart knocker, and a heart over the lintel
    px(31, 44, '#3a2a22', 18, 20);
    px(33, 42, '#3a2a22', 14, 2); px(35, 41, '#3a2a22', 10, 1);
    px(32, 45, '#b04a66', 16, 19); px(34, 43, '#b04a66', 12, 2); px(36, 42, '#b04a66', 8, 1);
    px(35, 45, '#983a56', 1, 18); px(39, 44, '#983a56', 1, 19); px(40, 44, '#983a56', 1, 19); px(44, 45, '#983a56', 1, 18);
    px(38, 51, '#f0c83a', 4, 3); px(39, 54, '#f0c83a', 2, 1);
    px(36, 36, '#ff9ad0', 3, 2); px(41, 36, '#ff9ad0', 3, 2); px(36, 38, '#ff9ad0', 8, 1); px(37, 39, '#ff9ad0', 6, 1); px(39, 40, '#ff9ad0', 2, 1);
    px(37, 36, '#ffd0e4');
    px(30, 63, '#8a8070', 20, 1);                                     // doorstep
  });
}

// Every painted sprite, keyed like DEFS. Two-frame pieces add a `_2` twin (see frameName).
export function buildHouseSprites(sprites) {
  sprites.bookshelf = buildBookshelf();
  sprites.cabinet = buildCabinet();
  sprites.pebbleshelf = buildPebbleShelf();
  sprites.fireplace = buildFireplace(0); sprites.fireplace_2 = buildFireplace(1);
  sprites.stove = buildStove(0); sprites.stove_2 = buildStove(1);
  sprites.table = buildTable('table'); sprites.lowtable = buildTable('low');
  sprites.counter = buildCounter();
  sprites.weaponrack = buildWeaponRack();
  sprites.jarshelf = buildJarShelf();
  sprites.crate = buildCrate();
  sprites.barrel = buildBarrel(false); sprites.applebarrel = buildBarrel(true);
  sprites.tank = buildTank();
  sprites.bed = buildBed(false); sprites.bunkbed = buildBed(true);
  sprites.rod = buildRod();
  sprites.valemap = buildValeMap();
  sprites.burrow_ext = buildBurrow();
  sprites.cottage_ext = buildCottage();
}
