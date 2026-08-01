// All character/item art as ASCII pixel maps, rendered once into offscreen canvases.
// '.' or ' ' = transparent. Sprites face RIGHT; drawSprite flips for left.

const DEFS = {};

// ---------- GUS THE PLATYPUS ----------
const GUS_COLORS = {
  d: '#5c3a1e', b: '#8a5a32', l: '#c9985c', o: '#e0a33e',
  e: '#14100c', w: '#f7f2e2', t: '#432b14', f: '#c88428',
};
DEFS.gus_idle = { colors: GUS_COLORS, map: [
  '...dddd.......',
  '..dbbbbd......',
  '.dbbbbbbd.....',
  '.dbbbewbd.....',
  '.dbbbbbbdoooo.',
  '..dbbbbdooo...',
  '..dbbbbbbd....',
  '.tdbllllbd....',
  'ttdbllllbd....',
  'ttdbllllbd....',
  '.tdbllllbd....',
  '..dbbbbbbd....',
  '...dbbbbd.....',
  '...ff..ff.....',
  '..fff..fff....',
]};
DEFS.gus_walk1 = { colors: GUS_COLORS, map: [
  '...dddd.......',
  '..dbbbbd......',
  '.dbbbbbbd.....',
  '.dbbbewbd.....',
  '.dbbbbbbdoooo.',
  '..dbbbbdooo...',
  '..dbbbbbbd....',
  '.tdbllllbd....',
  'ttdbllllbd....',
  'ttdbllllbd....',
  '.tdbllllbd....',
  '..dbbbbbbd....',
  '...dbbbbd.....',
  '..ff...ff.....',
  '.fff....fff...',
]};
DEFS.gus_walk2 = { colors: GUS_COLORS, map: [
  '...dddd.......',
  '..dbbbbd......',
  '.dbbbbbbd.....',
  '.dbbbewbd.....',
  '.dbbbbbbdoooo.',
  '..dbbbbdooo...',
  '..dbbbbbbd....',
  '.tdbllllbd....',
  'ttdbllllbd....',
  'ttdbllllbd....',
  '.tdbllllbd....',
  '..dbbbbbbd....',
  '...dbbbbd.....',
  '....ff.ff.....',
  '...fff..fff...',
]};
// ---------- ARMOR OVERLAYS ----------
// Same 14x15 grid as the Gus sprites, so these register pixel-for-pixel on top of him.
// Gus's torso sits at rows 7-11 cols 3-8; his head crown is rows 1-2.
DEFS.armor1 = { colors: { v: '#5f8f45', h: '#8ab868' }, map: [
  '..............',
  '..............',
  '..............',
  '..............',
  '..............',
  '..............',
  '..............',
  '...vvvvvv.....',
  '...vhvvhv.....',
  '...vvvvvv.....',
  '...vhvvhv.....',
  '...vvvvvv.....',
  '..............',
  '..............',
  '..............',
]};
DEFS.armor2 = { colors: { m: '#5a7a9a', h: '#8aa8c8', d: '#3a5270' }, map: [
  '..............',
  '..............',
  '..............',
  '..............',
  '..............',
  '..............',
  '..hd....dh....',
  '...mmmmmm.....',
  '...hmhmhm.....',
  '...mmmmmm.....',
  '...mhmhmh.....',
  '...mmmmmm.....',
  '....mmmm......',
  '..............',
  '..............',
]};
DEFS.armor3 = { colors: { p: '#3a3a48', h: '#5a5a70', g: '#f0c83a' }, map: [
  '..............',
  '...pppp.......',
  '..pggggp......',
  '..............',
  '..............',
  '..............',
  '..hp....ph....',
  '...pppppp.....',
  '...pggggp.....',
  '...phhhhp.....',
  '...pppppp.....',
  '...pgggpp.....',
  '....pppp......',
  '..............',
  '..............',
]};

DEFS.armor4 = { colors: { t: '#2f7f86', h: '#5fc3c8', w: '#e8fbff' }, map: [
  '..............',
  '...tttt.......',
  '..twwwwt......',
  '..............',
  '..............',
  '..............',
  '..ht....th....',
  '...tttttt.....',
  '...twwwwt.....',
  '...thhhht.....',
  '...twwwwt.....',
  '...tttttt.....',
  '....tttt......',
  '..............',
  '..............',
]};
DEFS.armor5 = { colors: { p: '#3b2a5e', h: '#6a4fa0', c: '#7ad4ff', w: '#dff6ff' }, map: [
  '..............',
  '...pppp.......',
  '..pccccp......',
  '..............',
  '..............',
  '..............',
  '..hp....ph....',
  '...pppppp.....',
  '...pc..cp.....',
  '...phccph.....',
  '...pc..cp.....',
  '...pppppp.....',
  '....pwwp......',
  '..............',
  '..............',
]};
DEFS.armor6 = { colors: { s: '#d8d4c8', h: '#ffffff', g: '#f0c83a', c: '#7ad4ff' }, map: [
  '...gggg.......',
  '..gssssg......',
  '..gwwwwg......',
  '..............',
  '..............',
  '..............',
  '..gs....sg....',
  '...gggggg.....',
  '...gshhsg.....',
  '...gscsgg.....',
  '...gshhsg.....',
  '...gggggg.....',
  '....gwwg......',
  '..............',
  '..............',
]};

DEFS.gus_swim = { colors: { ...GUS_COLORS, r: '#bfe8f2' }, map: [
  '...dddd.......',
  '..dbbbbd......',
  '.dbbbbbbd.....',
  '.dbbbewbd.....',
  '.dbbbbbbdoooo.',
  '..dbbbbdooo...',
  'r.dbbbbbbd..r.',
  'rrrbbbbbbdrrr.',
  '.rrrrrrrrrr...',
]};

// ---------- CREATURES (bases; palette variants defined below) ----------
DEFS.rodent = { colors: { d: '#33241a', b: '#6b4a2f', l: '#c7b299', t: '#8a6a4a', e: '#111', o: '#d9848a', f: '#33241a' }, map: [
  '...........dd..',
  'tt.........dbd.',
  '.tt....ddddbbd.',
  '..tt.ddbbbbbebd',
  '..tddbbbbbbbbdo',
  '...dbblllllbbd.',
  '...dbbllllbbd..',
  '....dbdbbdbd...',
  '....ff.ff.ff...',
]};
DEFS.canine = { colors: { d: '#39251a', b: '#c28a4a', l: '#e8d3ae', t: '#a06c34', e: '#111', o: '#211510', f: '#39251a' }, map: [
  '...........d.d..',
  '..........dbdbd.',
  'tt........dbbbd.',
  '.ttt...ddddbebd.',
  '..ttddbbbbbbbbdo',
  '...tdbbbbbbbbdd.',
  '...dbblllllbbd..',
  '....dbbbbbbbd...',
  '....dbd.db.bd...',
  '....db..db..d...',
  '....ff..ff..f...',
]};
DEFS.feline = { colors: { d: '#2c2320', b: '#8d8078', l: '#cfc4b6', t: '#6e625a', e: '#c8e04a', o: '#1d1512', f: '#2c2320' }, map: [
  '..........d.d..',
  '.........dbdbd.',
  'ttt......dbbbd.',
  '..tt..ddddbebd.',
  '...tddbbbbbbbdo',
  '....dbbbbbbbdd.',
  '....dbllllbbd..',
  '.....dbbbbbd...',
  '.....dbd.bd....',
  '.....db..db....',
  '.....ff..ff....',
]};
DEFS.serpent = { colors: { d: '#20301c', b: '#4e7a3a', s: '#2f4d24', l: '#93b56a', e: '#e0c23a', o: '#c23a3a' }, map: [
  '......ddd......',
  '.....dbbbd.....',
  '.....dbebd.o...',
  '.....dbbdd.o...',
  '..ddddbbd......',
  '.dbbbbbbbbdd...',
  'dbsbbsbbsbbbd..',
  'dbbbbbbbbbbbd..',
  '.dbsbbsbbsbd...',
  '..ddbbbbbdd....',
  '....ddddd......',
]};
DEFS.lizard = { colors: { d: '#2e3018', b: '#707c34', s: '#4a521e', l: '#b8bf7a', e: '#e0c23a', f: '#2e3018' }, map: [
  '..............dd..',
  '..............dbd.',
  'dd.........dddbbd.',
  '.dd.ddddddbbbbbebd',
  '..ddbbsbbsbbbbbbdd',
  '...dbbbbbbbbbbbd..',
  '...dbsbbsbbsbbd...',
  '....dbd.bbd.bd....',
  '....ff..ff..ff....',
]};
DEFS.croc = { colors: { d: '#1d3320', b: '#3f6e42', s: '#294d2c', l: '#9db86a', e: '#e0b23a', w: '#d8e8f0', f: '#1d3320' }, map: [
  '.....ww...........',
  '....wwww..........',
  '...dwwwd..........',
  '...ddwd.....dd....',
  '..ddbbdddddbbbd...',
  '.dbbbbbbbbbbbebd..',
  'dbsbbsbbsbbbbbbddd',
  'dbbbbbbbbbbbdwdwdw',
  '.dblllllllbbdddddd',
  '..dbbdbbdbbd......',
  '..db..db..db......',
  '..ff..ff..ff......',
]};
DEFS.bird = { colors: { d: '#3a2c20', b: '#7a5a38', w: '#a8845a', l: '#d8c8a8', e: '#111', o: '#e0a33e' }, map: [
  'dd............dd',
  'dwwd........dwwd',
  '.dwwwd....dwwwd.',
  '..dwwwwddwwwwd..',
  '...ddbbbbbbdd...',
  '....dbbbebbdoo..',
  '....dblllbbd....',
  '.....dbbbbd.....',
  '......dbbd......',
  '.....d.dd.d.....',
]};
DEFS.fish = { colors: { d: '#1e3a40', b: '#3f7a86', s: '#2a5860', l: '#9ecfd8', e: '#e0e858', o: '#12262a', n: '#2a5860' }, map: [
  '.......nn........',
  '..ddddnnnbdd.....',
  '.dbbbbbbbbbbdd...',
  'dbebbbbbbbbbsbd..',
  'dboodbbbbbbbsbdtt',
  'dbooodbbbbbbbdtt.',
  '.dbbbbbbbbbsbdtt.',
  '..ddbbbbbbbdd....',
  '....ddddddd......',
]};
DEFS.turtle = { colors: { d: '#26301c', b: '#5a7a3a', s: '#3c5426', l: '#b0a068', e: '#111', f: '#4a3c20' }, map: [
  '.....ddddd......',
  '...ddbsbsbdd....',
  '..dbsbbbbbsbd...',
  '.dbbbbsbsbbbbdd.',
  '.dbsbbbbbbbsbdbd',
  '.dbbbsbsbsbbbdeb',
  '..dllllllllddbbd',
  '...dlllllld..dd.',
  '...df.ff.fd.....',
  '...ff.ff.ff.....',
]};
DEFS.devil = { colors: { d: '#1c1410', b: '#3a2620', l: '#e8e0d0', e: '#e04a3a', o: '#0e0a08', w: '#f0ece0', f: '#1c1410' }, map: [
  '..d.d....dd..',
  '.dbdbd..dbbd.',
  '.dbbbbddbbbd.',
  'dbbebbbbbbd..',
  'dbbbbbbbdd...',
  'dbwwbbbbbbd..',
  'dbwwbbbbbbbd.',
  '.dbbbbbbbbd..',
  '..dbbdbbdb...',
  '..db..db.....',
  '..ff..ff.....',
]};
DEFS.knight = { colors: { d: '#2e3018', b: '#707c34', l: '#b8bf7a', e: '#e0c23a', m: '#8a929c', h: '#5a626c', g: '#c8a03a' }, map: [
  '...dddd.......',
  '..dbbbbdd.....',
  '..dbbebbdd....',
  '..dbbbbbbd....',
  '...dbbbd..m...',
  '..ddbbbdd.m...',
  '.dbmmmmbd.m...',
  'gdbmmmmbdhh...',
  'gdbmmmmbdhhh..',
  '.dbmmmmbdhh...',
  '..dbbbbbd.....',
  '..dbbdbbd.....',
  '..db..db......',
  '..db..db......',
  '..ff..ff......',
]};
// Final boss: croc head + eagle wings + serpent coils, drawn large.
DEFS.chimera = { colors: { d: '#241430', b: '#5a3a72', s: '#3c2450', l: '#b090d0', e: '#ffd84a', w: '#8a6ab0', o: '#ff8a4a', t: '#3f6e42' }, map: [
  'dd......................dd',
  'dwwd..................dwwd',
  '.dwwwd..............dwwwd.',
  '..dwwwwd..........dwwwwd..',
  '...dwwwwwd......dwwwwwd...',
  '....ddwwwwd....dwwwwdd....',
  '......ddbbddddddbbdd......',
  '.....ddbbbbbbbbbbbbdd.....',
  '....dbbebbbbbbbbbbebbd....',
  '....dbbbbbbsbbsbbbbbbd....',
  '...dbbbbbbbbbbbbbbbbbbdd..',
  '..dbsbbsbbsbbsbbsbbsbbbbdd',
  '..dbbbbbbbbbbbbbbbbbbddodo',
  '..dblllllllllllllbbbdddddd',
  '...dbbbbbbbbbbbbbbbd......',
  'tt..dbbdbbdbbdbbdbd.......',
  '.tt.db..db..db..db........',
  '..ttff..ff..ff..ff........',
  '...tttt...................',
  '.....tttttt...............',
]};

// ---------- ITEMS & PROPS ----------
DEFS.coin = { colors: { g: '#f0c83a', h: '#fff0a0', d: '#a07818' }, map: [
  '.gggg.', 'ghhggg', 'ghgggg', 'gggggg', 'dggggd', '.dddd.',
]};
DEFS.diamond = { colors: { c: '#6ae0f0', h: '#d8fbff', d: '#2a90b0' }, map: [
  '.ccccc.', 'chhcccd', '.ccccd.', '..ccd..', '...c...',
]};
DEFS.crayfish = { colors: { r: '#d84a2a', d: '#8a2a12', l: '#f08a5a', e: '#111' }, map: [
  'rr.....rr..',
  '.rr...rr...',
  '..rdrrrd...',
  '.rrrrrrrrd.',
  'derrlllrrdd',
  '.rrrrrrrrd.',
  '..d..d..d..',
]};
DEFS.arrows = { colors: { w: '#a0764a', h: '#c8c8d0', f: '#d84a2a' }, map: [
  '..h..h..', '..hh.hh.', 'f.ww.ww.', 'ffwwfww.', 'f.ww.ww.', '..ww.ww.', '..f..f..',
]};
DEFS.key = { colors: { g: '#f0c83a', d: '#a07818' }, map: [
  '.ggg....', 'g...g...', 'g...gggg', 'g...g.g.', '.ggg..g.',
]};
DEFS.bigfang = { colors: { w: '#f0ead8', d: '#b0a488', g: '#f0c83a' }, map: [
  'wwwwww.', 'gggggg.', 'wwwwww.', '.wwww..', '.wwww..', '..www..', '..ww...', '..ww...', '...w...',
]};
DEFS.shard = { colors: { c: '#ffffff', h: '#ffffff', d: '#888888' }, map: [
  '...cc...', '..chhc..', '.chhhc..', '.chhc...', 'chhc....', 'chc.....', 'cc......', 'c.......',
]};
DEFS.chest = { colors: { w: '#8a5a2a', d: '#5a3a18', g: '#f0c83a', l: '#b07838' }, map: [
  '.dddddddddddd.',
  'dwwwwwwwwwwwwd',
  'dwlwwlwwlwwlwd',
  'dddddddddddddd',
  'dwwwwwdgdwwwwd',
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
DEFS.pot = { colors: { c: '#b07848', d: '#7a4c28', h: '#d8a878' }, map: [
  '...dddddd...',
  '..dcchhccd..',
  '.dccchhcccd.',
  'dcccchhccccd',
  'dccccccccccd',
  'dccccccccccd',
  '.dccccccccd.',
  '..dccccccd..',
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
DEFS.statue = { colors: { s: '#9aa2ac', d: '#5a626c', h: '#c8d0d8' }, map: [
  '....ssss......',
  '...shhsss.....',
  '...ssssssdd...',
  '...sssssd.....',
  '..sssssss.....',
  '.dsshhhss.....',
  'ddsshhhss.....',
  'ddsshhhss.....',
  '.dsshhhss.....',
  '..sssssss.....',
  '...sssss......',
  '..ss..ss......',
  'dssssssssd....',
  'dssssssssd....',
  'ddddddddddd...',
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
DEFS.elder = { colors: { d: '#4a4038', b: '#8a8078', l: '#c8c0b0', o: '#c89858', e: '#14100c', w: '#f7f2e2', t: '#3a322a', s: '#7a5a2a' }, map: [
  '...dddd....s..',
  '..dbbbbd...s..',
  '.dwbbbbwd..s..',
  '.dbbbewbd..s..',
  '.dbbbbbbdooos.',
  '..dbbbbdoo.s..',
  '..dbbbbbbd.s..',
  '.tdbllllbd.s..',
  'ttdbllllbd.s..',
  'ttdbllllbd.s..',
  '.tdbllllbd.s..',
  '..dbbbbbbd.s..',
  '...dbbbbd..s..',
  '...ff..ff..s..',
  '..fff..fff.s..',
].map(r => r.replace(/f/g, 'o'))};
DEFS.wombat = { colors: { d: '#3a2c20', b: '#8a6a4a', l: '#c0a888', e: '#14100c', o: '#5a4432', h: '#6a503a' }, map: [
  '..d..d.........',
  '.dbddbd........',
  '.dbbbbbdd......',
  'dbbebbbbbd.....',
  'dbbbbbbood.....',
  'dbbbbbbood.....',
  'dbbllllbbbd....',
  'dbbllllbbbd....',
  'dbbllllbbbd....',
  '.dbbbbbbbd.....',
  '..dbbdbbd......',
  '..dh..dh.......',
]};
DEFS.villager = { colors: { ...GUS_COLORS, b: '#a06a3a', l: '#d8b088' }, map: DEFS.gus_idle.map };
DEFS.heart = { colors: { r: '#e04a5a', h: '#ff9aa8', d: '#8a1a2a' }, map: [
  '.rr.rr.', 'rhrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...',
]};
// ---------- FRIENDS ----------
DEFS.dolphin = { colors: { b: '#5a8ab0', d: '#33566f', l: '#cfe6f4', e: '#14202a' }, map: [
  '........dd......',
  '.......dbbd.....',
  '..d....dbbbd....',
  '.ddd..dbbbbbdd..',
  'dbbbddbbbbbbbbd.',
  'dbbbbbbbbbbbebbd',
  '.dbbbllllllbbbbd',
  '..dbllllllllbdd.',
  '...ddddddddd....',
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

function renderMap(map, colors, scale = 1) {
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
      g.fillStyle = colors[ch] || '#ff00ff';
      g.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  return { canvas: c, w: c.width, h: c.height };
}

export function buildSprites() {
  for (const [name, def] of Object.entries(DEFS)) {
    sprites[name] = renderMap(def.map, def.colors);
  }
  for (const [name, v] of Object.entries(VARIANTS)) {
    const base = DEFS[v.base];
    sprites[name] = renderMap(base.map, { ...base.colors, ...(v.colors || {}) }, v.scale || 1);
  }
  sprites.gate = buildGateSprite();
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
