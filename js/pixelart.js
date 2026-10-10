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

import { SWORD_LOOK, ARROWS } from './config.js';
import { HOUSE_DEFS, buildHouseSprites } from './houseart.js';
import { END_DEFS, buildEndSprites } from './endart.js';
import { KING_DEFS, buildKingSprites } from './kingart.js';

const DEFS = {};

// ---------- GUS THE PLATYPUS ----------
// 16x16, lit from the top-left: highlights ride the crown of the head, the top of the
// bill and the upper belly; shade pools under the chin, along the flank and under the bill.
const GUS_COLORS = {
  d: '#302638', b: '#946044', l: '#e2b879', o: '#e9ad52',
  e: '#201d2c', w: '#fff3d6', t: '#664450', f: '#c78c46', m: '#388c86',
};
const GUS_SHADE = { s: ['b', -0.32], p: ['o', -0.3], k: ['l', -0.22], u: ['t', 0.35] };
DEFS.gus_idle = { colors: GUS_COLORS, shade: GUS_SHADE, map: [
  '.....ddddd......',
  '....dBBbbbd.....',
  '...dBBbbbbbd....',
  '...dbbbbwwed....',
  '...dbbbbweedddd.',
  '....dbbbdOOoood.',
  '....dbbbbdpppd..',
  '...dbmMMmmbbd...',
  '...dbLLlllkbbd..',
  '..udbLllllkbbd..',
  '.uutbllllkkbbd..',
  'uutdbbllkbbbsd..',
  'utudbsbbbbbssd..',
  '.ttddssbbbbsdd..',
  '..t..fFF.ffF....',
  '....FFFf.FFFf...',
]};
// Walk cycle: two planted strides with a swinging, crosshatched paddle tail.
// Both frames keep the torso on the same 16x16 grid so every armor tier stays registered.
DEFS.gus_walk1 = { colors: GUS_COLORS, shade: GUS_SHADE, map: [
  '.....ddddd......',
  '....dBBbbbd.....',
  '...dBBbbbbbd....',
  '...dbbbbwwed....',
  '...dbbbbweedddd.',
  '....dbbbdOOoood.',
  '....dbbbbdpppd..',
  '...dbmMMmmbbd...',
  '.uudbLLlllkbbd..',
  'uutdbLllllkbbd..',
  'utudbllllkkbbd..',
  '.ttdbbllkbbbsd..',
  '..tdbsbbbbbssd..',
  '.ttddssbbbbsdd..',
  '...fFF.....ffF..',
  '..FFFf.....FFFf.',
]};
DEFS.gus_walk2 = { colors: GUS_COLORS, shade: GUS_SHADE, map: [
  '.....ddddd......',
  '....dBBbbbd.....',
  '...dBBbbbbbd....',
  '...dbbbbwwed....',
  '...dbbbbweedddd.',
  '....dbbbdOOoood.',
  '....dbbbbdpppd..',
  '...dbmMMmmbbd...',
  '...dbLLlllkbbd..',
  '...dbLllllkbbd..',
  '...dbllllkkbbd..',
  '..udbbllkbbbsd..',
  '.uudbsbbbbbssd..',
  'utuddssbbbbsdd..',
  'utt..fFF.ffF....',
  '.tt.FFFf.FFFf...',
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
  '....vhhvvvkvv...',
  '....vhvvhvvkv...',
  '....vvvvhvvkv...',
  '....kvvvvvvkk...',
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
  '...dmhhhmmmkd...',
  '....hmhmmmhmk...',
  '....mmhmhmmmk...',
  '....kmmmmmmkk...',
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
  '....dBBbbbd.....',
  '...dBBbbbbbd....',
  '...dbbbbwwed....',
  '...dbbbbweedddd.',
  '....dbbbdOOoood.',
  '....dbbbbdpppd..',
  'R..dbmMMmmbbd.R.',
  'rrrdbLLlllkbbdrr',
  '.RrrrrrRrrrrrrR.',
]};

// ---------- CREATURES (bases; palette variants defined below) ----------
// Every base derives its outline from the body so palette swaps stay coherent, and uses
// 's' (or 'k') as its shadow tone. Bodies are lit from the top-left like Gus.
const BODY_SHADE = { d: ['b', -0.62], s: ['b', -0.3], k: ['l', -0.22] };
DEFS.rodent = { colors: { b: '#6b4a2f', l: '#c7b299', t: '#8a6a4a', e: '#111', o: '#e08a90', f: '#3a2a1c' }, shade: BODY_SHADE, map: [
  '..........dd.dd.',
  '..........dodbod',
  '.tt.......dBBbbd',
  '.tTt.....dbblbed',
  '..tTt.ddddBbbbbo',
  '...ttdbBBbbblld.',
  '....dbblllbbbsd.',
  '.....dbslllsbd..',
  '.....ddbsbsbd...',
  '......ff.dff....',
], map2: [
  '..........dd.dd.',
  '.tt.......dodbod',
  '.tTt......dBBbbd',
  '..tTt....dbblbed',
  '...tt.ddddBbbbbo',
  '....ddbBBbbblld.',
  '....dbblllbbbsd.',
  '.....dbslllsbd..',
  '.....ddbsbsbd...',
  '.....ff...dff...',
]};
DEFS.canine = { colors: { b: '#c28a4a', l: '#e8d3ae', t: '#a06c34', e: '#111', o: '#211510', f: '#39251a' }, shade: BODY_SHADE, map: [
  '............d.d..',
  '...........dbdbd.',
  'tT.........dBbBd.',
  'tTt.....ddddblbed',
  '.tTt..ddbBBbbbbbo',
  '..tt.dbbBBbbbllld',
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
  'tTt.....ddddblbed',
  '.tTt..ddbBBbbbbbo',
  '..tt.dbbBBbbbllld',
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
  '.tt.....ddddlebd',
  '.tt...ddbBBbblbo',
  '..t..dbbBBbbblld',
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
  '.tt.....ddddlebd',
  '.tt...ddbBBbblbo',
  '..t..dbbBBbbblld',
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
  '..................',
  '..................',
  '....d..d..d.......',
  '...dWddWddWd.dd...',
  '..dsBbdddddddbed..',
  '.dbBbbbBbbbBbbbbdd',
  'dbsbbsbbsbbsbbbbbb',
  'dbbbbbbbbbbbdwdwdw',
  '.dblllllllbbdddddd',
  '..dbsbbsbbsbbd....',
  '..dbd.dbd.dbd.....',
  '..ff..ff..ff......',
], map2: [
  '..................',
  '..................',
  '....d..d..d.......',
  '...dWddWddWd.dd...',
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
  '...dkwwBbbbwwkd.',
  '....dkbBlbebkdoo',
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
  '...dkbBlbebbkdoo',
  '..dWwdbllbbbdwwd',
  '.dWwwdbllsbdwwkd',
  'dWwwkddbbbddwkd.',
  'dkwkd.dsdsdsdkd.',
  '.ddd...ddddd.dd.'
]};
DEFS.fish = { colors: { b: '#3f7a86', s: '#2a5860', l: '#9ecfd8', e: '#e0e858', o: '#12262a', n: '#2a5860' }, shade: { d: ['b', -0.62], k: ['l', -0.2] }, map: [
  '.......nNn.......',
  '.....ddbnnndddd..',
  '...ddbbbbbbbbBBd.',
  '..dbsbbsBbsBbbebd',
  'nndsbbbbbbbbdoobd',
  '.nNdbbsbbsbdooobd',
  '.nndsbbbbbbbbbbd.',
  '....ddklllLlkdd..',
  '......ddddnnd....',
], map2: [
  '.......nNn.......',
  '.....ddbnnndddd..',
  'nn.ddbbbbbbbbBBd.',
  'nNdbsbbsBbsBbbebd',
  'nndsbbbbbbbbdoobd',
  '..ddbbsbbsbdooobd',
  '...dsbbbbbbbbbbd.',
  '....ddklllLlkdd..',
  '......ddddnnd....'
]};
DEFS.turtle = { colors: { b: '#5a7a3a', s: '#3c5426', l: '#b0a068', e: '#111', f: '#4a3c20' }, shade: { d: ['b', -0.62], k: ['l', -0.22] }, map: [
  '.....ddddd......',
  '...ddBBBBbdd....',
  '..dBblbsblbbd...',
  '.dBblbbsbblbbdd.',
  '.dbbsssssssbbdbd',
  '.dbbblbbsblbbdeb',
  '..dlLllllllddbbd',
  '...dklllllkd.dd.',
  '...dfd.dfd.d....',
  '...ff..ff.......',
], map2: [
  '.....ddddd......',
  '...ddBBBBbdd....',
  '..dBblbsblbbd...',
  '.dBblbbsbblbbdd.',
  '.dbbsssssssbbdbd',
  '.dbbblbbsblbbdeb',
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


// Broad facial disc and ear tufts distinguish owls from the long-winged raptors.
DEFS.owl = { colors: DEFS.bird.colors, shade: DEFS.bird.shade, map: [
  '.....d...d......',
  '....dbdddBd.....',
  '....dblLlbd.....',
  'dd..dleloed...dd',
  'dWwddblllbddwWWd',
  '.dWwwbBbbBwwwWd.',
  '..dkwblLlbbwwd..',
  '...ddblklbbdd...',
  '.....dbsbbd.....',
  '.....dodod......',
  '......ddd.......',
], map2: [
  '.....d...d......',
  '....dbdddBd.....',
  '....dblLlbd.....',
  '....dleloed.....',
  '....dblllbdd....',
  '...ddbBbbBbdd...',
  '..dWwblLlbbwwd..',
  '.dWwwblklbbwwWd.',
  'dWwkddbsbbddwkWd',
  '.ddd.dodod..ddd.',
  '......ddd.......',
]};
// Eels swim horizontally: a ribbon fin and luminous lateral stripe, not a snake coil.
DEFS.eel = { colors: DEFS.serpent.colors, shade: DEFS.serpent.shade, map: [
  '................',
  '..........lll...',
  '.........dBBBdd.',
  '...lll..dBBbbed.',
  '..dBBBddBbbbbbdo',
  '.dBbbBbbblLllld.',
  'dBbddbbllddddd..',
  'dbd..dddd.......',
  '.dd.............',
], map2: [
  '................',
  '..........lll...',
  '.........dBBBdd.',
  '........dBBbbed.',
  '.ddlll.ddbbbbbdo',
  'dBBbBBdBblLllld.',
  '.ddbbBbllddddd..',
  '...ddddd........',
  '................',
]};

// ---------- ITEMS & PROPS ----------
DEFS.coin = { colors: { g: '#e9b64c', h: '#fff0b5', d: '#815137' }, map: [
  '.dddd.',
  'dgHHgd',
  'dHgggg',
  'dHgdgg',
  'dggggd',
  '.dddd.',
]};
DEFS.diamond = { colors: { c: '#6ae0f0', h: '#d8fbff', d: '#2a90b0' }, map: [
  '.ddddd.',
  'dhcHccd',
  '.dhccd.',
  '..dcd..',
  '...d...',
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
// A treasure chest worth finding: dark wood bound in gold, a ruby set in the lock. Opened,
// the lid tips back and the treasure inside glows.
const CHEST_COLORS = { w: '#7a4a24', d: '#2a1808', g: '#f0c83a', l: '#9a6234', r: '#d83040', k: '#1a0f06', y: '#fff2a0' };
DEFS.chest = { colors: CHEST_COLORS, map: [
  '..dddddddddddd..',
  '.dgGGggggggGGgd.',
  'dgwWWwwwwwwWWwgd',
  'dgwwlwwwwwwlwwgd',
  'dgwwwwwwwwwwwwgd',
  'dGggggggggggggGd',
  'dgwwwwdrrdwwwwgd',
  'dgwlwwdrRdwwlwgd',
  'dgwwwwwddwwwwwgd',
  'dgwlwwwwwwwwlwgd',
  'dggggggggggggggd',
  '.dddddddddddddd.',
]};
DEFS.chest_open = { colors: CHEST_COLORS, map: [
  '..dddddddddddd..',
  '.dgGGggggggGGgd.',
  'dgwwlwwwwwwlwwgd',
  'dgkkkkkkkkkkkkgd',
  'dgkyyyyyyyyyykgd',
  'dGyYYyyyyyyYYyGd',
  'dgwwwwdrrdwwwwgd',
  'dgwlwwdrRdwwlwgd',
  'dgwwwwwddwwwwwgd',
  'dgwlwwwwwwwwlwgd',
  'dggggggggggggggd',
  '.dddddddddddddd.',
]};
// a golden crayfish from the rivers: one nibble and the goo lets go of Gus's hearts
DEFS.suncray = { colors: { r: '#f0b020', d: '#8a5a10', l: '#fff0a0', e: '#111' }, shade: { k: ['r', -0.25] }, map: [
  'Rr.....rR..',
  '.Rr...rR...',
  '..rdRrrd...',
  '.rRrrrrrrd.',
  'derrlLlrrdd',
  '.rrrkkkrrd.',
  '..d..d..d..',
]};
// Open clay jar: a thick oval rim, dark interior, narrow neck and rounded belly.
DEFS.pot = { colors: { c: '#b87853', d: '#4c3540', h: '#e4ad77', i: '#382d38' }, shade: { k: ['c', -0.3] }, map: [
  '...dddddd...',
  '..dhhhhhhd..',
  '..dhiiiihd..',
  '...dccccd...',
  '...dchckd...',
  '..dcChcckd..',
  '.dcChcccckd.',
  'dcChcccccckd',
  'dcChcccccckd',
  'dcccccccckkd',
  '.dccccckkkd.',
  '..dddddddd..',
]};
DEFS.bomb = { colors: { k: '#343749', h: '#8294a0', f: '#f0a03a', s: '#635565', d: '#202332' }, map: [
  '....sF..',
  '...sf...',
  '...hh...',
  '..dddd..',
  '.dkHkkd.',
  'dkHkkksd',
  'dkkkkksd',
  '.dksssd.',
  '..dddd..',
]};
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
  '....dBBbbbd.....',
  '...dBBbbbbbd....',
  '...dbbbbwwed....',
  '...dbbbbweedddd.',
  '....dbbbdOOoood.',
  '....dbbbbdpppd..',
  '...dbbBBbbbbd...',
  '...dbLLlllkbbd..',
  '..udbLllllkbbd..',
  '.uutbllllkkbbd..',
  'uutdbbllkbbbsd..',
  'utudbsbbbbbssd..',
  '.ttddssbbbbsdd..',
  '..t..fFF.ffF....',
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
// a heart broken by the alien goo: near-black, with a sick red crack through it
DEFS.heart_gloom = { colors: { r: '#2a0c34', h: '#5a1a6a', c: '#e0304a' }, map: [
  '.rr.rr.', 'rhrcrrr', 'rrcrrrr', '.rrcrr.', '..rcr..', '...r...',
]};
// Mama Pearl: Gus's build in a warmer coat, a pink apron where his scarf sits, and a
// flower tucked behind her ear so she reads as someone new at a glance.
DEFS.mama = { colors: { ...GUS_COLORS, b: '#8a5a44', l: '#f0cc98', m: '#e27aa4', r: '#ff9ad0', y: '#ffe066' }, shade: GUS_SHADE, map: [
  '..r..ddddd......',
  '.ryrdBBbbbd.....',
  '..rdBBbbbbbd....',
  '...dbbbbwwed....',
  '...dbbbbweedddd.',
  '....dbbbdOOoood.',
  '....dbbbbdpppd..',
  '...dbmMMmmbbd...',
  '...dbmMMmmkbbd..',
  '..udbmmmmmkbbd..',
  '.uutbmmmmkkbbd..',
  'uutdbbllkbbbsd..',
  'utudbsbbbbbssd..',
  '.ttddssbbbbsdd..',
  '..t..fFF.ffF....',
  '....FFFf.FFFf...',
]};
// Puggles (baby platypuses): Gus in miniature -- big head, stubby bill, round belly --
// in a lighter, fluffier coat. The second frame is a waddle. The grid is padded (2 columns
// each side, 2 rows on top) so the accessory overlays below can stick out past the body.
const PUGGLE_COLORS = { ...GUS_COLORS, b: '#b07a52', l: '#f2d29c', o: '#f0b862', t: '#7a5260' };
DEFS.puggle = { colors: PUGGLE_COLORS, shade: GUS_SHADE, map: [
  '...............',
  '...............',
  '.....dddd......',
  '....dBBbbd.....',
  '...dBbbbwed....',
  '...dbbbbeeddd..',
  '....dbbdOOood..',
  '....dbbbdppd...',
  '...udLLlkbd....',
  '..uudllkbbd....',
  '...tddbbbsd....',
  '.....fF.fF.....',
], map2: [
  '...............',
  '...............',
  '.....dddd......',
  '....dBBbbd.....',
  '...dBbbbwed....',
  '...dbbbbeeddd..',
  '....dbbdOOood..',
  '....dbbbdppd...',
  '...udLLlkbd....',
  '..utdllkbbd....',
  '....tdbbbsd....',
  '....fF...fF....',
]};
// Accessories drawn over a puggle on the same grid, so no two broods look alike.
DEFS.pg_bow = { colors: { r: '#ff7ab0', k: '#c04a7a' }, map: [
  '...rR.Rr.......',
  '...rrkrr.......',
  '....r..r.......',
]};
DEFS.pg_leaf = { colors: { g: '#6ab04a', k: '#4a3a2a' }, map: [
  '.......Gg......',
  '.....gggg......',
  '......k........',
]};
DEFS.pg_flower = { colors: { y: '#ffe066', o: '#f08a3a' }, map: [
  '....y..........',
  '...yoy.........',
  '....y..........',
]};
DEFS.pg_crown = { colors: { y: '#ffd84a', r: '#e04a5a' }, map: [
  '....y.y.y......',
  '....yYrYy......',
]};
DEFS.pg_shades = { colors: { k: '#1a1a24', w: '#8ab8e0' }, map: [
  '...............',
  '...............',
  '...............',
  '...............',
  '.....kkkwk.....',
  '........kk.....',
]};
DEFS.pg_scarf = { colors: { m: '#388c86' }, map: [
  '...............',
  '...............',
  '...............',
  '...............',
  '...............',
  '...............',
  '...............',
  '....mMMm.......',
  '..mm...........',
]};
// a stick held up like a sword, crossguard and all -- just like Gus's
DEFS.pg_stick = { colors: { w: '#b88a58', k: '#6a4a2a', h: '#f2d29c' }, map: [
  '...............',
  '.............W.',
  '.............w.',
  '.............w.',
  '.............w.',
  '.............w.',
  '.............w.',
  '............kkk',
  '...........hhk.',
]};
// overlays share the puggle's full 15x12 grid (sprites anchor bottom-centre), so pad them out
export const PUGGLE_ACCESSORIES = ['pg_bow', 'pg_leaf', 'pg_stick', 'pg_flower', 'pg_scarf', 'pg_crown', 'pg_shades'];
for (const k of PUGGLE_ACCESSORIES) {
  const m = DEFS[k].map.map(r => r.padEnd(15, '.'));
  while (m.length < 12) m.push('.'.repeat(15));
  DEFS[k].map = m;
}
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

// ---------- WEAPONS ----------
// The same tiny, outlined weapons appear in the art sheet and in combat.
// Tier 7 is the God Sword: no bow or shop step shares it, so its bow is skipped below.
for (let tier = 1; tier < SWORD_LOOK.length; tier++) {
  const look = SWORD_LOOK[tier];
  const grid = Array.from({ length: 9 }, () => Array(look.len + 1).fill('.'));
  const box = (x, y, w, h, key) => {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) grid[yy][xx] = key;
  };
  const top = 4 - Math.floor(look.w / 2), knee = look.len - 4;
  box(1, 3, 4, 3, 'd'); box(1, 4, 3, 1, 'p');
  box(4, top - 2, 3, look.w + 4, 'd'); box(5, top - 1, 1, look.w + 2, 'g');
  box(6, top - 1, knee - 5, look.w + 2, 'd');
  box(6, top, knee - 5, look.w, 'b'); box(6, top, knee - 5, 1, 'h');
  box(knee + 1, top, 2, look.w, 'd'); box(knee + 1, 4, 2, 1, 'h');
  box(look.len - 1, 4, 1, 1, 'h'); box(look.len, 4, 1, 1, 'd');
  if (tier >= 4) box(8, top + 1, 2, 1, 'g');
  if (tier >= 7) { box(5, top - 2, 1, 1, 'h'); box(5, top + look.w + 1, 1, 1, 'h'); box(12, top + 1, 2, 1, 'g'); box(16, top + 1, 2, 1, 'g'); }
  DEFS['sword' + tier] = { colors: { d: look.dark, p: look.grip, g: look.guard, b: look.core, h: look.edge }, map: grid.map(row => row.join('')) };
  if (tier > 6) continue;
  DEFS['bow' + tier] = { colors: { d: '#302b3e', b: tier < 3 ? '#a87952' : look.core, h: look.edge, g: look.guard, s: '#e4d4b1' }, map: [
    '....dd..', '...dhds.', '..dhbds.', '.dhbd.s.', '.dbd..s.', 'dhbd..s.',
    'dgbd..s.', 'dhbd..s.', '.dbd..s.', '.dhbd.s.', '..dhbds.', '...dhds.', '....dd..',
  ]};
}
for (const [name, arrow] of Object.entries(ARROWS)) {
  DEFS['arrow_' + name] = { colors: { d: '#303344', b: '#b99568', h: '#f7e9c5', c: arrow.color }, map: [
    'hh.......d...', '.hdddddddcdd.', '..bbbbbbcccch', '.hdddddddcdd.', 'hh.......d...',
  ]};
}

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
  volteel:     { base: 'eel', colors: { b: '#3a5a8a', s: '#243c5f', l: '#8ab8e0', e: '#ffe95c', o: '#ffe95c' } },
  volteel_e:   { base: 'eel', colors: { b: '#8a8a2a', s: '#5f5f18', l: '#e0e08a', e: '#fff', o: '#fff' } },
  cod:         { base: 'fish' },
  cod_e:       { base: 'fish', colors: { b: '#7a3a6a', s: '#521f48', l: '#d89ac8' } },
  snapshell:   { base: 'turtle' },
  snapshell_e: { base: 'turtle', colors: { b: '#3a5a7a', s: '#263c52', l: '#a8b0c0' } },
  // air
  talon:       { base: 'bird', colors: { b: '#6a5238', w: '#8a6a48', l: '#e0d0b0' } },
  talon_e:     { base: 'bird', colors: { b: '#3a4a6a', w: '#5a6a9a', l: '#c8d0e8' } },
  owl:         { base: 'owl', colors: { b: '#5a4a5a', w: '#7a6a7a', l: '#d0c8d0', e: '#ffd84a' } },
  owl_e:       { base: 'owl', colors: { b: '#2a2a3a', w: '#4a4a6a', l: '#a0a0c0', e: '#ff4a4a' } },
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
  mini_eel:    { base: 'eel', scale: 2, colors: { b: '#3a5a8a', s: '#243c5f', l: '#8ab8e0', e: '#ffe95c', o: '#ffe95c' } },
  mini_owl:    { base: 'owl', scale: 2, colors: { b: '#5a4a5a', w: '#7a6a7a', l: '#d0c8d0', e: '#ffd84a' } },
  mini_python: { base: 'serpent', scale: 2, colors: { b: '#6a5a2a', s: '#483c18', l: '#c8b47a' } },
  // puggle coats
  puggle_cream: { base: 'puggle', colors: { b: '#d6a878', l: '#fff0cc', t: '#a07a6a' } },
  puggle_choc:  { base: 'puggle', colors: { b: '#7a4a30', l: '#e0b080', t: '#5a3a40' } },
  // Dot, Pip's little sister: a lighter coat and a pink scarf
  dot: { base: 'villager', colors: { b: '#c48a5a', l: '#f2d4a8', m: '#e27aa4' } },
};
Object.assign(DEFS, HOUSE_DEFS, END_DEFS, KING_DEFS);

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
  buildHouseSprites(sprites);
  buildEndSprites(sprites, { DEFS, VARIANTS, renderMap, mix });
  buildKingSprites(sprites, { DEFS, renderMap });
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
