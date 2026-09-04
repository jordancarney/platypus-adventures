// All character/item art as ASCII pixel maps, rendered once into offscreen canvases.
// '.' or ' ' = transparent. Sprites face RIGHT; drawSprite flips for left.
//
// Palette conventions (see renderMap):
//   - An UPPERCASE letter is the highlight of its lowercase key, derived automatically
//     (the color mixed toward a warm white), so 'B' is lit fur wherever 'b' is fur.
//   - A def's optional `shade` table derives extra tones once the palette is merged:
//     { s: ['b', -0.3] } makes 's' a 30%-darker 'b'; a positive amount lightens.
//     Derivation runs *after* a VARIANT's overrides, so a palette swap only has to change
//     the base tones and every highlight, shade and outline follows along. An explicit
//     color always wins over a derived one.
//   - Creatures derive their outline 'd' from the body 'b' for the same reason: an elite
//     with a blue coat gets a navy outline rather than the base animal's brown one.

const DEFS = {};

// ---------- GUS THE PLATYPUS ----------
// 16x16, lit from the top-left: highlights ride the crown of the head, the top of the
// bill and the upper belly; shade pools under the chin, along the flank and under the bill.
const GUS_COLORS = {
  d: '#4a2a12', b: '#8c5a30', l: '#d4a468', o: '#e8a838',
  e: '#14100c', w: '#f7f2e2', t: '#5a3818', f: '#d08a30',
};
const GUS_SHADE = { s: ['b', -0.32], p: ['o', -0.3], k: ['l', -0.22], u: ['t', 0.35] };
DEFS.gus_idle = { colors: GUS_COLORS, shade: GUS_SHADE, map: [
  '.....ddddd......',
  '....dBBBbbd.....',
  '...dBBbbbbbd....',
  '...dbbbbbbwed...',
  '...dbbbbbbeedOOO',
  '....dbbbbbdpoooo',
  '....dbbbbbbdpppp',
  '...dbBLLLlbbd...',
  '...dbLLlllkbbd..',
  '..udblllllkbbd..',
  '.uudbllllkkbbd..',
  'uutdbbllkbbbsd..',
  'tttdbsbbbbbssd..',
  '.ttddssbbbbsdd..',
  '..t..ffF.ffF....',
  '....FFFf.FFFf...',
]};
// Walk cycle: feet apart with the tail swung up, then feet together with the whole body
// lifted a pixel (the blank bottom row) and the tail swung down -- a bounce, not a shuffle.
DEFS.gus_walk1 = { colors: GUS_COLORS, shade: GUS_SHADE, map: [
  '.....ddddd......',
  '....dBBBbbd.....',
  '...dBBbbbbbd....',
  '...dbbbbbbwed...',
  '...dbbbbbbeedOOO',
  '....dbbbbbdpoooo',
  '....dbbbbbbdpppp',
  '...dbBLLLlbbd...',
  '.uudbLLlllkbbd..',
  'uuudblllllkbbd..',
  'uttdbllllkkbbd..',
  '.ttdbbllkbbbsd..',
  '..tdbsbbbbbssd..',
  '...ddssbbbbsdd..',
  '...ffF.....ffF..',
  '..FFFf.....FFFf.',
]};
DEFS.gus_walk2 = { colors: GUS_COLORS, shade: GUS_SHADE, map: [
  '.....ddddd......',
  '....dBBBbbd.....',
  '...dBBbbbbbd....',
  '...dbbbbbbwed...',
  '...dbbbbbbeedOOO',
  '....dbbbbbdpoooo',
  '....dbbbbbbdpppp',
  '...dbBLLLlbbd...',
  '...dbLLlllkbbd..',
  '...dblllllkbbd..',
  '...dbllllkkbbd..',
  '..udbbllkbbbsd..',
  '.uudbsbbbbbssd..',
  'uutddssbbbbsdd..',
  'ttt..ffF.ffF....',
  '.tt.FFFf.FFFf...',
  '................',
]};
// ---------- ARMOR OVERLAYS ----------
// Same 16x16 grid as the Gus sprites, so these register pixel-for-pixel on top of him.
// His torso interior is rows 7-13, cols 4-12 (the outline sits at cols 3 and 13); the
// crown of his head is rows 0-2. Each set uses 'k' for its own shadow tone so the shading
// direction matches the body underneath.
DEFS.armor1 = { colors: { v: '#5f8f45', h: '#8ab868' }, shade: { k: ['v', -0.3] }, map: [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '....vVVVvvvv....',
  '....vhvhvhvkv...',
  '....hvhvhvhvk...',
  '....vhvhvhvkv...',
  '....kvhvhvvkk...',
  '.....kkkkkkk....',
  '................',
  '................',
  '................',
]};
DEFS.armor2 = { colors: { m: '#5a7a9a', h: '#8aa8c8', d: '#3a5270' }, shade: { k: ['m', -0.3] }, map: [
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '................',
  '..hdmMMmmmmmdh..',
  '...dmhmhmhmhkd..',
  '....hmhmhmhmk...',
  '....mhmhmhmhk...',
  '....khmhmhmkk...',
  '.....kmmmmkk....',
  '................',
  '................',
  '................',
]};
DEFS.armor3 = { colors: { p: '#3a3a48', h: '#5a5a70', g: '#f0c83a' }, shade: { k: ['p', -0.3] }, map: [
  '................',
  '.....ppppp......',
  '....pGggggp.....',
  '................',
  '................',
  '................',
  '................',
  '..hpppPPppppph..',
  '...ppGgggggpkp..',
  '....phhhhhhpk...',
  '....pphhhhpkk...',
  '....kpgggpkk....',
  '.....kppppk.....',
  '................',
  '................',
  '................',
]};
DEFS.armor4 = { colors: { t: '#2f7f86', h: '#5fc3c8', w: '#e8fbff' }, shade: { k: ['t', -0.3] }, map: [
  '................',
  '.....ttttt......',
  '....twwwwwt.....',
  '................',
  '................',
  '................',
  '................',
  '..htttTTttttth..',
  '...ttwwwwwwtkt..',
  '....thhwwhhtk...',
  '....tthhhhtkk...',
  '....ktwwwwkk....',
  '.....kttttk.....',
  '................',
  '................',
  '................',
]};
DEFS.armor5 = { colors: { p: '#3b2a5e', h: '#6a4fa0', c: '#7ad4ff', w: '#dff6ff' }, shade: { k: ['p', -0.3] }, map: [
  '................',
  '.....ppppp......',
  '....pcCcccp.....',
  '................',
  '................',
  '................',
  '................',
  '..hpppPPppppph..',
  '...ppc.hhh.cpp..',
  '....phcchcchk...',
  '....pphcCchkk...',
  '....kpc.h.ckk...',
  '.....kpwwwpk....',
  '................',
  '................',
  '................',
]};
DEFS.armor6 = { colors: { s: '#d8d4c8', h: '#ffffff', g: '#f0c83a', c: '#7ad4ff' }, shade: { k: ['s', -0.3], m: ['g', -0.3] }, map: [
  '.....GgGgG......',
  '....gssssssg....',
  '....ghhhhhhg....',
  '................',
  '................',
  '................',
  '................',
  '..sgggGGggggggs.',
  '...gshhhhhhsmg..',
  '....gshsCshsm...',
  '....ggshCshmm...',
  '....mgshhhsmm...',
  '.....mggggggm...',
  '................',
  '................',
  '................',
]};

DEFS.gus_swim = { colors: { ...GUS_COLORS, r: '#bfe8f2' }, shade: GUS_SHADE, map: [
  '.....ddddd......',
  '....dBBBbbd.....',
  '...dBBbbbbbd....',
  '...dbbbbbbwed...',
  '...dbbbbbbeedOOO',
  '....dbbbbbdpoooo',
  '....dbbbbbbdpppp',
  'R..dbBLLLlbbd.R.',
  'rrrdbLLlllkbbdrr',
  '.RrrrrrRrrrrrrR.',
]};

// ---------- CREATURES (bases; palette variants defined below) ----------
// Every base derives its outline from the body so palette swaps stay coherent, and uses
// 's' (or 'k') as its shadow tone. Bodies are lit from the top-left like Gus.
const BODY_SHADE = { d: ['b', -0.62], s: ['b', -0.3], k: ['l', -0.22] };
DEFS.rodent = { colors: { b: '#6b4a2f', l: '#c7b299', t: '#8a6a4a', e: '#111', o: '#e08a90', f: '#3a2a1c' }, shade: BODY_SHADE, map: [
  '..........dd.dd.',
  'tT........dbdbd.',
  '.tT.......dBBbbd',
  '..tT.....dbbbbed',
  '...tt.ddddBbbbbo',
  '....ddbBBbbbbbd.',
  '....dbblllbbbsd.',
  '.....dbslllsbd..',
  '.....ddbsbsbd...',
  '......ff.dff....',
], map2: [
  '..........dd.dd.',
  'tT........dbdbd.',
  '.tT.......dBBbbd',
  '..tT.....dbbbbed',
  '...tt.ddddBbbbbo',
  '....ddbBBbbbbbd.',
  '....dbblllbbbsd.',
  '.....dbslllsbd..',
  '.....ddbsbsbd...',
  '.....ff...dff...'
]};
DEFS.canine = { colors: { b: '#c28a4a', l: '#e8d3ae', t: '#a06c34', e: '#111', o: '#211510', f: '#39251a' }, shade: BODY_SHADE, map: [
  '............d.d..',
  '...........dbdbd.',
  'tT.........dBbBd.',
  'tTt.....ddddbbbed',
  '.tTt..ddbBBbbbbbo',
  '..tt.dbbBbbbbbbdd',
  '...tdbbbbbbbbsdd.',
  '....dbblllllbsd..',
  '....dbbllllkbd...',
  '....dbsbbbbsbd...',
  '....dbd.sbdbd....',
  '....ff..ffff.....',
], map2: [
  '............d.d..',
  '...........dbdbd.',
  'tT.........dBbBd.',
  'tTt.....ddddbbbed',
  '.tTt..ddbBBbbbbbo',
  '..tt.dbbBbbbbbbdd',
  '...tdbbbbbbbbsdd.',
  '....dbblllllbsd..',
  '....dbbllllkbd...',
  '....dbsbbbbsbd...',
  '...dbd..sbd.bd...',
  '...ff...ff..ff...'
]};
DEFS.feline = { colors: { b: '#8d8078', l: '#cfc4b6', t: '#6e625a', e: '#c8e04a', o: '#1d1512', f: '#2c2320' }, shade: BODY_SHADE, map: [
  '..........d..d..',
  '..tT......dbddbd',
  '.tTt......dBbbbd',
  '.tt.....ddddbebd',
  '.tt...ddbBBbbbbo',
  '..t..dbbBbbbbbdd',
  '...ddbbbbbbbbsd.',
  '....dbbllllbsd..',
  '....dbsllllbd...',
  '.....dbsbbsbd...',
  '.....dbd.sdbd...',
  '.....ff..fff....',
], map2: [
  '..........d..d..',
  '..tT......dbddbd',
  '.tTt......dBbbbd',
  '.tt.....ddddbebd',
  '.tt...ddbBBbbbbo',
  '..t..dbbBbbbbbdd',
  '...ddbbbbbbbbsd.',
  '....dbbllllbsd..',
  '....dbsllllbd...',
  '.....dbsbbsbd...',
  '....dbd..sd.bd..',
  '....ff...ff.ff..'
]};
// Coiled, head raised and tongue out: two stacked loops with a shadow seam between them.
DEFS.serpent = { colors: { b: '#4e7a3a', s: '#2f4d24', l: '#93b56a', e: '#e0c23a', o: '#c23a3a' }, shade: { d: ['b', -0.62], k: ['s', -0.2] }, map: [
  '.......ddd.....',
  '......dBBbd....',
  '......dBbbed.o.',
  '......dbbbdoo..',
  '.......dbbd....',
  '..dddddbbbddd..',
  '.dBBbbbBbbbbbbd',
  'dBbsbbsbbsbbsbd',
  'dbbbbbbbbbbbbbd',
  '.dsksbsskbsskd.',
  '.dbbBbbbBbbbbd.',
  '..dlLlllllllld.',
  '...ddddddddd...',
], map2: [
  '.......ddd.....',
  '......dBBbd....',
  '......dBbbed...',
  '......dbbbd....',
  '.......dbbd....',
  '..dddddbbbddd..',
  '.dBBbbbBbbbbbbd',
  'dBbsbbsbbsbbsbd',
  'dbbbbbbbbbbbbbd',
  '.dsksbsskbsskd.',
  '.dbbBbbbBbbbbd.',
  '..dlLlllllllld.',
  '...ddddddddd...'
]};
DEFS.lizard = { colors: { b: '#707c34', s: '#4a521e', l: '#b8bf7a', e: '#e0c23a', f: '#2e3018' }, shade: { d: ['b', -0.62], k: ['l', -0.2] }, map: [
  '...............dd.',
  '..............dBbd',
  'dd..........dddbed',
  '.dd.ddddddddbBbbbd',
  '..ddbBsbBsbBbbbbdd',
  '...dbbbbbbbbbbbbd.',
  '...dbsllsllsllbd..',
  '....dbd.dbd.dbd...',
  '....ff..ff..ff....',
], map2: [
  '...............dd.',
  '..............dBbd',
  'dd..........dddbed',
  '.dd.ddddddddbBbbbd',
  '..ddbBsbBsbBbbbbdd',
  '...dbbbbbbbbbbbbd.',
  '...dbsllsllsllbd..',
  '.....dbd.dbd.dbd..',
  '.....ff..ff..ff...'
]};
DEFS.croc = { colors: { b: '#3f6e42', s: '#294d2c', l: '#9db86a', e: '#e0b23a', w: '#d8e8f0', f: '#1d3320' }, shade: { d: ['b', -0.62], k: ['l', -0.2] }, map: [
  '.....dd...........',
  '....dwwd..........',
  '...dwWwd..........',
  '...ddwd......dd...',
  '..dsBbdddddddbed..',
  '.dbBbbbBbbbBbbbbdd',
  'dbsbbsbbsbbsbbbbbb',
  'dbbbbbbbbbbbdwdwdw',
  '.dblllllllbbdddddd',
  '..dbsbbsbbsbbd....',
  '..dbd.dbd.dbd.....',
  '..ff..ff..ff......',
], map2: [
  '.....dd...........',
  '....dwwd..........',
  '...dwWwd..........',
  '...ddwd......dd...',
  '..dsBbdddddddbed..',
  '.dbBbbbBbbbBbbbbdd',
  'dbsbbsbbsbbsbbbbbb',
  'dbbbbbbbbbbbdwdwdw',
  '.dblllllllbbdddddd',
  '..dbsbbsbbsbbd....',
  '...dbd.dbd.dbd....',
  '...ff..ff..ff.....'
]};
// Seen from above with wings spread: lit leading edges, shaded trailing edges, fanned tail.
DEFS.bird = { colors: { b: '#7a5a38', w: '#a8845a', l: '#d8c8a8', e: '#111', o: '#e0a33e' }, shade: { d: ['b', -0.62], k: ['w', -0.3], s: ['b', -0.3] }, map: [
  'dd............dd',
  'dWWd........dWWd',
  '.dWwwd....dwwWd.',
  '..dWwwwddwwwwd..',
  '...dkwwbbbbwwkd.',
  '....dkbBbebbkdoo',
  '....ddbllbbbdd..',
  '.....dbllsbd....',
  '......dbbbd.....',
  '.....dsdsdsd....',
  '......ddddd.....',
], map2: [
  '................',
  '................',
  '................',
  '......ddddd.....',
  '....ddbBbbbdd...',
  '...dkbBbebbbkdoo',
  '..dWwdbllbbbdwwd',
  '.dWwwdbllsbdwwkd',
  'dWwwkddbbbddwkd.',
  'dkwkd.dsdsdsdkd.',
  '.ddd...ddddd.dd.'
]};
DEFS.fish = { colors: { b: '#3f7a86', s: '#2a5860', l: '#9ecfd8', e: '#e0e858', o: '#12262a', n: '#2a5860' }, shade: { d: ['b', -0.62], k: ['l', -0.2] }, map: [
  '.......nNn.......',
  '..ddddnnnbdd.....',
  '.dBBbbbbbbbbdd...',
  'dbebbBsbBsbbsbd..',
  'dboodbbbbbbbbsdnn',
  'dbooodbsbbsbbdNn.',
  '.dbbbbbbbbbbsdnn.',
  '..ddklLlllkdd....',
  '....dnndddd......',
], map2: [
  '.......nNn.......',
  '..ddddnnnbdd.....',
  '.dBBbbbbbbbbdd.nn',
  'dbebbBsbBsbbsbdNn',
  'dboodbbbbbbbbsdnn',
  'dbooodbsbbsbbdd..',
  '.dbbbbbbbbbbsd...',
  '..ddklLlllkdd....',
  '....dnndddd......'
]};
DEFS.turtle = { colors: { b: '#5a7a3a', s: '#3c5426', l: '#b0a068', e: '#111', f: '#4a3c20' }, shade: { d: ['b', -0.62], k: ['l', -0.22] }, map: [
  '.....ddddd......',
  '...ddBsBsBdd....',
  '..dBsbbbbbsbd...',
  '.dBbbsBsBsbbbdd.',
  '.dbsbbbbbbbsbdbd',
  '.dbbbsbsbsbbbdeb',
  '..dlLllllllddbbd',
  '...dklllllkd.dd.',
  '...dfd.dfd.d....',
  '...ff..ff.......',
], map2: [
  '.....ddddd......',
  '...ddBsBsBdd....',
  '..dBsbbbbbsbd...',
  '.dBbbsBsBsbbbdd.',
  '.dbsbbbbbbbsbdbd',
  '.dbbbsbsbsbbbdeb',
  '..dlLllllllddbbd',
  '...dklllllkd.dd.',
  '..dfd...dfd.d...',
  '..ff....ff......'
]};
DEFS.devil = { colors: { b: '#3a2620', l: '#e8e0d0', e: '#e04a3a', o: '#0e0a08', w: '#f0ece0', f: '#1c1410' }, shade: { d: ['b', -0.62], s: ['b', -0.3] }, map: [
  '..d.d....dd..',
  '.dbdbd..dBbd.',
  '.dBbbbddBbbd.',
  'dBbebbbbbbdd.',
  'dbbbbbbbbowd.',
  'dbwwbbbbbowd.',
  'dbwwbbbbbbdd.',
  '.dbbbbbbbsd..',
  '..dbsbbsbsd..',
  '..dbd.dbd....',
  '..ff..ff.....',
], map2: [
  '..d.d....dd..',
  '.dbdbd..dBbd.',
  '.dBbbbddBbbd.',
  'dBbebbbbbbdd.',
  'dbbbbbbbbowd.',
  'dbwwbbbbbowd.',
  'dbwwbbbbbbdd.',
  '.dbbbbbbbsd..',
  '..dbsbbsbsd..',
  '.dbd...dbd...',
  '.ff....ff....'
]};
DEFS.knight = { colors: { b: '#707c34', l: '#b8bf7a', e: '#e0c23a', m: '#8a929c', h: '#5a626c', g: '#c8a03a', f: '#2e3018' }, shade: { d: ['b', -0.62], s: ['b', -0.3], k: ['m', -0.3] }, map: [
  '...dddd.......',
  '..dBBbbdd.....',
  '..dbbebbdd....',
  '..dbbbbbbd....',
  '...dbbbd..hM..',
  '..ddbbbdd.hM..',
  '.dbMmmmbd.hM..',
  'GdbmMmmbdhhh..',
  'gdbmmmkbdGGh..',
  '.dbmmkkbdhhh..',
  '..dbbbbbd.h...',
  '..dbsdbsd.....',
  '..dbd.dbd.....',
  '..dbd.dbd.....',
  '..ff..ff......',
], map2: [
  '...dddd.......',
  '..dBBbbdd.....',
  '..dbbebbdd....',
  '..dbbbbbbd....',
  '...dbbbd..hM..',
  '..ddbbbdd.hM..',
  '.dbMmmmbd.hM..',
  'GdbmMmmbdhhh..',
  'gdbmmmkbdGGh..',
  '.dbmmkkbdhhh..',
  '..dbbbbbd.h...',
  '..dbsdbsd.....',
  '..dbd..dbd....',
  '.dbd....dbd...',
  '.ff.....ff....'
]};
// Final boss: croc head + eagle wings + serpent coils, drawn large.
DEFS.chimera = { colors: { b: '#5a3a72', s: '#3c2450', l: '#b090d0', e: '#ffd84a', w: '#8a6ab0', o: '#ff8a4a', t: '#3f6e42', f: '#241430' }, shade: { d: ['b', -0.62], k: ['w', -0.3] }, map: [
  'dd......................dd',
  'dWWd..................dWWd',
  '.dWWwd..............dwWWd.',
  '..dWwwwd..........dwwwwd..',
  '...dkwwwwd......dwwwwkd...',
  '....ddkwwwd....dwwwkdd....',
  '......ddbBddddddBbdd......',
  '.....ddBbbbbbbbbbbbdd.....',
  '....dbBebbbBbbbbbbebbd....',
  '....dbbbbbbsbbsbbbbbbd....',
  '...dbBbbbbbbbbbbbbbbbbdd..',
  '..dbsbbsbbsbbsbbsbbsbbbbdd',
  '..dbbbbbbbbbbbbbbbbbbdsodo',
  '..dblLlllllllllllbbbdddddd',
  '...dbbsbbsbbsbbsbbsd......',
  'tT..dbbdbbdbbdbbdbd.......',
  '.tT.dbd.dbd.dbd.dbd.......',
  '..tTff..ff..ff..ff........',
  '...tTtt...................',
  '.....tttttt...............',
], map2: [
  '..........................',
  '..........................',
  '..........................',
  '..........................',
  '..........................',
  '..........................',
  '......ddbBddddddBbdd......',
  '....dddBbbbbbbbbbbbddd....',
  '.dWwdbBebbbBbbbbbbebbdwWd.',
  'dWwwdbbbbbbsbbsbbbbbbdwwWd',
  'dkwdbBbbbbbbbbbbbbbbbbddwd',
  'dkdbsbbsbbsbbsbbsbbsbbbbdd',
  '.ddbbbbbbbbbbbbbbbbbbdsodo',
  '..dblLlllllllllllbbbdddddd',
  '...dbbsbbsbbsbbsbbsd......',
  'tT..dbbdbbdbbdbbdbd.......',
  '.tT.dbd.dbd.dbd.dbd.......',
  '..tTff..ff..ff..ff........',
  '...tTtt...................',
  '.....tttttt...............'
]};

// ---------- ITEMS & PROPS ----------
DEFS.coin = { colors: { g: '#f0c83a', h: '#fff0a0', d: '#a07818' }, map: [
  '.gggg.', 'ghhggg', 'ghgggg', 'gggggg', 'dggggd', '.dddd.',
]};
DEFS.diamond = { colors: { c: '#6ae0f0', h: '#d8fbff', d: '#2a90b0' }, map: [
  '.ccccc.', 'chhcccd', '.ccccd.', '..ccd..', '...c...',
]};
DEFS.crayfish = { colors: { r: '#d84a2a', d: '#8a2a12', l: '#f08a5a', e: '#111' }, shade: { k: ['r', -0.3] }, map: [
  'Rr.....rR..',
  '.Rr...rR...',
  '..rdRrrd...',
  '.rRrrrrrrd.',
  'derrlLlrrdd',
  '.rrrkkkrrd.',
  '..d..d..d..',
]};
DEFS.arrows = { colors: { w: '#a0764a', h: '#c8c8d0', f: '#d84a2a' }, map: [
  '..h..h..', '..hh.hh.', 'f.ww.ww.', 'ffwwfww.', 'f.ww.ww.', '..ww.ww.', '..f..f..',
]};
DEFS.key = { colors: { g: '#f0c83a', d: '#a07818' }, map: [
  '.ggg....', 'g...g...', 'g...gggg', 'g...g.g.', '.ggg..g.',
]};
DEFS.shell = { colors: { p: '#f5c6d6', d: '#c98aa0', h: '#fff0f5' }, map: [
  '..ppp..',
  '.pphpp.',
  'pphhhpp',
  'pdpppdp',
  '.ddddd.',
]};
DEFS.ring = { colors: { g: '#f0c83a', h: '#fff6c8' }, map: [
  '.ggg.',
  'g.h.g',
  'g...g',
  '.ggg.',
]};
DEFS.chime = { colors: { g: '#c8d8e8', h: '#ffffff', d: '#7a8a9a' }, map: [
  '.ggg.',
  'g.h.g',
  '.ggg.',
  'd.d.d',
  'd.d.d',
]};
DEFS.bigfang = { colors: { w: '#f0ead8', d: '#b0a488', g: '#f0c83a' }, map: [
  'wwwwww.', 'gggggg.', 'wwwwww.', '.wwww..', '.wwww..', '..www..', '..ww...', '..ww...', '...w...',
]};
DEFS.shard = { colors: { c: '#ffffff', h: '#ffffff', d: '#888888' }, map: [
  '...cc...', '..chhc..', '.chhhc..', '.chhc...', 'chhc....', 'chc.....', 'cc......', 'c.......',
]};
DEFS.chest = { colors: { w: '#8a5a2a', d: '#5a3a18', g: '#f0c83a', l: '#b07838' }, map: [
  '.dddddddddddd.',
  'dWWwwwwwwwwwwd',
  'dwlwwlwwlwwlwd',
  'dddddddddddddd',
  'dwwwwwdGdwwwwd',
  'dwwwwwdgdwwwwd',
  'dwlwwlwdwlwwld',
  'dwwwwwwwwwwwwd',
  '.dddddddddddd.',
]};
DEFS.chest_open = { colors: { w: '#8a5a2a', d: '#5a3a18', g: '#f0c83a', k: '#241a0c', l: '#b07838' }, map: [
  '.dddddddddddd.',
  'dwwwwwwwwwwwwd',
  'dddddddddddddd',
  'dkkkkkkkkkkkkd',
  'dkkkkkkkkkkkkd',
  'dddddddddddddd',
  'dwlwwlwwwlwwld',
  'dwwwwwwwwwwwwd',
  '.dddddddddddd.',
]};
DEFS.pot = { colors: { c: '#b07848', d: '#7a4c28', h: '#d8a878' }, shade: { k: ['c', -0.3] }, map: [
  '...dddddd...',
  '..dcChhcckd.',
  '.dcCchhccckd',
  'dcCcchhccckd',
  'dccccccccckd',
  'dccccccccckd',
  '.dccccccckd.',
  '..dcccckkd..',
  '...dddddd...',
]};
DEFS.bomb = { colors: { k: '#2a2a34', h: '#4a4a5a', f: '#f0a03a', s: '#c8b48a' }, map: [
  '....s...', '...s....', '..fss...', '.dkkkd..', 'dkhkkkd.', 'dkkkkkd.', 'dkkkkkd.', '.dkkkd..', '..ddd...',
].map(r => r.replace(/d/g, 'k'))};
DEFS.sign = { colors: { w: '#a0764a', d: '#5a3a18', p: '#6a4a24' }, map: [
  'dddddddddddd',
  'dwwwwwwwwwwd',
  'dwddwdwddwwd',
  'dwwwwwwwwwwd',
  'dwdwddwdwwwd',
  'dwwwwwwwwwwd',
  'dddddddddddd',
  '....pp......',
  '....pp......',
  '....pp......',
]};
// The save statue is Gus himself, carved in stone on a plinth: same silhouette as the
// player sprite so it reads as *him* at a glance.
DEFS.statue = { colors: { d: '#4a525e', b: '#9aa2ac', l: '#bcc4cc', o: '#9aa2ac', e: '#6a727c', w: '#d0d8e0', t: '#7a828c', f: '#8a929c', q: '#7a828c' }, shade: GUS_SHADE, map: [
  '.....ddddd......',
  '....dBBBbbd.....',
  '...dBBbbbbbd....',
  '...dbbbbbbwed...',
  '...dbbbbbbeedOOO',
  '....dbbbbbdpoooo',
  '....dbbbbbbdpppp',
  '...dbBLLLlbbd...',
  '...dbLLlllkbbd..',
  '..udblllllkbbd..',
  '.uudbllllkkbbd..',
  'uutdbbllkbbbsd..',
  'tttdbsbbbbbssd..',
  '.ttddssbbbbsdd..',
  '..t..ffF.ffF....',
  '....FFFf.FFFf...',
  '..qQQQQQQQQQQq..',
  '..qqqqqqqqqqqq..',
  '.dddddddddddddd.',
]};
DEFS.shrine = { colors: { s: '#8a92a0', d: '#4a525e', c: '#6ae0f0', h: '#d8fbff' }, map: [
  '......cc........',
  '.....chhc.......',
  '.....cccc.......',
  '......cc........',
  '....ssssss......',
  '...sddddddss....',
  '...sd....ds.....',
  '..ssssssssss....',
  '..sddddddddss...',
  '.ssssssssssss...',
  'dssssssssssssd..',
  'dddddddddddddd..',
]};
// Elder Mirri: Gus's build in grey, leaning on a gem-topped staff.
DEFS.elder = { colors: { ...GUS_COLORS, b: '#8a8078', l: '#c8c0b0', o: '#c89858', t: '#6a6058', f: '#b08850', g: '#7ad4ff', x: '#7a5a2a' }, shade: GUS_SHADE, map: [
  '.....ddddd......',
  '....dBBBbbd...G.',
  '...dwwbbbbbd.gGg',
  '...dbbbbbbwed.G.',
  '...dbbbbbbeedOOx',
  '....dbbbbbdpooox',
  '....dbbbbbbdpppx',
  '...dbBLLLlbbd..x',
  '...dbLLlllkbbd.x',
  '..udblllllkbbd.x',
  '.uudbllllkkbbd.x',
  'uutdbbllkbbbsd.x',
  'tttdbsbbbbbssd.x',
  '.ttddssbbbbsdd.x',
  '..t..ffF.ffF...x',
  '....FFFf.FFFf..x',
]};
DEFS.wombat = { colors: { b: '#8a6a4a', l: '#c0a888', e: '#14100c', o: '#5a4432', h: '#6a503a' }, shade: BODY_SHADE, map: [
  '..dd..dd........',
  '.dbBddBbd.......',
  '.dBbbbbbbdd.....',
  'dBbbebbbbbbd....',
  'dbbbbbbbbood....',
  'dbbBbbbbbood....',
  'dbblLllbbbbd....',
  'dbbllllkbbbd....',
  'dbbllllkbbsd....',
  '.dbbbbbbbbsd....',
  '..dbsdsbbsd.....',
  '..dhd.dhhd......',
]};
DEFS.villager = { colors: { ...GUS_COLORS, b: '#a06a3a', l: '#d8b088' }, shade: GUS_SHADE, map: DEFS.gus_idle.map };
DEFS.heart = { colors: { r: '#e04a5a', h: '#ff9aa8', d: '#8a1a2a' }, map: [
  '.rr.rr.', 'rhrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...',
]};
// ---------- FRIENDS ----------
DEFS.dolphin = { colors: { b: '#5a8ab0', l: '#cfe6f4', e: '#14202a' }, shade: { d: ['b', -0.62], s: ['b', -0.3], k: ['l', -0.15] }, map: [
  '........dd......',
  '.......dBbd.....',
  '..d....dBbbd....',
  '.dBd..dBbbbbdd..',
  'dBbbddBbbbbbbbd.',
  'dbbbbbbbbbbbebbd',
  '.dbbslLlllbbbbbd',
  '..dbsllllllkbdd.',
  '...ddskkkkkdd...',
]};

// ---------- SHIELDS ----------
// One per level. They grow and change material as they upgrade, and the silhouette
// telegraphs the mechanic: Lv4 is visibly the widest (it's the wide-arc shield).
DEFS.shield1 = { colors: { w: '#8a6a3a', d: '#5a4423', h: '#a88a5a' }, map: [
  '.ddd..',
  'dwwwd.',
  'dwhwd.',
  'dwwwd.',
  'dwhwd.',
  'dwwwd.',
  '.ddd..',
]};
DEFS.shield2 = { colors: { m: '#8a929c', d: '#4a525e', h: '#b8c0cc', g: '#c8a03a' }, map: [
  '.ddddd.',
  'dmmmmmd',
  'dmhmhmd',
  'dmmgmmd',
  'dmhmhmd',
  'dmmmmmd',
  'dmmmmmd',
  '.ddddd.',
]};
DEFS.shield3 = { colors: { s: '#c8d4e0', d: '#5a6472', h: '#ffffff', b: '#8aa8c8' }, map: [
  '.ddddd.',
  'dsssssd',
  'dshhssd',
  'dshhsbd',
  'dssssbd',
  'dsbbssd',
  'dssssbd',
  'dsssssd',
  '.ddddd.',
]};
DEFS.shield4 = { colors: { t: '#2f7f86', d: '#1a4a50', h: '#5fc3c8', w: '#e8fbff' }, map: [
  '..ddddd..',
  '.dtttttd.',
  'ddtthttdd',
  'dtthwhttd',
  'dtthwhttd',
  'dtthhhttd',
  'ddtttttdd',
  '.dtttttd.',
  '..ddddd..',
]};
DEFS.shield5 = { colors: { p: '#3b2a5e', d: '#221640', h: '#6a4fa0', c: '#7ad4ff' }, map: [
  '..ddddd..',
  '.dpppppd.',
  'ddphhhpdd',
  'dpphcphpd',
  'dpphcphpd',
  'dppcccppd',
  'dpphcphpd',
  'dpphcphpd',
  'ddphhhpdd',
  '.dpppppd.',
  '..ddddd..',
]};
DEFS.shield6 = { colors: { g: '#f0c83a', d: '#a8801a', w: '#ffffff', c: '#7ad4ff', s: '#fff6c8' }, map: [
  '..dddddd..',
  '.dggggggd.',
  'dgssssssgd',
  'dgswwwwsgd',
  'dgswccwsgd',
  'dgswccwsgd',
  'dgswwwwsgd',
  'dgssssssgd',
  'dggggggggd',
  '.dggggggd.',
  '..dggggd..',
  '...dddd...',
]};
// The Great Gate is drawn in code rather than as an ASCII map: it has to fill the full
// three-tile gap in the Confluence wall (48x32), which is unwieldy to hand-letter.
function buildGateSprite() {
  const W = 48, H = 32;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  const px = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  const STONE = '#6a7280', STONE_D = '#3a424e', STONE_H = '#8a94a4';
  const IRON = '#8a929c', IRON_D = '#4a525e';
  const GOLD = '#f0c83a', GOLD_D = '#a07818';

  // flanking pillars, keyed into the cliff on either side
  for (const x of [0, 40]) {
    px(x, 0, 8, H, STONE);
    px(x, 0, 8, 2, STONE_H);
    px(x + 6, 2, 2, H - 2, STONE_D);
    px(x, H - 3, 8, 3, STONE_D);
    for (let y = 7; y < H - 4; y += 6) px(x + 1, y, 6, 1, STONE_D);
  }
  // lintel and threshold
  px(8, 0, 32, 5, STONE);
  px(8, 0, 32, 2, STONE_H);
  px(8, 5, 32, 1, STONE_D);
  px(8, H - 4, 32, 4, STONE_D);
  // portcullis bars
  for (let x = 11; x < 39; x += 5) {
    px(x, 6, 2, H - 10, IRON);
    px(x + 2, 6, 1, H - 10, IRON_D);
  }
  px(8, 11, 32, 2, IRON); px(8, 13, 32, 1, IRON_D);
  px(8, 22, 32, 2, IRON); px(8, 24, 32, 1, IRON_D);
  // four-shard lock plate at the centre
  px(19, 13, 10, 10, GOLD_D);
  px(20, 14, 8, 8, GOLD);
  px(23, 16, 2, 3, GOLD_D);
  px(22, 19, 4, 2, GOLD_D);
  return { canvas: c, w: W, h: H };
}
DEFS.gong = { colors: { d: '#5a4423', s: '#a08040', g: '#f0c83a', h: '#fff0a0' }, map: [
  'dd.........dd.',
  'dd.........dd.',
  'dd..sgggs..dd.',
  'dd.sgghggs.dd.',
  'dd.gghhhgg.dd.',
  'dd.gghhhgg.dd.',
  'dd.sgghggs.dd.',
  'dd..sgggs..dd.',
  'dd.........dd.',
  'dd.........dd.',
  'dd.........dd.',
  'ddd.......ddd.',
  '.dd.......dd..',
  '.dddddddddd...',
  '..dddddddd....',
]};
DEFS.boulder = { colors: { s: '#8a8278', d: '#5a544c', h: '#b0a89c' }, map: [
  '..ssss..', '.shhsss.', 'ssshssss', 'sssssssd', 'sssssssd', 'dssssdd.', '.dddd...',
]};
DEFS.block = { colors: { s: '#a08a68', d: '#6a5a40', h: '#c8b494' }, map: [
  'dddddddddddddddd',
  'dhhhhhhhhhhhhhhd',
  'dhssssssssssssdd',
  'dhssddssddssssdd',
  'dhssssssssssssdd',
  'dhssssddssddssdd',
  'dhssssssssssssdd',
  'dhssddssddssssdd',
  'dhssssssssssssdd',
  'dhssssddssddssdd',
  'dhssssssssssssdd',
  'dhssddssddssssdd',
  'dhssssssssssssdd',
  'dhssssssssssssdd',
  'dddddddddddddddd',
  'dddddddddddddddd',
]};

// ---------- palette variants: name -> { base, colors (override), scale } ----------
const VARIANTS = {
  // marsh
  rakali:      { base: 'rodent' },
  rakali_e:    { base: 'rodent', colors: { b: '#4a5a7a', l: '#a8c0d8', t: '#3a4a66' } },
  adder:       { base: 'serpent' },
  adder_e:     { base: 'serpent', colors: { b: '#7a3a5a', s: '#521f3c', l: '#c88aa8' } },
  // fire
  snapjaw:     { base: 'croc', colors: { b: '#8a4a2a', s: '#5f2f18', l: '#d8a05a', w: '#f0b03a' } },
  snapjaw_e:   { base: 'croc', colors: { b: '#5a2a3a', s: '#3a1826', l: '#b06a8a', w: '#ff6a3a' } },
  emberfox:    { base: 'canine', colors: { b: '#d9622b', l: '#f0e0c8', t: '#f0a03a' } },
  emberfox_e:  { base: 'canine', colors: { b: '#8a2a5a', l: '#e8c8d8', t: '#c84a8a' } },
  mgoanna:     { base: 'lizard', colors: { b: '#8a3a24', s: '#5f2412', l: '#e0a05a', e: '#ffe04a' } },
  mgoanna_e:   { base: 'lizard', colors: { b: '#4a2a5a', s: '#301a3c', l: '#a88ac0', e: '#ff8a4a' } },
  kooka:       { base: 'bird', colors: { b: '#8a7a5a', w: '#5a86b0', l: '#e8e0c8' } },
  kooka_e:     { base: 'bird', colors: { b: '#5a4a6a', w: '#9a4ab0', l: '#d8c8e8' } },
  // water
  volteel:     { base: 'serpent', colors: { b: '#3a5a8a', s: '#243c5f', l: '#8ab8e0', e: '#ffe95c', o: '#ffe95c' } },
  volteel_e:   { base: 'serpent', colors: { b: '#8a8a2a', s: '#5f5f18', l: '#e0e08a', e: '#fff', o: '#fff' } },
  cod:         { base: 'fish' },
  cod_e:       { base: 'fish', colors: { b: '#7a3a6a', s: '#521f48', l: '#d89ac8' } },
  snapshell:   { base: 'turtle' },
  snapshell_e: { base: 'turtle', colors: { b: '#3a5a7a', s: '#263c52', l: '#a8b0c0' } },
  // air
  talon:       { base: 'bird', colors: { b: '#6a5238', w: '#8a6a48', l: '#e0d0b0' } },
  talon_e:     { base: 'bird', colors: { b: '#3a4a6a', w: '#5a6a9a', l: '#c8d0e8' } },
  owl:         { base: 'bird', colors: { b: '#5a4a5a', w: '#7a6a7a', l: '#d0c8d0', e: '#ffd84a' } },
  owl_e:       { base: 'bird', colors: { b: '#2a2a3a', w: '#4a4a6a', l: '#a0a0c0', e: '#ff4a4a' } },
  // earth
  dingo:       { base: 'canine' },
  dingo_e:     { base: 'canine', colors: { b: '#6a6a72', l: '#c8c8d0', t: '#52525a' } },
  wildcat:     { base: 'feline' },
  wildcat_e:   { base: 'feline', colors: { b: '#5a3a2a', l: '#c8a888', e: '#ff8a3a' } },
  python:      { base: 'serpent', colors: { b: '#6a5a2a', s: '#483c18', l: '#c8b47a' } },
  python_e:    { base: 'serpent', colors: { b: '#2a5a4a', s: '#183c30', l: '#8ac8b0' } },
  tazzy:       { base: 'devil' },
  tazzy_e:     { base: 'devil', colors: { b: '#4a1a2a', e: '#ffe04a' } },
  gknight:     { base: 'knight' },
  gknight_e:   { base: 'knight', colors: { b: '#4a3a5a', l: '#b0a0c8', m: '#c8a03a', h: '#8a6a1a' } },
  // bosses (scaled)
  boss_scorchjaw:  { base: 'croc', scale: 2, colors: { b: '#a03a1a', s: '#701f0a', l: '#f0b05a', w: '#ff8a3a', e: '#ffe04a' } },
  boss_murkmaw:    { base: 'fish', scale: 2, colors: { b: '#2a5a4a', s: '#183c30', l: '#8ac8b0', e: '#ffe04a' } },
  boss_galestrike: { base: 'bird', scale: 2, colors: { b: '#4a5a7a', w: '#8aa8d0', l: '#e8f0ff', e: '#ffe04a' } },
  boss_kinggoanna: { base: 'knight', scale: 2, colors: { b: '#5a5230', l: '#c8bc86', m: '#a8781a', h: '#7a5a12', g: '#ffd84a' } },
  boss_apexus:     { base: 'chimera', scale: 2 },
  mini_fox:    { base: 'canine', scale: 2, colors: { b: '#d9622b', l: '#f0e0c8', t: '#f0a03a' } },
  mini_eel:    { base: 'serpent', scale: 2, colors: { b: '#3a5a8a', s: '#243c5f', l: '#8ab8e0', e: '#ffe95c', o: '#ffe95c' } },
  mini_owl:    { base: 'bird', scale: 2, colors: { b: '#5a4a5a', w: '#7a6a7a', l: '#d0c8d0', e: '#ffd84a' } },
  mini_python: { base: 'serpent', scale: 2, colors: { b: '#6a5a2a', s: '#483c18', l: '#c8b47a' } },
};

// ---------- build ----------
export const sprites = {}; // name -> {canvas, w, h}
const flashCache = new Map(), tintCache = new Map();

// Tone derivation for the palette conventions described at the top of the file.
function hexToRgb(h) {
  h = h.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return [n >> 16 & 255, n >> 8 & 255, n & 255];
}
function mix(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
}
// Highlights warm toward cream, shadows cool toward a deep violet: the classic pixel-art
// hue shift, so shaded fur doesn't just go muddy.
const lighten = (c, t = 0.38) => mix(c, '#fff4d8', t);
const darken = (c, t = 0.35) => mix(c, '#1c1030', t);

// Fill in every derived key that the merged palette doesn't set explicitly.
function resolvePalette(colors, shade) {
  const pal = { ...colors };
  if (shade) {
    for (const [key, [src, amt]] of Object.entries(shade)) {
      if (key in pal || !pal[src]) continue;
      pal[key] = amt < 0 ? darken(pal[src], -amt) : lighten(pal[src], amt);
    }
  }
  return pal;
}

function renderMap(map, colors, scale = 1, shade = null) {
  const pal = resolvePalette(colors, shade);
  const w = Math.max(...map.map(r => r.length));
  const h = map.length;
  const c = document.createElement('canvas');
  c.width = w * scale; c.height = h * scale;
  const g = c.getContext('2d');
  for (let y = 0; y < h; y++) {
    const row = map[y];
    for (let x = 0; x < row.length; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      let col = pal[ch];
      // uppercase = auto highlight of the lowercase key
      if (!col && ch >= 'A' && ch <= 'Z' && pal[ch.toLowerCase()]) col = pal[ch] = lighten(pal[ch.toLowerCase()]);
      g.fillStyle = col || '#ff00ff';
      g.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  return { canvas: c, w: c.width, h: c.height };
}

export function buildSprites() {
  for (const [name, def] of Object.entries(DEFS)) {
    sprites[name] = renderMap(def.map, def.colors, 1, def.shade);
    if (def.map2) sprites[name + '_2'] = renderMap(def.map2, def.colors, 1, def.shade);
  }
  for (const [name, v] of Object.entries(VARIANTS)) {
    const base = DEFS[v.base];
    const colors = { ...base.colors, ...(v.colors || {}) };
    sprites[name] = renderMap(base.map, colors, v.scale || 1, base.shade);
    if (base.map2) sprites[name + '_2'] = renderMap(base.map2, colors, v.scale || 1, base.shade);
  }
  sprites.gate = buildGateSprite();
}

// Two-frame animation. A def's optional `map2` (a second pose on the same grid: the other
// leg stride, the wing downstroke, a tail flick) is built as '<name>_2' for the base and
// every palette variant. Given a running phase, this picks the frame to draw -- names with
// no second frame just get themselves back, so callers never need to know which is which.
export function frameName(name, phase) {
  return Math.floor(phase) % 2 === 1 && sprites[name + '_2'] ? name + '_2' : name;
}

function whiteCopy(name) {
  if (flashCache.has(name)) return flashCache.get(name);
  const s = sprites[name];
  const c = document.createElement('canvas');
  c.width = s.w; c.height = s.h;
  const g = c.getContext('2d');
  g.drawImage(s.canvas, 0, 0);
  g.globalCompositeOperation = 'source-atop';
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, s.w, s.h);
  flashCache.set(name, c);
  return c;
}

function tintCopy(name, tint) {
  const key = name + '|' + tint;
  if (tintCache.has(key)) return tintCache.get(key);
  const s = sprites[name];
  const c = document.createElement('canvas');
  c.width = s.w; c.height = s.h;
  const g = c.getContext('2d');
  g.drawImage(s.canvas, 0, 0);
  g.globalCompositeOperation = 'source-atop';
  g.globalAlpha = 0.35;
  g.fillStyle = tint;
  g.fillRect(0, 0, s.w, s.h);
  tintCache.set(key, c);
  return c;
}

// Draw sprite with bottom-center anchored at (cx, bottomY).
export function drawSprite(ctx, name, cx, bottomY, opts = {}) {
  const s = sprites[name];
  if (!s) return;
  const { flip = false, alpha = 1, flash = false, tint = null, squash = 0, angle = 0 } = opts;
  const img = flash ? whiteCopy(name) : tint ? tintCopy(name, tint) : s.canvas;
  const sy = 1 - 0.14 * squash;
  ctx.save();
  ctx.globalAlpha *= alpha;   // combine with the caller's alpha, don't clobber it
  ctx.translate(Math.round(cx), Math.round(bottomY));
  if (angle) ctx.rotate(angle);
  ctx.scale(flip ? -1 : 1, sy);
  ctx.drawImage(img, -Math.round(s.w / 2), -s.h);
  ctx.restore();
}
