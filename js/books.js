// Books Gus can read. Some stand on bookshelves (pick one off the shelf and read it); the
// SECRET books lie out in the world, and each tells a secret. A few of those mark a spot with
// an X once they're read -- grab the shovel and dig there!
//
// Pages are plain text: `|` starts a new paragraph, and each page wraps to fit. The reader
// is its own mode ('book'): a list of titles first when it's a shelf, then the pages.

import { VIEW_W, VIEW_H, TILE } from './config.js';
import { wrapText } from './font.js';
import { Entity } from './entities.js';
import { drawSprite } from './pixelart.js';
import { input } from './input.js';
import { T } from './tiles.js';
import { audio } from './audio.js';

export const BOOKS = {
  // ---- Gus's shelf
  crayfish: { title: 'Crayfish and How to Catch Them', pages: [
    'Step one: find a crayfish.|Step two: catch the crayfish.|Step three: eat the crayfish.',
    'Crayfish hide under rocks, in tall grass, and inside pots. Smash a pot and see!|If you are hurt, a crayfish heals you right up. Mum says always keep one handy.',
    "The rarest crayfish of all is the GOLDEN CRAYFISH. They live in rivers and ponds.|Eat one and it can even mend hearts that alien goo has broken!" ] },
  swim: { title: 'Swim Like a Champion', pages: [
    'Platypuses are the best swimmers in the whole Vale. Deep water is no wall for you!',
    'Remember: you cannot swing a sword while you are paddling. Get out of the water to fight.|Pro tip: kick your feet. It helps.' ] },
  guardians: { title: 'Great Guardians of the Vale', pages: [
    'The River Guardians keep the Vale safe from predators. The bravest Guardians of all are Gus\'s mum and dad!',
    'Long ago, the first Guardians came from the PLATYPUS KINGDOM, far across the sea to the south.|Some say the Kingdom still stands, with a great castle in the middle of it.' ] },
  captainbill: { title: 'Captain Bill (Comic #12)', pages: [
    'CAPTAIN BILL: "Never fear, CAPTAIN BILL is here!"|CRAYFISH BANDIT: "Oh no! It\'s CAPTAIN BILL!"',
    'CAPTAIN BILL uses his SUPER BILL to scoop up the bandit.|CAPTAIN BILL: "Justice is served. With a side of chips."|THE END. (Collect all 12!)' ] },
  // ---- Mama Pearl's shelf
  hungrycray: { title: 'The Very Hungry Crayfish', pages: [
    'On Monday the crayfish ate one leaf. On Tuesday it ate two worms.|On Wednesday it ate three puggle snacks. The puggles were NOT happy.',
    'On Sunday it ate one big crunchy reed, and felt much better.|Then it turned into... a slightly bigger crayfish. The end!' ] },
  goodnight: { title: 'Goodnight Billabong', pages: [
    'Goodnight reeds. Goodnight moon. Goodnight billabong lagoon.',
    'Goodnight Gus, and goodnight Mum. Goodnight puggles, every one.|(Mama Pearl has to read this one fifty times a night.)' ] },
  wildpuggles: { title: 'Where the Wild Puggles Are', pages: [
    'The night a puggle wore his wolf suit, he made mischief of one kind and another.',
    'He sailed off to where the wild puggles are, and they made him king of them all!|"Let the wild rumpus start!" they squeaked. Then they all had a nap.' ] },
  // ---- Tully's curio hut
  curious1: { title: 'Curious Things of the Vale, Vol. 1', pages: [
    'Curious Thing #1: a rock shaped like a slightly different rock.|Curious Thing #2: a stick. (Very curious.)',
    'Curious Thing #3: KEEPSAKES! Little treasures hidden all over the Vale. Under grass, in reeds, behind cracked rocks.|Tully wants to see every one!' ] },
  curious42: { title: 'Curious Things of the Vale, Vol. 42', pages: [
    'Curious Thing #998: Some say a great SHOVEL lies in a mine across the sea. Who knows what you could dig up with it?',
    'Curious Thing #999: Glowing ripples on deep water mean something is sitting on the bottom. You would have to DIVE to get it.' ] },

  // ---- secret books, found lying about the world
  bk_pirate: { title: "Pirate Pete's Treasure Log", secret: true, pages: [
    'Arr! This be the log of PIRATE PETE, terror of the Mistfall Lagoon!',
    'I buried me finest treasure on the sandy shore of the Lagoon, west of the island with the grotto, where the water be calm.|I marked it with a big X. Bring a SHOVEL, matey!',
    '(The X is on your map now... well, it is on the ground. Go and look!)' ] },
  bk_goldcray: { title: 'The Golden Crayfish', secret: true, pages: [
    'A secret only fishermen know: GOLDEN CRAYFISH live in the big river, and in the ponds of the marsh.',
    'Alien goo breaks your hearts so they cannot heal. But one golden crayfish fixes them ALL!|There is a spring of them in the Goo Lands, too, right by the bridge.' ] },
  bk_fenwick: { title: "Fenwick's Field Notes", secret: true, pages: [
    'Day 1: It is very hot in the Cinderscale Wastes. My hat melted.',
    'Day 2: I saw a PUGGLE on a tiny island in the middle of a lava lake! There is one wooden plank to it. Do not wobble.',
    'Day 3: Way up at the north edge, cracked rocks hide shiny things. A big BOOM would open them. I did not have a big boom.' ] },
  bk_forest: { title: 'Whispers of Rootdeep', secret: true, pages: [
    'The trees of Rootdeep whisper secrets, if you listen.',
    '"Two stones, two holes, one little puggle waiting." That is what they whispered.|They also whispered "dig by the old stump in the far south-west." Then they whispered "shhh."',
    '(An X marks the spot in the far south-west of the forest!)' ] },
  bk_mirri: { title: "Elder Mirri's Diary", secret: true, pages: [
    'Dear diary: Today I gave young Gus my old shield. He will be a great Guardian, I just know it.',
    'Secret: under the big river bridge east of the village, something glitters on the river bottom.|You would need to DIVE to reach it. The Kingdom\'s Diving Helmet could do it.',
    'I miss my castle in the Platypus Kingdom. Perhaps it is time I went home.' ] },
  bk_reef: { title: "Sailor Sal's Sea Guide", secret: true, pages: [
    'The GREAT OCEAN goes all the way around the Vale. Out there are coral reefs: pink coral, brain coral, and purple sea fans.',
    'Sailors always ask: is there treasure on the reefs?|No! There is nothing out there at all. Just fish and coral. But it is VERY pretty. Go for a swim!' ] },
  bk_sky: { title: 'Wind Riders', secret: true, pages: [
    'High on the Skyreach Bluffs, the wind tells stories to anyone who will stand still.',
    'The wind says: one lone mesa has an EYE in its face. Shoot it with an arrow, and a friend comes out.|The wind also says: an X marks a buried treasure at the very top of the bluffs, near the north-west corner.' ] },

  // ---- the Platypus Kingdom's secret books
  bk_mole: { title: "The Mole King's Map", secret: true, pages: [
    'This map belongs to THE MOLE KING. If found, do NOT return it. (He bites.)',
    'My finest treasure is buried in the far west of Molehill Meadows, near the sea.|X marks the spot. Dig there with a SHOVEL!' ] },
  bk_lake: { title: 'Secrets of Mirror Lake', secret: true, pages: [
    'Mirror Lake hides glittering things on its bottom. Dive down to find them!',
    'The Skyhook Spire stands on the island in the middle, behind a ring of rock.|You cannot swim over the rock. But there are arches in it, west and north, under the water...' ] },
  // ---- Castle Mirri's library
  kingdom: { title: 'A History of the Platypus Kingdom', pages: [
    'Long ago, the first platypuses built a castle on an island in the sea, and called it the Platypus Kingdom.',
    'They sent the bravest among them across the sea to watch over the Vale. These were the first RIVER GUARDIANS.|Gus\'s family has been Guardians ever since!' ] },
  mirri: { title: 'Mirri the Brave', pages: [
    'When Mirri was young, she sailed to the Vale in a tiny boat made of one big leaf.',
    'She loved the Vale so much she stayed for years and years, looking after everyone in Billabong Village.|But she always missed her castle. And her cushion.' ] },
  rules: { title: 'Royal Rules', pages: [
    'Rule 1: Be kind.|Rule 2: Be brave.|Rule 3: No running in the throne room.|Rule 4: Seriously. No running.',
    'Rule 5: Crayfish pie is served on Mondays, Tuesdays, Wednesdays, Thursdays, Fridays, Saturdays and Sundays.' ] },
  treasures: { title: 'The Five Treasures', pages: [
    'Five treasures lie in five dungeons across the Kingdom.',
    'THE SHOVEL, in the Mole Mines: dig up surprises.|THE SPRING BOOTS, in Hopscotch Heights: jump over holes and low walls.|THE DASH FLIPPERS, in the Rumble Ruins: smash rubble.',
    'THE DIVING HELMET, in the Drowned Halls: swim under the water.|THE GRAPPLE HOOK, in the Skyhook Spire: zip to gold-ringed posts.|Each dungeon needs the treasure before it to get in!' ] },
  knights: { title: 'How to Be a Royal Knight', pages: [
    'Step 1: Find all five Royal Gems.|Step 2: Bring them to Elder Mirri.|Step 3: Kneel. (Do not fall asleep while kneeling.)' ] },
};

// which books stand on which shelf
export const SHELVES = {
  gus: ['crayfish', 'swim', 'guardians', 'captainbill'],
  mama: ['hungrycray', 'goodnight', 'wildpuggles'],
  tully: ['curious1', 'curious42'],
  library: ['kingdom', 'mirri', 'rules'],
  royal: ['treasures', 'knights'],
};
export const SECRET_BOOKS = Object.keys(BOOKS).filter(id => BOOKS[id].secret);

const PAGE_W = 286, LINES = 12;
// a book's pages, each wrapped into lines (a long page spills onto the next)
function layout(book) {
  const pages = [];
  for (const page of book.pages) {
    const lines = [];
    page.split('|').forEach((para, i) => { if (i) lines.push(''); lines.push(...wrapText(para, PAGE_W)); });
    for (let i = 0; i < lines.length; i += LINES) pages.push(lines.slice(i, i + LINES));
  }
  return pages;
}

// Open a shelf (a list of book ids) or a single book.
export function openShelf(g, ids, name) {
  g.reading = { list: ids, name, sel: 0, id: null, page: 0, pages: null };
  g.mode = 'book';
  audio.sfx('blip');
}
export function openBook(g, id) {
  g.reading = { list: null, sel: 0, id, page: 0, pages: layout(BOOKS[id]) };
  g.mode = 'book';
  audio.sfx('house');
}

export function updateBook(g) {
  const R = g.reading;
  if (!R) { g.mode = 'play'; return; }
  const close = () => { g.reading = null; g.mode = 'play'; audio.sfx('blip'); };
  if (!R.id) {
    // choosing a book off the shelf
    if (input.pressed('up')) { R.sel = (R.sel + R.list.length - 1) % R.list.length; audio.sfx('blip'); }
    if (input.pressed('down')) { R.sel = (R.sel + 1) % R.list.length; audio.sfx('blip'); }
    if (input.pressed('pause')) { close(); return; }
    let pick = input.pressed('interact') || input.pressed('sword');
    for (const t of g.taps) {
      const i = Math.floor((t.y - 50) / 13);
      if (t.x > 60 && t.x < VIEW_W - 60 && i >= 0 && i < R.list.length) { if (i === R.sel) pick = true; else R.sel = i; }
    }
    if (pick) { R.id = R.list[R.sel]; R.page = 0; R.pages = layout(BOOKS[R.id]); audio.sfx('house'); }
    return;
  }
  const back = () => { if (R.list) { R.id = null; R.pages = null; audio.sfx('blip'); } else close(); };
  if (input.pressed('pause')) { back(); return; }
  let next = input.pressed('interact') || input.pressed('sword') || input.pressed('right');
  let prev = input.pressed('left');
  for (const t of g.taps) { if (t.x < VIEW_W / 3) prev = true; else next = true; }
  if (prev && R.page > 0) { R.page--; audio.sfx('blip'); }
  else if (next) {
    if (R.page < R.pages.length - 1) { R.page++; audio.sfx('blip'); }
    else back();
  }
}

export function drawBook(g, ctx, text) {
  const R = g.reading;
  if (!R) return;
  ctx.fillStyle = '#000000aa';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  if (!R.id) {
    // the shelf: a list of spines
    const h = 40 + R.list.length * 13;
    paper(ctx, 50, 24, VIEW_W - 100, h);
    text(ctx, R.name || 'BOOKSHELF', VIEW_W / 2, 32, { size: 9, align: 'center', color: '#6a3a1a', shadow: false });
    R.list.forEach((id, i) => {
      const on = i === R.sel, y = 50 + i * 13;
      if (on) { ctx.fillStyle = '#c8a87088'; ctx.fillRect(58, y - 2, VIEW_W - 116, 12); }
      text(ctx, (on ? '> ' : '  ') + BOOKS[id].title, 62, y, { size: 8, color: BOOKS[id].secret ? '#8a2a6a' : '#3a2410', shadow: false });
    });
    text(ctx, 'W/S choose   E read   Esc close', VIEW_W / 2, 24 + h - 12, { size: 7, align: 'center', color: '#7a5a3a', shadow: false });
    return;
  }
  const book = BOOKS[R.id];
  paper(ctx, 40, 10, VIEW_W - 80, VIEW_H - 20);
  let y = 20;
  if (R.page === 0) {
    text(ctx, book.title, VIEW_W / 2, y, { size: 9, align: 'center', color: book.secret ? '#8a2a6a' : '#6a3a1a', shadow: false });
    y += 18;
  }
  for (const line of R.pages[R.page]) { text(ctx, line, 54, y, { size: 8, color: '#2a1a0a', shadow: false }); y += 13; }
  text(ctx, `${R.page + 1} / ${R.pages.length}`, VIEW_W / 2, VIEW_H - 24, { size: 7, align: 'center', color: '#7a5a3a', shadow: false });
  text(ctx, R.page < R.pages.length - 1 ? 'E: next page' : 'E: close', VIEW_W - 50, VIEW_H - 24, { size: 7, align: 'right', color: '#7a5a3a', shadow: false });
}
function paper(ctx, x, y, w, h) {
  ctx.fillStyle = '#5a3a1a'; ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
  ctx.fillStyle = '#f2e2b8'; ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#e4d0a0'; ctx.fillRect(x, y + h - 4, w, 4);
}

// A secret book lying out in the world, glowing so it can be spotted. Walk up and press E.
export class BookProp extends Entity {
  constructor(def) {
    super(def.tx * TILE + 3, def.ty * TILE + 4, 10, 9);
    this.def = def;
  }
  interact(g) {
    const st = g.state;
    st.books = st.books || {};
    const first = !st.books[this.def.id];
    st.books[this.def.id] = true;
    this.dead = true;
    audio.sfx('keepsake');
    g.burst(this.cx, this.cy - 4, '#ffd8f0', 12);
    if (first) g.toast('A SECRET BOOK! It goes on your shelf at home.');
    g.save();
    openBook(g, this.def.id);
  }
  draw(g, ctx) {
    const bob = Math.sin(g.time * 2.5 + this.id) * 1.5;
    ctx.save();
    ctx.globalAlpha = 0.25 + 0.15 * Math.sin(g.time * 4);
    ctx.fillStyle = '#ffd8f0';
    ctx.beginPath(); ctx.arc(this.cx, this.cy - 3 + bob, 8, 0, 7); ctx.fill();
    ctx.restore();
    drawSprite(ctx, 'secretbook', this.cx, this.bottom + bob);
  }
}

// The X over buried treasure: only there once the book that tells of it has been read.
export class XMark extends Entity {
  constructor(def) {
    super(def.tx * TILE, def.ty * TILE, 16, 16);
    this.def = def;
  }
  draw(g, ctx) {
    const st = g.state;
    if (!(st.books && st.books[this.def.book]) || g.area.get(this.def.tx, this.def.ty) === T.DUG) return;
    ctx.fillStyle = '#c8202a';
    for (let i = 0; i < 10; i++) {
      ctx.fillRect(Math.round(this.x + 3 + i), Math.round(this.y + 3 + i), 2, 2);
      ctx.fillRect(Math.round(this.x + 12 - i), Math.round(this.y + 3 + i), 2, 2);
    }
  }
}
