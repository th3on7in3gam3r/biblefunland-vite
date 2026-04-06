/**
 * adventureHeroes.js — Bible Adventure Builder hero data
 *
 * To add a new hero: copy an existing entry, change the fields.
 * To add seasonal heroes: add a `seasonal: 'easter'` field and filter by season.
 *
 * Fields:
 *   id          unique slug
 *   name        display name
 *   emoji       large icon
 *   color       accent color
 *   bg          card background gradient
 *   era         Old/New Testament label
 *   tag         short descriptor
 *   verse       key Bible verse
 *   setting     story world description
 *   challenges  array of challenge options for step 2
 *   helpers     array of helper options for step 3
 *   verses      array of courage verse options for step 4
 */

export const HEROES = [
  {
    id: 'david',
    name: 'David',
    emoji: '🏹',
    color: '#3B82F6',
    bg: 'linear-gradient(135deg,#EFF6FF,#DBEAFE)',
    era: 'Old Testament',
    tag: 'Shepherd King',
    verse: '1 Samuel 17:45',
    setting: 'the hills of ancient Israel, from shepherd fields to royal palaces',
    challenges: [
      'Facing a giant who seems impossible to defeat',
      'Being laughed at by people who don\'t believe in you',
      'Feeling afraid but knowing God is calling you',
      'Protecting others when you feel too small',
    ],
    helpers: ['A loyal friend named Jonathan', 'A wise prophet named Samuel', 'God\'s own Spirit', 'A small but brave army'],
    verses: ['1 Samuel 17:45 — "I come in the name of the Lord"', 'Psalm 23:4 — "I will fear no evil"', 'Psalm 46:1 — "God is our refuge and strength"', 'Isaiah 41:10 — "Do not fear, for I am with you"'],
  },
  {
    id: 'esther',
    name: 'Esther',
    emoji: '👑',
    color: '#EC4899',
    bg: 'linear-gradient(135deg,#FDF2F8,#FCE7F3)',
    era: 'Old Testament',
    tag: 'Brave Queen',
    verse: 'Esther 4:14',
    setting: 'the grand palace of Persia, where one brave voice could save a nation',
    challenges: [
      'Speaking up when it could cost everything',
      'Keeping faith secret in a dangerous place',
      'Standing up for people who can\'t protect themselves',
      'Trusting God\'s plan even when it\'s scary',
    ],
    helpers: ['Her wise cousin Mordecai', 'Faithful servants who pray with her', 'God\'s perfect timing', 'A community of people fasting together'],
    verses: ['Esther 4:14 — "For such a time as this"', 'Joshua 1:9 — "Be strong and courageous"', 'Proverbs 31:25 — "She is clothed with strength"', 'Psalm 56:3 — "When I am afraid, I put my trust in you"'],
  },
  {
    id: 'paul',
    name: 'Paul',
    emoji: '✉️',
    color: '#8B5CF6',
    bg: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)',
    era: 'New Testament',
    tag: 'Missionary',
    verse: 'Philippians 4:13',
    setting: 'the ancient roads of the Roman Empire, spreading the Good News to every city',
    challenges: [
      'Sharing your faith with people who are very different from you',
      'Staying joyful even when things go wrong',
      'Being misunderstood for doing the right thing',
      'Starting over after making big mistakes',
    ],
    helpers: ['A faithful friend named Barnabas', 'A young helper named Timothy', 'The Holy Spirit guiding every step', 'A community of new believers'],
    verses: ['Philippians 4:13 — "I can do all things through Christ"', 'Romans 8:28 — "All things work together for good"', '2 Corinthians 12:9 — "My grace is sufficient"', 'Romans 1:16 — "I am not ashamed of the gospel"'],
  },
  {
    id: 'noah',
    name: 'Noah',
    emoji: '🌊',
    color: '#14B8A6',
    bg: 'linear-gradient(135deg,#F0FDFA,#CCFBF1)',
    era: 'Old Testament',
    tag: 'Faithful Builder',
    verse: 'Genesis 6:22',
    setting: 'a world that had forgotten God, where one family chose to trust and obey',
    challenges: [
      'Doing what God says even when everyone laughs at you',
      'Trusting God\'s plan when you can\'t see the whole picture',
      'Caring for many creatures who depend on you',
      'Starting fresh after a great storm',
    ],
    helpers: ['His faithful family', 'God\'s clear instructions', 'Animals who come two by two', 'A rainbow promise from God'],
    verses: ['Genesis 6:22 — "Noah did everything God commanded"', 'Hebrews 11:7 — "By faith Noah built the ark"', 'Proverbs 3:5 — "Trust in the Lord with all your heart"', 'Isaiah 43:2 — "When you pass through the waters, I will be with you"'],
  },
  {
    id: 'moses',
    name: 'Moses',
    emoji: '🔥',
    color: '#F97316',
    bg: 'linear-gradient(135deg,#FFF7ED,#FFEDD5)',
    era: 'Old Testament',
    tag: 'Deliverer',
    verse: 'Exodus 14:14',
    setting: 'the deserts of Egypt and the wilderness, where God led a whole nation to freedom',
    challenges: [
      'Speaking up for people who are being treated unfairly',
      'Feeling like you\'re not good enough for the job',
      'Leading others when the path ahead is unknown',
      'Trusting God when the impossible stands in your way',
    ],
    helpers: ['His brother Aaron who speaks for him', 'His sister Miriam who leads in worship', 'God\'s mighty power through signs and wonders', 'A pillar of cloud and fire'],
    verses: ['Exodus 14:14 — "The Lord will fight for you"', 'Deuteronomy 31:6 — "Be strong and courageous"', 'Exodus 3:12 — "I will be with you"', 'Isaiah 40:31 — "Those who hope in the Lord will renew their strength"'],
  },
  {
    id: 'ruth',
    name: 'Ruth',
    emoji: '🌾',
    color: '#F59E0B',
    bg: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)',
    era: 'Old Testament',
    tag: 'Loyal Friend',
    verse: 'Ruth 1:16',
    setting: 'the golden fields of Bethlehem, where loyalty and kindness changed everything',
    challenges: [
      'Staying loyal to someone even when it costs you',
      'Starting over in a new place where you don\'t know anyone',
      'Working hard with no guarantee of reward',
      'Trusting that kindness will be noticed',
    ],
    helpers: ['Her mother-in-law Naomi who guides her', 'A kind landowner named Boaz', 'Workers in the field who show her grace', 'God\'s quiet but perfect provision'],
    verses: ['Ruth 1:16 — "Where you go I will go"', 'Proverbs 31:25 — "She is clothed with strength and dignity"', 'Micah 6:8 — "Act justly, love mercy, walk humbly"', 'Psalm 37:4 — "Delight yourself in the Lord"'],
  },
  {
    id: 'daniel',
    name: 'Daniel',
    emoji: '🦁',
    color: '#10B981',
    bg: 'linear-gradient(135deg,#ECFDF5,#D1FAE5)',
    era: 'Old Testament',
    tag: 'Faithful Dreamer',
    verse: 'Daniel 6:10',
    setting: 'the royal courts of Babylon, where faith was tested by kings and lions alike',
    challenges: [
      'Staying true to God when powerful people pressure you to stop',
      'Praying even when it\'s against the rules',
      'Trusting God in a very dark and scary place',
      'Using your gifts to serve even your enemies',
    ],
    helpers: ['Three faithful friends — Shadrach, Meshach, and Abednego', 'An angel who shuts the lions\' mouths', 'God\'s wisdom given in dreams', 'A king who eventually sees God\'s power'],
    verses: ['Daniel 6:10 — "He prayed three times a day"', 'Daniel 3:17 — "Our God is able to deliver us"', 'Proverbs 3:5 — "Trust in the Lord with all your heart"', 'Isaiah 41:10 — "Do not fear, for I am with you"'],
  },
  {
    id: 'mary',
    name: 'Mary',
    emoji: '🕊️',
    color: '#6366F1',
    bg: 'linear-gradient(135deg,#EEF2FF,#E0E7FF)',
    era: 'New Testament',
    tag: 'Mother of Jesus',
    verse: 'Luke 1:38',
    setting: 'the humble village of Nazareth, where the greatest story in history began with a yes',
    challenges: [
      'Saying yes to God even when you don\'t understand everything',
      'Trusting God\'s plan when it seems impossible',
      'Carrying something precious and protecting it',
      'Finding courage when the world doesn\'t understand you',
    ],
    helpers: ['The angel Gabriel who brings God\'s message', 'Her cousin Elizabeth who believes her', 'Joseph who stands by her side', 'The Holy Spirit who guides her'],
    verses: ['Luke 1:38 — "I am the Lord\'s servant"', 'Luke 1:37 — "Nothing is impossible with God"', 'Psalm 46:5 — "God is within her, she will not fall"', 'Isaiah 7:14 — "The virgin will conceive and give birth"'],
  },
];

// Question templates — reusable across all heroes
export const QUESTION_TEMPLATES = [
  {
    id: 'challenge',
    step: 2,
    question: (hero) => `What challenge is ${hero.name} facing in your adventure?`,
    kidsQuestion: (hero) => `What big problem does ${hero.name} need to solve? 🤔`,
    type: 'choice', // uses hero.challenges
  },
  {
    id: 'helper',
    step: 3,
    question: (hero) => `Who helps ${hero.name} on this journey?`,
    kidsQuestion: (hero) => `Who is ${hero.name}'s helper? 🤝`,
    type: 'choice', // uses hero.helpers
  },
  {
    id: 'verse',
    step: 4,
    question: () => 'Which Bible verse gives courage in this adventure?',
    kidsQuestion: () => 'Which Bible verse makes you feel brave? 💪',
    type: 'choice', // uses hero.verses
  },
  {
    id: 'decision',
    step: 5,
    question: (hero) => `At the hardest moment, what would YOU do if you were ${hero.name}?`,
    kidsQuestion: (hero) => `If YOU were ${hero.name}, what would you do? ⭐`,
    type: 'text',
    placeholder: 'I would...',
    kidPlaceholder: 'I would be brave and...',
  },
];
