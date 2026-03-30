import { useRef } from 'react';

const SHEETS = [
  {
    id: 'wordsearch',
    title: 'Bible Word Search',
    desc: 'Find 15 Bible names hidden in the grid',
    grade: 'Ages 6-10',
    emoji: '🔍',
    color: '#3B82F6',
    bg: '#EFF6FF',
    pro: false,
  },
  {
    id: 'crossword',
    title: 'Bible Crossword',
    desc: 'Crossword puzzle with scripture clues',
    grade: 'Ages 8-12',
    emoji: '✏️',
    color: '#8B5CF6',
    bg: '#F5F3FF',
    pro: false,
  },
  {
    id: 'coloring',
    title: "Noah's Ark Coloring Page",
    desc: "Detailed coloring scene of Noah's Ark",
    grade: 'Ages 3-8',
    emoji: '🎨',
    color: '#EC4899',
    bg: '#FDF2F8',
    pro: false,
  },
  {
    id: 'memorygame',
    title: 'Bible Memory Match Cards',
    desc: 'Print and cut out matching game cards',
    grade: 'Ages 4-8',
    emoji: '🃏',
    color: '#10B981',
    bg: '#ECFDF5',
    pro: false,
  },
  {
    id: 'journaling',
    title: 'Scripture Journaling Page',
    desc: 'Lined pages with verse prompts for reflection',
    grade: 'All ages',
    emoji: '📔',
    color: '#F97316',
    bg: '#FFF7ED',
    pro: true,
  },
  {
    id: 'dotdot',
    title: 'Connect the Dots: Star of Bethlehem',
    desc: 'Dot-to-dot reveals the Star of Bethlehem',
    grade: 'Ages 4-7',
    emoji: '🌟',
    color: '#F59E0B',
    bg: '#FFFBEB',
    pro: false,
  },
  {
    id: 'maze',
    title: 'Help Moses Through the Wilderness',
    desc: 'Maze game following Moses to the Promised Land',
    grade: 'Ages 5-9',
    emoji: '🏜️',
    color: '#14B8A6',
    bg: '#F0FDFA',
    pro: false,
  },
  {
    id: 'versecard',
    title: 'Memory Verse Cards — Top 10',
    desc: '10 printable verse cards to cut out and carry',
    grade: 'All ages',
    emoji: '📜',
    color: '#6366F1',
    bg: '#EEF2FF',
    pro: true,
  },
];

// Generate printable HTML for each sheet type
function generateSheet(id) {
  const sheets = {
    wordsearch: `
<!DOCTYPE html><html><head><title>Bible Word Search</title>
<style>body{font-family:'Georgia',serif;margin:28px;background:#fff;color:#111;}h1{font-size:22px;font-weight:bold;margin-bottom:4px;color:#1E3A5F;}h2{font-size:14px;color:#666;font-weight:normal;margin-bottom:18px;}
.grid{display:inline-grid;grid-template-columns:repeat(15,28px);gap:1px;background:#ddd;border:2px solid #1E3A5F;margin-bottom:20px;}.cell{width:28px;height:28px;background:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:13px;}
.words{column-count:3;font-size:13px;line-height:2;}.footer{margin-top:24px;font-size:11px;color:#888;border-top:1px solid #ddd;padding-top:10px;}
</style></head><body>
<h1>🔍 Bible Word Search</h1><h2>Find the Bible names hidden in the grid · BibleFunLand.com</h2>
<div class="grid">${generateWordSearchGrid()}</div>
<div class="words"><strong>Find these words:</strong><br>MOSES &nbsp; DAVID &nbsp; ESTHER<br>RUTH &nbsp; PAUL &nbsp; NOAH<br>PETER &nbsp; MARY &nbsp; JAMES<br>JOHN &nbsp; LUKE &nbsp; MARK<br>DANIEL &nbsp; ELIJAH &nbsp; ISAIAH</div>
<div class="footer">BibleFunLand.com · Free printable Bible activities for children · Ephesians 4:32</div>
</body></html>`,
    coloring: `
<!DOCTYPE html><html><head><title>Noah's Ark Coloring Page</title>
<style>body{font-family:'Georgia',serif;margin:28px;background:#fff;}h1{font-size:20px;color:#064E3B;margin-bottom:4px;}h2{font-size:13px;color:#666;font-weight:normal;margin-bottom:16px;}
svg{width:100%;max-width:680px;height:auto;display:block;margin:0 auto;}.footer{margin-top:18px;font-size:11px;color:#888;border-top:1px solid #ddd;padding-top:8px;text-align:center;}
</style></head><body>
<h1>🎨 Noah's Ark Coloring Page</h1><h2>Color the ark and animals · Genesis 6–8 · BibleFunLand.com</h2>
<svg viewBox="0 0 700 500" xmlns="http://www.w3.org/2000/svg">
  <!-- Sky and water -->
  <rect width="700" height="500" fill="none" stroke="#333" stroke-width="2"/>
  <!-- Water waves -->
  <path d="M0 380 Q50 360 100 380 Q150 400 200 380 Q250 360 300 380 Q350 400 400 380 Q450 360 500 380 Q550 400 600 380 Q650 360 700 380 L700 500 L0 500 Z" fill="none" stroke="#333" stroke-width="2.5"/>
  <path d="M0 410 Q60 390 120 410 Q180 430 240 410 Q300 390 360 410 Q420 430 480 410 Q540 390 600 410 Q660 430 700 410" fill="none" stroke="#333" stroke-width="2"/>
  <!-- Ark hull -->
  <path d="M100 350 Q120 380 150 385 L550 385 Q580 380 600 350 Z" fill="none" stroke="#333" stroke-width="3"/>
  <!-- Ark deck -->
  <rect x="130" y="250" width="440" height="100" rx="8" fill="none" stroke="#333" stroke-width="3"/>
  <!-- Ark roof/house -->
  <path d="M150 250 L350 180 L550 250 Z" fill="none" stroke="#333" stroke-width="3"/>
  <!-- Windows -->
  <rect x="200" y="270" width="40" height="40" rx="4" fill="none" stroke="#333" stroke-width="2"/>
  <rect x="270" y="270" width="40" height="40" rx="4" fill="none" stroke="#333" stroke-width="2"/>
  <rect x="340" y="270" width="40" height="40" rx="4" fill="none" stroke="#333" stroke-width="2"/>
  <rect x="410" y="270" width="40" height="40" rx="4" fill="none" stroke="#333" stroke-width="2"/>
  <rect x="480" y="270" width="40" height="40" rx="4" fill="none" stroke="#333" stroke-width="2"/>
  <!-- Door -->
  <path d="M320 350 L320 295 Q350 280 380 295 L380 350 Z" fill="none" stroke="#333" stroke-width="2"/>
  <!-- Animals: Elephant -->
  <ellipse cx="180" cy="145" rx="35" ry="28" fill="none" stroke="#333" stroke-width="2"/>
  <ellipse cx="165" cy="125" rx="18" ry="22" fill="none" stroke="#333" stroke-width="2"/>
  <path d="M155 145 Q140 160 145 175" fill="none" stroke="#333" stroke-width="2"/>
  <line x1="158" y1="170" x2="158" y2="190" stroke="#333" stroke-width="2"/>
  <line x1="175" y1="172" x2="175" y2="192" stroke="#333" stroke-width="2"/>
  <!-- Giraffe -->
  <ellipse cx="480" cy="160" rx="22" ry="16" fill="none" stroke="#333" stroke-width="2"/>
  <rect x="472" y="80" width="14" height="80" rx="7" fill="none" stroke="#333" stroke-width="2"/>
  <ellipse cx="479" cy="72" rx="16" ry="14" fill="none" stroke="#333" stroke-width="2"/>
  <line x1="464" y1="176" x2="460" y2="205" stroke="#333" stroke-width="2"/>
  <line x1="496" y1="176" x2="500" y2="205" stroke="#333" stroke-width="2"/>
  <!-- Rainbow -->
  <path d="M50 100 Q350 -30 650 100" fill="none" stroke="#333" stroke-width="3" stroke-dasharray="0"/>
  <path d="M70 115 Q350 -10 630 115" fill="none" stroke="#333" stroke-width="2.5"/>
  <path d="M90 130 Q350 10 610 130" fill="none" stroke="#333" stroke-width="2"/>
  <!-- Clouds -->
  <ellipse cx="150" cy="60" rx="45" ry="22" fill="none" stroke="#333" stroke-width="2"/>
  <ellipse cx="130" cy="55" rx="28" ry="18" fill="none" stroke="#333" stroke-width="2"/>
  <ellipse cx="170" cy="52" rx="30" ry="19" fill="none" stroke="#333" stroke-width="2"/>
  <ellipse cx="560" cy="55" rx="45" ry="22" fill="none" stroke="#333" stroke-width="2"/>
  <ellipse cx="540" cy="50" rx="28" ry="18" fill="none" stroke="#333" stroke-width="2"/>
  <ellipse cx="580" cy="48" rx="30" ry="19" fill="none" stroke="#333" stroke-width="2"/>
  <!-- Dove -->
  <ellipse cx="350" cy="150" rx="12" ry="8" fill="none" stroke="#333" stroke-width="2"/>
  <path d="M338 150 Q330 140 322 148" fill="none" stroke="#333" stroke-width="2"/>
  <path d="M362 150 Q370 140 378 148" fill="none" stroke="#333" stroke-width="2"/>
  <circle cx="343" cy="145" r="5" fill="none" stroke="#333" stroke-width="1.5"/>
  <path d="M350 158 Q350 168 348 172" fill="none" stroke="#333" stroke-width="1.5"/>
  <!-- Bible verse -->
  <text x="350" y="480" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#333">"And God remembered Noah..." — Genesis 8:1</text>
</svg>
<div class="footer">BibleFunLand.com · Free printable for Sunday School and home use</div>
</body></html>`,
    crossword: `
<!DOCTYPE html><html><head><title>Bible Crossword</title>
<style>body{font-family:'Georgia',serif;margin:28px;color:#111;}h1{font-size:22px;color:#312E81;margin-bottom:4px;}h2{font-size:13px;color:#666;font-weight:normal;margin-bottom:18px;}
.grid{display:inline-grid;grid-template-columns:repeat(12,36px);gap:2px;margin-bottom:20px;}.cell{width:36px;height:36px;border:2px solid #312E81;display:flex;align-items:center;justify-content:center;font-weight:bold;position:relative;font-size:13px;}.blocked{background:#312E81;border-color:#312E81;}.num{position:absolute;top:1px;left:2px;font-size:9px;color:#312E81;font-weight:bold;}
.clues{display:grid;grid-template-columns:1fr 1fr;gap:0 32px;font-size:13px;}.clues h3{font-size:14px;color:#312E81;margin-bottom:8px;}.clue{margin-bottom:5px;line-height:1.4;}
.footer{margin-top:20px;font-size:11px;color:#888;border-top:1px solid #ddd;padding-top:8px;}</style></head><body>
<h1>✏️ Bible Crossword Puzzle</h1><h2>Use scripture clues to solve! · BibleFunLand.com</h2>
${generateCrossword()}
<div class="footer">BibleFunLand.com · "Your word is a lamp to my feet." — Psalm 119:105</div>
</body></html>`,
    maze: `
<!DOCTYPE html><html><head><title>Help Moses Through the Wilderness</title>
<style>body{font-family:'Georgia',serif;margin:28px;color:#111;text-align:center;}h1{font-size:22px;color:#7C2D12;margin-bottom:4px;}h2{font-size:13px;color:#666;font-weight:normal;margin-bottom:16px;}svg{max-width:600px;width:100%;}.footer{margin-top:16px;font-size:11px;color:#888;border-top:1px solid #ddd;padding-top:8px;}</style></head><body>
<h1>🏜️ Help Moses Through the Wilderness</h1><h2>Lead Moses to the Promised Land! · Numbers 14 · BibleFunLand.com</h2>
<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
  <rect width="500" height="500" fill="#FEF3C7" stroke="#7C2D12" stroke-width="3"/>
  <!-- Maze walls -->
  ${generateMazeWalls()}
  <!-- Start label -->
  <text x="30" y="490" font-family="Georgia" font-size="12" fill="#7C2D12" font-weight="bold">START (Moses)</text>
  <!-- End label -->
  <text x="380" y="20" font-family="Georgia" font-size="12" fill="#064E3B" font-weight="bold">PROMISED LAND</text>
  <text x="20" y="35" font-family="Georgia" font-size="10" fill="#7C2D12">"Be strong! The Lord goes before you." — Deut 31:8</text>
</svg>
<div class="footer">BibleFunLand.com · Free printable for Sunday School</div>
</body></html>`,
    dotdot: `
<!DOCTYPE html><html><head><title>Star of Bethlehem Dot to Dot</title>
<style>body{font-family:'Georgia',serif;margin:28px;color:#111;text-align:center;}h1{font-size:22px;color:#0C4A6E;margin-bottom:4px;}h2{font-size:13px;color:#666;font-weight:normal;margin-bottom:16px;}svg{max-width:620px;width:100%;}.footer{margin-top:16px;font-size:11px;color:#888;border-top:1px solid #ddd;padding-top:8px;}</style></head><body>
<h1>🌟 Star of Bethlehem — Connect the Dots</h1><h2>Connect dots 1 to 40 to reveal the Star! · Matthew 2:2 · BibleFunLand.com</h2>
<svg viewBox="0 0 600 580" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="580" fill="white" stroke="#0C4A6E" stroke-width="2"/>
  ${generateDotToDot()}
</svg>
<div class="footer">BibleFunLand.com · "Where is the one who has been born king of the Jews? We saw his star." — Matthew 2:2</div>
</body></html>`,
    memorygame: `
<!DOCTYPE html><html><head><title>Bible Memory Match Cards</title>
<style>body{font-family:'Georgia',serif;margin:20px;color:#111;}h1{font-size:20px;color:#064E3B;margin-bottom:4px;}h2{font-size:13px;color:#666;font-weight:normal;margin-bottom:16px;}
.grid{display:grid;grid-template-columns:repeat(4,130px);gap:10px;}.card{width:130px;height:90px;border:3px solid #064E3B;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:6px;font-size:12px;}.emoji{font-size:26px;margin-bottom:4px;}.label{font-weight:bold;font-size:11px;color:#064E3B;}.sub{font-size:10px;color:#666;}
.instructions{background:#f0fdf4;border:1px solid #064E3B;border-radius:8px;padding:12px;margin-bottom:16px;font-size:12px;line-height:1.6;}
.footer{margin-top:16px;font-size:11px;color:#888;border-top:1px solid #ddd;padding-top:8px;}
</style></head><body>
<h1>🃏 Bible Memory Match Cards</h1><h2>Print, cut out, and match the Bible characters to their stories! · BibleFunLand.com</h2>
<div class="instructions"><strong>Instructions:</strong> Print this page, cut out each card, and flip them face-down. Take turns flipping 2 cards at a time — match the character to their story! First player to collect the most pairs wins!</div>
<div class="grid">
  ${[
    ['👑', 'David', 'Killed Goliath'],
    ['🏹', 'Goliath', '9 feet tall'],
    ['🚢', 'Noah', 'Built the Ark'],
    ['🌈', 'Rainbow', "God's covenant"],
    ['🐟', 'Jonah', 'In the fish 3 days'],
    ['🌊', 'Red Sea', 'God parted it'],
    ['👸', 'Esther', 'Saved her people'],
    ['🦁', 'Daniel', "Lions' den"],
    ['🔥', 'Moses', 'Burning bush'],
    ['📜', 'Ten Commandments', 'Given on Sinai'],
    ['🌸', 'Mary', 'Mother of Jesus'],
    ['✉️', 'Paul', 'Wrote 13 letters'],
  ]
    .map(
      ([e, n, s]) =>
        `<div class="card"><div class="emoji">${e}</div><div class="label">${n}</div><div class="sub">${s}</div></div>`
    )
    .join('')}
</div>
<div class="footer">BibleFunLand.com · Free printable Bible games for Sunday School and home</div>
</body></html>`,
  };

  function generateWordSearchGrid() {
    const words = ['MOSES', 'DAVID', 'ESTHER', 'RUTH', 'PAUL', 'NOAH', 'PETER', 'MARY', 'DANIEL'];
    const size = 15;
    const grid = Array(size)
      .fill(null)
      .map(() => Array(size).fill(''));
    // Place words
    words.forEach((word) => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        attempts++;
        const dir = Math.floor(Math.random() * 3); // 0=H, 1=V, 2=D
        const r = Math.floor(Math.random() * size);
        const c = Math.floor(Math.random() * size);
        if (dir === 0 && c + word.length <= size) {
          if (word.split('').every((_, i) => !grid[r][c + i] || grid[r][c + i] === word[i])) {
            word.split('').forEach((ch, i) => (grid[r][c + i] = ch));
            placed = true;
          }
        } else if (dir === 1 && r + word.length <= size) {
          if (word.split('').every((_, i) => !grid[r + i][c] || grid[r + i][c] === word[i])) {
            word.split('').forEach((ch, i) => (grid[r + i][c] = ch));
            placed = true;
          }
        }
      }
    });
    const alpha = 'ABCDEFGHIJKLMNOPRSTUVWXYZ';
    grid.forEach((row) =>
      row.forEach((cell, j, arr) => {
        if (!cell) arr[j] = alpha[Math.floor(Math.random() * alpha.length)];
      })
    );
    return grid
      .map((row) => row.map((cell) => `<div class="cell">${cell}</div>`).join(''))
      .join('');
  }

  function generateCrossword() {
    return `<div class="grid">
      ${Array(12)
        .fill(null)
        .map((_, r) =>
          Array(12)
            .fill(null)
            .map((_, c) => {
              const blocked = [
                [0, 2],
                [0, 3],
                [0, 7],
                [0, 8],
                [1, 0],
                [1, 5],
                [1, 6],
                [1, 11],
                [2, 4],
                [3, 9],
                [4, 1],
                [4, 2],
                [5, 7],
                [5, 8],
                [6, 3],
                [6, 4],
                [7, 0],
                [7, 1],
                [8, 6],
                [8, 9],
                [9, 2],
                [9, 10],
                [10, 5],
                [10, 6],
                [11, 3],
                [11, 4],
                [11, 8],
                [11, 9],
              ].some(([br, bc]) => br === r && bc === c);
              const nums = {
                [`${1},${4}`]: 1,
                [`${0},${0}`]: 2,
                [`${2},${6}`]: 3,
                [`${4},${3}`]: 4,
                [`${3},${1}`]: 5,
              };
              const num = nums[`${r},${c}`];
              return `<div class="cell${blocked ? ' blocked' : ''}">${num ? `<span class="num">${num}</span>` : ''}</div>`;
            })
            .join('')
        )
        .join('')}
    </div>
    <div class="clues">
      <div><h3>ACROSS</h3>
        <div class="clue"><strong>1.</strong> Moses parted this body of water (3,3)</div>
        <div class="clue"><strong>2.</strong> David killed this giant (7)</div>
        <div class="clue"><strong>3.</strong> Noah built this to survive the flood (3)</div>
        <div class="clue"><strong>4.</strong> God gave Moses these on Sinai (3,10)</div>
        <div class="clue"><strong>5.</strong> _______ 29:11 — "Plans to prosper you" (8)</div>
      </div>
      <div><h3>DOWN</h3>
        <div class="clue"><strong>1.</strong> Jesus turned water into this (4)</div>
        <div class="clue"><strong>2.</strong> Jonah was swallowed by this (5)</div>
        <div class="clue"><strong>3.</strong> The first book of the Bible (7)</div>
        <div class="clue"><strong>4.</strong> "The Lord is my ______" (Psalm 23) (8)</div>
        <div class="clue"><strong>5.</strong> Daniel was thrown in this (5,4)</div>
      </div>
    </div>`;
  }

  function generateMazeWalls() {
    const walls = [];
    const wallData = [
      [20, 20, 460, 20],
      [20, 20, 20, 460],
      [460, 20, 460, 460],
      [20, 460, 460, 460],
      [20, 60, 160, 60],
      [200, 60, 300, 60],
      [340, 60, 460, 60],
      [20, 100, 80, 100],
      [120, 100, 220, 100],
      [260, 100, 360, 100],
      [400, 100, 460, 100],
      [20, 140, 140, 140],
      [180, 140, 280, 140],
      [320, 140, 460, 140],
      [20, 180, 100, 180],
      [140, 180, 240, 180],
      [280, 180, 380, 180],
      [420, 180, 460, 180],
      [60, 220, 160, 220],
      [200, 220, 300, 220],
      [340, 220, 440, 220],
      [20, 260, 120, 260],
      [160, 260, 260, 260],
      [300, 260, 400, 260],
      [440, 260, 460, 260],
      [20, 300, 80, 300],
      [120, 300, 220, 300],
      [260, 300, 360, 300],
      [400, 300, 460, 300],
      [20, 340, 140, 340],
      [180, 340, 280, 340],
      [320, 340, 420, 340],
      [20, 380, 100, 380],
      [140, 380, 240, 380],
      [280, 380, 380, 380],
      [420, 380, 460, 380],
      [60, 420, 160, 420],
      [200, 420, 300, 420],
      [340, 420, 460, 420],
    ];
    return wallData
      .map(
        ([x1, y1, x2, y2]) =>
          `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#7C2D12" stroke-width="3" stroke-linecap="square"/>`
      )
      .join('');
  }

  function generateDotToDot() {
    // Star of Bethlehem shape with 40 dots
    const pts = [];
    const cx = 300,
      cy = 290,
      r1 = 200,
      r2 = 80;
    for (let i = 0; i < 10; i++) {
      const angle = ((i * 36 - 90) * Math.PI) / 180;
      const r = i % 2 === 0 ? r1 : r2;
      pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
    }
    // Add more detail points
    const extra = [
      [cx, cy - 260],
      [cx + 80, cy - 180],
      [cx + 240, cy - 80],
      [cx + 260, cy + 40],
      [cx + 160, cy + 180],
      [cx + 60, cy + 260],
      [cx - 60, cy + 260],
      [cx - 160, cy + 180],
      [cx - 260, cy + 40],
      [cx - 240, cy - 80],
      [cx - 80, cy - 180],
    ];
    const allPts = [...pts, ...extra].slice(0, 40);
    return allPts
      .map(
        (
          [x, y],
          i
        ) => `<circle cx="${Math.round(x)}" cy="${Math.round(y)}" r="5" fill="none" stroke="#0C4A6E" stroke-width="2"/>
      <text x="${Math.round(x) + 8}" y="${Math.round(y) + 4}" font-family="Georgia" font-size="11" fill="#0C4A6E" font-weight="bold">${i + 1}</text>`
      )
      .join('');
  }

  const html = sheets[id];
  if (!html) return;
  const win = window.open('', '_blank');
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 800);
}

export default function ActivitySheets() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)',
          padding: '56px 36px 40px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            fontSize: '.7rem',
            fontWeight: 700,
            background: 'rgba(249,115,22,.15)',
            color: '#FCD34D',
            padding: '4px 12px',
            borderRadius: 100,
            marginBottom: 12,
          }}
        >
          🖨️ Sunday School Ready
        </div>
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,5vw,3.5rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg,#FCD34D,#FB923C,#F472B6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}
        >
          Printable Bible Activity Sheets
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,.5)',
            fontSize: '.9rem',
            fontWeight: 500,
            maxWidth: 480,
            margin: '0 auto',
          }}
        >
          Click any sheet to open a print-ready version. Free for Sunday School, VBS, homeschool,
          and family use!
        </p>
      </div>
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '44px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18 }}>
          {SHEETS.map((s) => (
            <div
              key={s.id}
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                border: `1.5px solid ${s.color}33`,
                boxShadow: '0 2px 12px rgba(0,0,0,.06)',
                overflow: 'hidden',
                transition: 'all .28s',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 16px 48px ${s.color}25`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.06)';
              }}
            >
              {s.pro && (
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    fontSize: '.62rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 100,
                    background: 'linear-gradient(135deg,#F59E0B,#F97316)',
                    color: 'white',
                  }}
                >
                  PRO
                </div>
              )}
              <div
                style={{
                  height: 100,
                  background: s.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3.5rem',
                }}
              >
                {s.emoji}
              </div>
              <div style={{ padding: '16px 16px 18px' }}>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '.95rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    marginBottom: 4,
                  }}
                >
                  {s.title}
                </div>
                <div
                  style={{
                    fontSize: '.76rem',
                    color: 'var(--ink3)',
                    fontWeight: 500,
                    marginBottom: 4,
                  }}
                >
                  {s.desc}
                </div>
                <div
                  style={{ fontSize: '.68rem', fontWeight: 700, color: s.color, marginBottom: 14 }}
                >
                  👶 {s.grade}
                </div>
                {s.pro ? (
                  <button
                    className="btn btn-outline btn-sm"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      color: 'var(--orange)',
                      borderColor: 'var(--orange)',
                    }}
                  >
                    💎 Pro Feature
                  </button>
                ) : (
                  <button
                    className="btn btn-sm"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg,${s.color},${s.color}bb)`,
                      color: 'white',
                      border: 'none',
                    }}
                    onClick={() => generateSheet(s.id)}
                  >
                    🖨️ Print / Download
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            background: 'var(--green-bg)',
            border: '1.5px solid var(--green)',
            borderRadius: 16,
            padding: '18px 22px',
            marginTop: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <span style={{ fontSize: '1.8rem' }}>💡</span>
          <div>
            <div
              style={{
                fontFamily: "'Baloo 2',cursive",
                fontSize: '1rem',
                fontWeight: 800,
                color: 'var(--ink)',
                marginBottom: 3,
              }}
            >
              How to print
            </div>
            <div
              style={{ fontSize: '.82rem', color: 'var(--ink2)', fontWeight: 500, lineHeight: 1.6 }}
            >
              Click any sheet button → a new tab opens with the print-ready sheet → your browser
              print dialog will appear automatically. Best printed in black & white on standard
              paper.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
