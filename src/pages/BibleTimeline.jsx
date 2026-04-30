import { useState, useRef, useMemo, useEffect } from 'react';
import styles from './BibleTimeline.module.css';

const ERAS = [
  {
    id: 'creation',
    label: 'Creation & Patriarchs',
    color: '#F59E0B',
    start: -4000,
    end: -1800,
    emoji: '🌍',
  },
  { id: 'egypt', label: 'Egypt & Exodus', color: '#EF4444', start: -1800, end: -1400, emoji: '🔥' },
  {
    id: 'conquest',
    label: 'Conquest & Judges',
    color: '#10B981',
    start: -1400,
    end: -1050,
    emoji: '⚔️',
  },
  {
    id: 'kingdom',
    label: 'United Kingdom',
    color: '#8B5CF6',
    start: -1050,
    end: -930,
    emoji: '👑',
  },
  {
    id: 'divided',
    label: 'Divided Kingdom',
    color: '#3B82F6',
    start: -930,
    end: -586,
    emoji: '💔',
  },
  { id: 'exile', label: 'Exile', color: '#6366F1', start: -586, end: -538, emoji: '😢' },
  {
    id: 'return',
    label: 'Return & Rebuilding',
    color: '#14B8A6',
    start: -538,
    end: -400,
    emoji: '🏠',
  },
  {
    id: 'intertestamental',
    label: '400 Years of Silence',
    color: '#9CA3AF',
    start: -400,
    end: -6,
    emoji: '⏳',
  },
  { id: 'jesus', label: 'Life of Jesus', color: '#EC4899', start: -6, end: 30, emoji: '⭐' },
  { id: 'earlyChurch', label: 'Early Church', color: '#F97316', start: 30, end: 100, emoji: '🔥' },
];

const EVENTS = [
  {
    id: 'creation--4000',
    year: -4000,
    label: 'Creation',
    ref: 'Gen 1-2',
    era: 'creation',
    icon: '🌍',
    desc: 'In the beginning, God created the heavens and earth. Light, darkness, sea, land, plants, sun, moon, stars, animals, and finally man in His image — all in six days.',
  },
  {
    id: 'the-fall--3900',
    year: -3900,
    label: 'The Fall',
    ref: 'Gen 3',
    era: 'creation',
    icon: '🍎',
    desc: "Adam and Eve sin by eating the forbidden fruit. Death, shame, and separation from God enter the world — but God promises a Rescuer who will crush the serpent's head.",
  },
  {
    id: 'noahs-flood--2400',
    year: -2400,
    label: "Noah's Flood",
    ref: 'Gen 6-9',
    era: 'creation',
    icon: '🌊',
    desc: "The earth is filled with violence. God sends a worldwide flood and saves Noah, his family, and two of every creature. A rainbow marks God's promise never to destroy the earth by water again.",
  },
  {
    id: 'tower-of-babel--2300',
    year: -2300,
    label: 'Tower of Babel',
    ref: 'Gen 11',
    era: 'creation',
    icon: '🏗️',
    desc: 'Humanity unites in pride to build a tower reaching heaven. God scatters them by confusing their languages, creating the many nations of the world.',
  },
  {
    id: 'call-of-abraham--2091',
    year: -2091,
    label: 'Call of Abraham',
    ref: 'Gen 12',
    era: 'creation',
    icon: '⭐',
    desc: "God calls Abram from Ur of the Chaldeans: 'Leave your country... and I will bless you.' Through Abraham, all nations on earth will be blessed.",
  },
  {
    id: 'isaac-born--2066',
    year: -2066,
    label: 'Isaac Born',
    ref: 'Gen 21',
    era: 'creation',
    icon: '👶',
    desc: 'Sarah, 90 years old, conceives and bears Isaac — the miracle child of promise. Through Isaac would come the covenant line to the entire world.',
  },
  {
    id: 'jacob-esau--2006',
    year: -2006,
    label: 'Jacob & Esau',
    ref: 'Gen 25',
    era: 'creation',
    icon: '👥',
    desc: "Twin sons Isaac and Rebekah: Esau, a hunter, and Jacob, a quiet man. Jacob later wrestles with an angel and receives the name Israel — 'one who struggles with God'.",
  },
  {
    id: 'joseph-in-egypt--1898',
    year: -1898,
    label: 'Joseph in Egypt',
    ref: 'Gen 37-50',
    era: 'creation',
    icon: '👑',
    desc: "Joseph is sold into slavery by his brothers, rises to second in command of Egypt, and saves the ancient world from famine. 'What you meant for evil, God meant for good.'",
  },
  {
    id: 'jacobs-family-to-egypt--1876',
    year: -1876,
    label: "Jacob's Family to Egypt",
    ref: 'Gen 46-47',
    era: 'creation',
    icon: '🏘️',
    desc: 'Jacob and his entire family of 70 move to Egypt to be near Joseph during the famine. God promises to make them a great nation there.',
  },
  {
    id: 'moses-born--1526',
    year: -1526,
    label: 'Moses Born',
    ref: 'Exo 2',
    era: 'egypt',
    icon: '🌿',
    desc: "Pharaoh orders all Hebrew baby boys killed. Moses is placed in a basket on the Nile, rescued by Pharaoh's daughter, and raised in the royal palace.",
  },
  {
    id: 'the-exodus--1446',
    year: -1446,
    label: 'The Exodus',
    ref: 'Exo 12-14',
    era: 'egypt',
    icon: '🔥',
    desc: 'After 400 years of slavery and 10 devastating plagues, Pharaoh releases Israel. The Red Sea parts. Two million people walk through on dry ground as waters wall up on each side.',
  },
  {
    id: 'ten-commandments--1446',
    year: -1446,
    label: 'Ten Commandments',
    ref: 'Exo 20',
    era: 'egypt',
    icon: '📜',
    desc: 'At Mount Sinai, God speaks to Moses and gives the Law — 10 Commandments that become the moral foundation for Israel and, ultimately, the Western world.',
  },
  {
    id: 'manna-from-heaven--1446',
    year: -1446,
    label: 'Manna from Heaven',
    ref: 'Exo 16',
    era: 'egypt',
    icon: '🍞',
    desc: 'For 40 years in the wilderness, God provides manna — miraculous bread from heaven — for Israel to eat each morning, teaching them to depend on God daily.',
  },
  {
    id: 'joshua-leads-israel--1406',
    year: -1406,
    label: 'Joshua Leads Israel',
    ref: 'Jos 1-4',
    era: 'conquest',
    icon: '⚔️',
    desc: "After Moses' death, Joshua leads Israel across the Jordan River into the Promised Land. The waters part as they carry the Ark of the Covenant.",
  },
  {
    id: 'jericho-falls--1400',
    year: -1400,
    label: 'Jericho Falls',
    ref: 'Jos 6',
    era: 'conquest',
    icon: '🌆',
    desc: "The walls of Jericho collapse after Israel marches around them for seven days and shouts. Every wall falls except Rahab's house, who had hidden the spies.",
  },
  {
    id: 'rahab-and-the-spies--1350',
    year: -1350,
    label: 'Rahab & the Spies',
    ref: 'Jos 2',
    era: 'conquest',
    icon: '🧵',
    desc: 'Joshua sends spies to Jericho. Rahab hides them on her roof. In exchange for her faith, she and her family are saved when Jericho is destroyed.',
  },
  {
    id: 'deborah-judges-israel--1250',
    year: -1250,
    label: 'Deborah Judges Israel',
    ref: 'Jdg 4-5',
    era: 'conquest',
    icon: '👸',
    desc: "Israel's only female judge leads the nation. With Barak and Jael, Deborah defeats Sisera's army. Jael drives a tent peg through the enemy's temple.",
  },
  {
    id: 'gideons-victory--1160',
    year: -1160,
    label: "Gideon's Victory",
    ref: 'Jdg 7',
    era: 'conquest',
    icon: '🏺',
    desc: "With only 300 men and torches hidden in clay jars, Gideon defeats Midian's thousands. 'The sword of the Lord and of Gideon!'",
  },
  {
    id: 'samson--1100',
    year: -1100,
    label: 'Samson',
    ref: 'Jdg 13-16',
    era: 'conquest',
    icon: '💪',
    desc: "Born to serve God with superhuman strength, Samson's tragic flaw leads to his capture. He pulls down a temple, killing more Philistines in death than in his life.",
  },
  {
    id: 'ruth-and-boaz--1080',
    year: -1080,
    label: 'Ruth & Boaz',
    ref: 'Ruth 1-4',
    era: 'conquest',
    icon: '🌾',
    desc: 'A Moabite woman follows her mother-in-law Naomi to Bethlehem. She marries Boaz and becomes the great-grandmother of King David — and an ancestor of Jesus.',
  },
  {
    id: 'samuel-called--1050',
    year: -1050,
    label: 'Samuel Called',
    ref: '1 Sam 3',
    era: 'kingdom',
    icon: '📢',
    desc: "A young boy in the Temple hears God's voice: 'Samuel! Samuel!' He becomes the last judge of Israel and anoints the first two kings.",
  },
  {
    id: 'saul-becomes-king--1050',
    year: -1050,
    label: 'Saul Becomes King',
    ref: '1 Sam 10',
    era: 'kingdom',
    icon: '👑',
    desc: 'Israel demands a king like other nations. God gives them Saul — impressive in appearance, but his heart is not fully devoted to God.',
  },
  {
    id: 'david-kills-goliath--1025',
    year: -1025,
    label: 'David Kills Goliath',
    ref: '1 Sam 17',
    era: 'kingdom',
    icon: '🏹',
    desc: "A shepherd boy with five smooth stones and extraordinary faith defeats Goliath, the Philistine champion. 'You come against me with sword... but I come against you in the name of the Lord.'",
  },
  {
    id: 'david-becomes-king--1010',
    year: -1010,
    label: 'David Becomes King',
    ref: '2 Sam 5',
    era: 'kingdom',
    icon: '🏰',
    desc: "David unites all 12 tribes and establishes Jerusalem as the capital. God makes an eternal covenant: David's throne will last forever.",
  },
  {
    id: 'ark-to-jerusalem--1000',
    year: -1000,
    label: 'Ark to Jerusalem',
    ref: '2 Sam 6',
    era: 'kingdom',
    icon: '📦',
    desc: "David brings the Ark of the Covenant to Jerusalem with dancing and singing. 'The Lord is for us — who can stand against us?'",
  },
  {
    id: 'solomon-becomes-king--970',
    year: -970,
    label: 'Solomon Becomes King',
    ref: '1 Kgs 2',
    era: 'kingdom',
    icon: '💎',
    desc: "Solomon inherits the throne. God offers him any gift. He asks for wisdom to lead God's people. God grants it — plus wealth and honor.",
  },
  {
    id: 'solomons-temple--966',
    year: -966,
    label: "Solomon's Temple",
    ref: '1 Kgs 6',
    era: 'kingdom',
    icon: '🕍',
    desc: "Seven years to build. The most magnificent building on earth — where God's glory dwells. Solomon dedicates it with prayer: 'Will God really dwell on earth with man?'",
  },
  {
    id: 'kingdom-divides--930',
    year: -930,
    label: 'Kingdom Divides',
    ref: '1 Kgs 12',
    era: 'divided',
    icon: '💔',
    desc: "After Solomon's death, 10 tribes rebel under Jeroboam. The nation splits — Northern Kingdom (Israel) and Southern Kingdom (Judah) — never to fully reunite.",
  },
  {
    id: 'elijah-vs-baal--900',
    year: -900,
    label: 'Elijah vs. Baal',
    ref: '1 Kgs 17-18',
    era: 'divided',
    icon: '⚡',
    desc: "Drought grips the land. Elijah confronts 450 prophets of Baal on Mount Carmel. Fire falls from heaven. 'The Lord — He is God! The Lord — He is God!'",
  },
  {
    id: 'elishas-miracles--850',
    year: -850,
    label: "Elisha's Miracles",
    ref: '2 Kgs 2-8',
    era: 'divided',
    icon: '✨',
    desc: "Elisha inherits Elijah's mantle and performs twice as many miracles — healing Naaman, raising the Shunammite's son, multiplying the widow's oil.",
  },
  {
    id: 'jonah-in-nineveh--790',
    year: -790,
    label: 'Jonah in Nineveh',
    ref: 'Jon 1-4',
    era: 'divided',
    icon: '🐋',
    desc: "God sends Jonah to Israel's enemy Nineveh. After a three-day detour in a great fish, Jonah preaches and the entire city — 120,000 people — repents in sackcloth and ashes.",
  },
  {
    id: 'isaiahs-vision--740',
    year: -740,
    label: "Isaiah's Vision",
    ref: 'Isa 6',
    era: 'divided',
    icon: '👼',
    desc: "Isaiah sees the Lord in the Temple: 'Holy, holy, holy!' He cries, 'Woe is me!' A seraph touches his lips with a coal from the altar and says, 'Your guilt is taken away.'",
  },
  {
    id: 'israel-falls--722',
    year: -722,
    label: 'Israel Falls',
    ref: '2 Kgs 17',
    era: 'divided',
    icon: '😢',
    desc: "Assyria conquers the Northern Kingdom. The 10 tribes are scattered among nations — the so-called 'lost tribes of Israel.' Only Judah remains.",
  },
  {
    id: 'hezekiahs-defeat--701',
    year: -701,
    label: "Hezekiah's Defeat",
    ref: '2 Kgs 19',
    era: 'divided',
    icon: '🛡️',
    desc: 'Assyria threatens Jerusalem. Hezekiah prays. That night, an angel kills 185,000 Assyrian soldiers. Sennacherib returns home and is killed by his own sons.',
  },
  {
    id: 'josiahs-reform--640',
    year: -640,
    label: "Josiah's Reform",
    ref: '2 Kgs 22-23',
    era: 'divided',
    icon: '📖',
    desc: 'While repairing the Temple, workers find the Book of the Law. Josiah reads it, weeps, and leads a nationwide revival, reinstating Passover.',
  },
  {
    id: 'daniel-in-babylon--605',
    year: -605,
    label: 'Daniel in Babylon',
    ref: 'Dan 1',
    era: 'divided',
    icon: '🦁',
    desc: "The first deportation to Babylon. Daniel and his friends are taken and choose not to eat the king's food. God gives them favor and wisdom.",
  },
  {
    id: 'ezekiels-visions--597',
    year: -597,
    label: "Ezekiel's Visions",
    ref: 'Eze 1-48',
    era: 'divided',
    icon: '👁️',
    desc: 'Among exiles by the Chebar River, Ezekiel sees visions of God, the valley of dry bones coming to life, and the future Temple.',
  },
  {
    id: 'jerusalem-destroyed--586',
    year: -586,
    label: 'Jerusalem Destroyed',
    ref: '2 Kgs 25',
    era: 'exile',
    icon: '🔥',
    desc: 'After years of prophetic warning, Babylon destroys Jerusalem and the Temple. The city burns. The people are taken into exile — 70 years of captivity begin.',
  },
  {
    id: 'nebuchadnezzars-dream--575',
    year: -575,
    label: "Nebuchadnezzar's Dream",
    ref: 'Dan 2',
    era: 'exile',
    icon: '💤',
    desc: "King Nebuchadnezzar dreams of a great statue — gold, silver, bronze, iron, clay. Daniel interprets: kingdoms will rise and fall, but God's kingdom will last forever.",
  },
  {
    id: 'fiery-furnace--553',
    year: -553,
    label: 'Fiery Furnace',
    ref: 'Dan 3',
    era: 'exile',
    icon: '🔥',
    desc: 'Shadrach, Meshach, and Abednego refuse to bow to a golden statue. They are thrown into a blazing furnace — and a fourth figure appears, walking with them in the fire.',
  },
  {
    id: 'cyruss-decree--539',
    year: -539,
    label: "Cyrus's Decree",
    ref: 'Ezr 1',
    era: 'exile',
    icon: '📋',
    desc: "Cyrus of Persia conquers Babylon and issues a decree: God's Temple can be rebuilt. The exiles are free to return home — 70 years of exile fulfilled.",
  },
  {
    id: 'temple-foundation--536',
    year: -536,
    label: 'Temple Foundation',
    ref: 'Ezr 3',
    era: 'return',
    icon: '🏗️',
    desc: "The exiles return and lay the Temple foundation. The older people weep — the new Temple seems so small compared to Solomon's. Haggai will encourage them to finish.",
  },
  {
    id: 'temple-completed--520',
    year: -520,
    label: 'Temple Completed',
    ref: 'Ezr 6',
    era: 'return',
    icon: '🏛️',
    desc: "After opposition and delays, the Temple is completed and dedicated. Children who had seen Solomon's Temple weep at its lesser glory, but others celebrate.",
  },
  {
    id: 'ezra-leads-revival--458',
    year: -458,
    label: 'Ezra Leads Revival',
    ref: 'Ezr 7-10',
    era: 'return',
    icon: '📜',
    desc: 'Ezra leads a third group back and discovers the people have married foreigners. He leads confession and repentance — the people agree to put away their foreign wives.',
  },
  {
    id: 'nehemiahs-wall--445',
    year: -445,
    label: "Nehemiah's Wall",
    ref: 'Neh 4-6',
    era: 'return',
    icon: '🧱',
    desc: "Nehemiah rebuilds Jerusalem's walls in just 52 days despite fierce opposition. 'The joy of the Lord is your strength.'",
  },
  {
    id: 'esther-saves-the-jews--430',
    year: -430,
    label: 'Esther Saves the Jews',
    ref: 'Est 1-10',
    era: 'return',
    icon: '👸',
    desc: "Queen Esther risks her life to save her people from Haman's plot. 'If I perish, I perish.' The Jewish festival of Purim commemorates their deliverance.",
  },
  {
    id: 'malachi-last-prophet--400',
    year: -400,
    label: 'Malachi — Last Prophet',
    ref: 'Mal 1-4',
    era: 'return',
    icon: '📣',
    desc: "The last prophetic voice. 'Return to me, and I will return to you.' God promises Elijah's return. Then 400 years of silence. The world waits for the Messiah.",
  },
  {
    id: 'birth-of-jesus--5',
    year: -5,
    label: 'Birth of Jesus',
    ref: 'Luke 2',
    era: 'jesus',
    icon: '⭐',
    desc: 'The Creator of the universe is born in a stable in Bethlehem. Angels announce His birth to shepherds. The Word becomes flesh and dwells among us.',
  },
  {
    id: 'magi--5',
    year: -5,
    label: 'Magi Follow the Star',
    ref: 'Matt 2',
    era: 'jesus',
    icon: '🌟',
    desc: 'Wise men from the East follow a miraculous star to worship the newborn King. Herod slaughters the infants, and the family flees to Egypt.',
  },
  {
    id: 'jesus-in-the-temple--12',
    year: 12,
    label: 'Jesus in the Temple',
    ref: 'Luke 2:41-52',
    era: 'jesus',
    icon: '📖',
    desc: "At 12, Jesus amazes teachers in the Temple. 'Did you not know I had to be in my Father\'s house?' He returns, submitting to Joseph and Mary.",
  },
  {
    id: 'jesus-baptized--27',
    year: 27,
    label: 'Jesus Baptized',
    ref: 'Matt 3',
    era: 'jesus',
    icon: '🕊️',
    desc: "John baptizes Jesus in the Jordan. The Spirit descends like a dove. The Father speaks: 'This is my Son, whom I love; with him I am well pleased.'",
  },
  {
    id: 'temptation--27',
    year: 27,
    label: 'Temptation in Desert',
    ref: 'Matt 4',
    era: 'jesus',
    icon: '🏜️',
    desc: 'For 40 days, Jesus fasts in the wilderness. The devil tempts Him three times. Jesus responds with Scripture each time. Angels come and attend Him.',
  },
  {
    id: 'sermon-on-the-mount--27',
    year: 27,
    label: 'Sermon on the Mount',
    ref: 'Matt 5-7',
    era: 'jesus',
    icon: '⛰️',
    desc: "The greatest sermon ever preached. The Beatitudes. 'You are the salt and light.' Love your enemies. Pray in secret. Build on the rock. The crowds were amazed.",
  },
  {
    id: 'calming-the-storm--29',
    year: 29,
    label: 'Calming the Storm',
    ref: 'Mark 4',
    era: 'jesus',
    icon: '🌊',
    desc: "'Quiet! Be still!' Jesus rebukes a storm and it obeys Him. The disciples ask: 'Who is this? Even the wind and waves obey him!'",
  },
  {
    id: 'feeding-5000--29',
    year: 29,
    label: 'Feeding 5,000',
    ref: 'John 6',
    era: 'jesus',
    icon: '🐟',
    desc: 'A boy offers five loaves and two fish. Jesus multiplies them to feed 5,000 men (plus women and children). Twelve baskets of leftovers are gathered.',
  },
  {
    id: 'walking-on-water--29',
    year: 29,
    label: 'Walking on Water',
    ref: 'Matt 14',
    era: 'jesus',
    icon: '🚶',
    desc: "Jesus walks on the Sea of Galilee in the night. Peter walks on water toward Jesus — then sinks in fear. 'Oh you of little faith, why did you doubt?'",
  },
  {
    id: 'good-samaritan--29',
    year: 29,
    label: 'Good Samaritan',
    ref: 'Luke 10',
    era: 'jesus',
    icon: '❤️',
    desc: "'Who is my neighbor?' Jesus tells of a man beaten by robbers. A priest and Levite pass by. A Samaritan — enemy of the Jews — has compassion and saves him.",
  },
  {
    id: 'lazarus-raised--30',
    year: 30,
    label: 'Lazarus Raised',
    ref: 'John 11',
    era: 'jesus',
    icon: '🪦',
    desc: "'Take away the stone.' Martha objects — four days dead! Jesus weeps. 'I am the resurrection and the life.' Lazarus walks out, still wrapped in burial cloths.",
  },
  {
    id: 'triumphal-entry--30',
    year: 30,
    label: 'Triumphal Entry',
    ref: 'Matt 21',
    era: 'jesus',
    icon: '🌿',
    desc: "Jesus rides into Jerusalem on a donkey. Crowds wave palm branches. 'Hosanna! Blessed is he who comes in the name of the Lord!' The city shakes: 'Who is this?'",
  },
  {
    id: 'the-last-supper--30',
    year: 30,
    label: 'The Last Supper',
    ref: 'John 13-17',
    era: 'jesus',
    icon: '🍞',
    desc: "Jesus washes His disciples' feet. Breaks bread. Pours wine. 'This is my body... this is my blood.' Then He prays for them and for all who would believe.",
  },
  {
    id: 'garden-of-gethsemane--30',
    year: 30,
    label: 'Garden of Gethsemane',
    ref: 'Matt 26',
    era: 'jesus',
    icon: '🌙',
    desc: "'My Father, if it is possible, may this cup be taken from me.' Jesus prays in agony while His disciples sleep. Betrayal comes with a kiss.",
  },
  {
    id: 'the-crucifixion--30',
    year: 30,
    label: 'The Crucifixion',
    ref: 'John 19',
    era: 'jesus',
    icon: '✝️',
    desc: "'Father, forgive them.' Nails pierce hands and feet. Darkness falls. 'It is finished.' The Son of God dies for the sins of the world. The Temple curtain tears from top to bottom.",
  },
  {
    id: 'the-resurrection--30',
    year: 30,
    label: 'The Resurrection',
    ref: 'Matt 28',
    era: 'jesus',
    icon: '🌅',
    desc: "The stone is rolled away. 'He is not here — He has risen!' History's axis point. Everything changes. Death is defeated. The grave is empty.",
  },
  {
    id: 'road-to-emmaus--30',
    year: 30,
    label: 'Road to Emmaus',
    ref: 'Luke 24',
    era: 'jesus',
    icon: '🚶',
    desc: "Two disciples walk to Emmaus. Jesus joins them but their eyes are kept from recognizing Him. He explains the Scriptures. At dinner, their eyes are opened. 'Were not our hearts burning within us?'",
  },
  {
    id: 'doubting-thomas--30',
    year: 30,
    label: 'Doubting Thomas',
    ref: 'John 20',
    era: 'jesus',
    icon: '✋',
    desc: "Thomas wasn't there. Eight days later, Jesus appears. 'Put your finger here... stop doubting and believe.' Thomas responds: 'My Lord and my God!'",
  },
  {
    id: 'the-ascension--30',
    year: 30,
    label: 'The Ascension',
    ref: 'Acts 1',
    era: 'earlyChurch',
    icon: '☁️',
    desc: "Jesus ascends to heaven before their eyes. A cloud receives Him. Angels promise: 'This same Jesus will come back in the same way.'",
  },
  {
    id: 'pentecost--30',
    year: 30,
    label: 'Pentecost',
    ref: 'Acts 2',
    era: 'earlyChurch',
    icon: '🔥',
    desc: "The Holy Spirit falls like tongues of fire. 3,000 are saved in one day. The Church is born. Peter stands and preaches: 'Repent and be baptized.'",
  },
  {
    id: 'stephen-martyred--34',
    year: 34,
    label: 'Stephen Martyred',
    ref: 'Acts 7',
    era: 'earlyChurch',
    icon: '🪨',
    desc: "Stephen, full of the Holy Spirit, preaches a powerful sermon and recounts Israel's history. He is stoned to death, becoming the first martyr. Paul (then Saul) approves of his killing.",
  },
  {
    id: 'pauls-conversion--35',
    year: 35,
    label: "Paul's Conversion",
    ref: 'Acts 9',
    era: 'earlyChurch',
    icon: '⚡',
    desc: "Saul — chief persecutor — meets the risen Jesus on the road to Damascus. Blinded by light, he is healed by Ananias. 'He is the Son of God!'",
  },
  {
    id: 'peter-cornelius--37',
    year: 37,
    label: 'Peter & Cornelius',
    ref: 'Acts 10',
    era: 'earlyChurch',
    icon: '🤝',
    desc: 'Peter receives a vision of unclean animals, then preaches to Cornelius, a Roman centurion. The Holy Spirit falls on Gentiles, marking a pivotal moment: the gospel is for all nations.',
  },
  {
    id: 'peters-vision-cornelius--40',
    year: 40,
    label: "Peter's Vision & Cornelius",
    ref: 'Acts 10',
    era: 'earlyChurch',
    icon: '😇',
    desc: "While praying, Peter receives a vision of a sheet filled with all kinds of animals, both clean and unclean. A voice tells him to eat, declaring, 'Do not call anything impure that God has made clean.' This prepares him to preach to Cornelius, a Gentile, and realize the gospel is for all.",
  },
  {
    id: 'pauls-first-journey--45',
    year: 45,
    label: "Paul's First Journey",
    ref: 'Acts 13-14',
    era: 'earlyChurch',
    icon: '🌍',
    desc: 'The Holy Spirit sends Barnabas and Saul out from Antioch. The Gospel moves from Jerusalem to Cyprus to Asia Minor. The first missionary journey.',
  },
  {
    id: 'jerusalem-council--49',
    year: 49,
    label: 'Jerusalem Council',
    ref: 'Acts 15',
    era: 'earlyChurch',
    icon: '📋',
    desc: 'Leaders debate whether Gentiles must be circumcised. James presides. The decision: No! Grace alone through faith alone. A letter goes to the churches.',
  },
  {
    id: 'pauls-second-journey--50',
    year: 50,
    label: "Paul's Second Journey",
    ref: 'Acts 16',
    era: 'earlyChurch',
    icon: '🎵',
    desc: "'Come over and help us.' The Macedonian call. Paul plants churches in Philippi, Thessalonica, Berea. In Athens, he preaches to an unknown God.",
  },
  {
    id: 'pauls-third-journey--54',
    year: 54,
    label: "Paul's Third Journey",
    ref: 'Acts 18-21',
    era: 'earlyChurch',
    icon: '📖',
    desc: "Three years in Ephesus. 'All Asia has heard the Word.' Paul raises Eutychus from the dead. 'I have testified to both Jews and Greeks about repentance toward God and faith in our Lord Jesus.'",
  },
  {
    id: 'paul-arrested--58',
    year: 58,
    label: 'Paul Arrested',
    ref: 'Acts 21-23',
    era: 'earlyChurch',
    icon: '⛓️',
    desc: 'Paul returns to Jerusalem. A mob seizes him. Roman soldiers rescue him. From prison, he writes letters that will shape Christianity for 2,000 years.',
  },
  {
    id: 'shipwreck--60',
    year: 60,
    label: 'Shipwreck',
    ref: 'Acts 27',
    era: 'earlyChurch',
    icon: '🚢',
    desc: "Paul is shipwrecked on Malta. A viper bites him. He shakes it off into the fire — no harm. The island's governor becomes a believer. 276 people survive.",
  },
  {
    id: 'paul-martyred--64',
    year: 64,
    label: 'Paul Martyred',
    ref: '2 Tim 4',
    era: 'earlyChurch',
    icon: '⚔️',
    desc: "Paul awaits execution in Rome under Nero. His last letter: 'I have fought the good fight. I have finished the race. There is laid up for me the crown of righteousness.'",
  },
  {
    id: 'peter-martyred--67',
    year: 67,
    label: 'Peter Martyred',
    ref: '1 Pet',
    era: 'earlyChurch',
    icon: '🔙',
    desc: "Peter is crucified in Rome. He asks to be crucified upside-down, feeling unworthy to die as his Lord did. 'I am coming to you, Master.'",
  },
  {
    id: 'temple-destroyed--70',
    year: 70,
    label: 'Temple Destroyed',
    ref: 'Matt 24',
    era: 'earlyChurch',
    icon: '💔',
    desc: 'Jesus predicted it. Rome fulfills it. The Temple is destroyed, stones burned. The wound of 70 AD still affects Judaism today. Israel scatters again.',
  },
  {
    id: 'revelation-written--95',
    year: 95,
    label: 'Revelation Written',
    ref: 'Rev 1',
    era: 'earlyChurch',
    icon: '👁️',
    desc: "John, exiled on Patmos, receives visions from Jesus. Letters to seven churches. Throne room visions. The final promise: 'I am coming soon.' The last prayer of the Bible: 'Come, Lord Jesus.'",
  },
  {
    id: 'death-of-john--100',
    year: 100,
    label: 'Death of John',
    ref: 'Church Tradition',
    era: 'earlyChurch',
    icon: '🕊️',
    desc: "The last living apostle, John, passes away in Ephesus. Having outlived persecution and exile, he leaves behind writings that inspire faith for generations. The apostolic age draws to a close with the beloved disciple's peaceful departure.",
  },
];

const TOTAL_YEARS = 4106;
const MIN_YEAR = -4000;
const TIMELINE_W = 60000;

function yearToX(year) {
  return ((year - MIN_YEAR) / TOTAL_YEARS) * TIMELINE_W + 40;
}

function getEra(year, eras = ERAS) {
  return eras.find((e) => year >= e.start && year <= e.end);
}

export default function BibleTimeline() {
  const [selected, setSelected] = useState(null);
  const [eraFilter, setEraFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
    }
  }, []);

  const filtered = useMemo(() => {
    let events = eraFilter === 'All' ? EVENTS : EVENTS.filter((e) => e.era === eraFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      events = events.filter(
        (e) =>
          e.label.toLowerCase().includes(q) ||
          e.desc.toLowerCase().includes(q) ||
          e.ref.toLowerCase().includes(q)
      );
    }
    return events;
  }, [eraFilter, searchQuery]);

  const selectedEvent = useMemo(() => {
    if (selected === null) return null;
    return EVENTS.find((e) => e.id === selected);
  }, [selected]);

  const jumpToEra = (era) => {
    const eraObj = ERAS.find((e) => e.id === era);
    if (eraObj && scrollRef.current) {
      const x = yearToX(eraObj.start);
      scrollRef.current.scrollTo({ left: x - 100, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🌍 Bible Timeline</h1>
        <p className={styles.subtitle}>
          {eraFilter === 'All'
            ? `From Creation to Revelation — ${EVENTS.length} key events across 4,000 years of history.`
            : `Showing ${filtered.length} key events from the ${ERAS.find((e) => e.id === eraFilter)?.label}.`}{' '}
          Scroll to explore.
        </p>
      </header>

      <div className={styles.main}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search events, scriptures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className={styles.eraFilters}>
          <button
            className={`${styles.eraBtn} ${eraFilter === 'All' ? styles.eraBtnActive : ''}`}
            onClick={() => {
              setEraFilter('All');
              scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
            }}
          >
            All
          </button>
          {ERAS.map((era) => (
            <button
              key={era.id}
              className={`${styles.eraBtn} ${eraFilter === era.id ? styles.eraBtnActive : ''}`}
              onClick={() => {
                const newVal = eraFilter === era.id ? 'All' : era.id;
                setEraFilter(newVal);
                if (newVal !== 'All') jumpToEra(era.id);
                else scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
              }}
              style={
                eraFilter === era.id ? { backgroundColor: era.color, borderColor: era.color } : {}
              }
            >
              {era.emoji} {era.label}
            </button>
          ))}
        </div>

        <div className={styles.timelineWrapper}>
          <div className={styles.timelineScroll} ref={scrollRef}>
            <div className={styles.timelineInner}>
              {ERAS.map((era) => (
                <div
                  key={era.id}
                  className={styles.eraBand}
                  style={{
                    left: yearToX(era.start),
                    width: yearToX(era.end) - yearToX(era.start),
                    '--eraColor': era.color,
                  }}
                >
                  <div className={styles.eraLabel}>{era.label}</div>
                </div>
              ))}

              <div className={styles.centerLine} />

              {[-4000, -3000, -2000, -1500, -1000, -500, 0, 50, 100].map((year) => (
                <div
                  key={`year-marker-${year}`}
                  className={styles.yearMarker}
                  style={{ left: yearToX(year) }}
                >
                  <div className={styles.yearTick} />
                  <div className={styles.yearLabel}>
                    {year === 0 ? 'AD/BC' : year > 0 ? `AD ${year}` : `${Math.abs(year)} BC`}
                  </div>
                </div>
              ))}

              {/* Collision avoidance logic for horizontal spacing and vertical staggering */}
              {(() => {
                const levels = 6;
                const minSpacing = 110; // Increased spacing for labels
                const lastXByLevel = new Array(levels).fill(-9999);

                return filtered.map((event, i) => {
                  const keyValue = event.id || `${event.year}-${event.label}`;
                  const rawX = yearToX(event.year);
                  const era = getEra(event.year);
                  const isSelected = selected === event.id;

                  // Stagger vertically using 6 different levels
                  // Levels: 0, 1, 2 (above centerline) | 3, 4, 5 (below centerline)
                  const level = i % levels;

                  // Collision avoidance: ensure events on the SAME LEVEL have minSpacing
                  let adjustedX = Math.max(rawX, lastXByLevel[level] + minSpacing);
                  lastXByLevel[level] = adjustedX;

                  // Determine vertical position based on level
                  // We'll use a range of heights to scatter them
                  // Spaced between 18% and 82% to avoid clipping labels at top/bottom
                  const verticalOffsets = [18, 30, 42, 58, 70, 82];
                  const topPos = `${verticalOffsets[level]}%`;
                  const isAboveCenter = verticalOffsets[level] < 50;

                  // Calculate connector height to aim toward center line
                  const distToCenter = Math.abs(50 - verticalOffsets[level]);
                  const connectorHeight = `${distToCenter * 0.8}%`;

                  return (
                    <div
                      key={keyValue}
                      className={styles.eventNode}
                      style={{
                        left: adjustedX,
                        top: topPos,
                        '--eraColor': era?.color || '#6B7280',
                        zIndex: isSelected ? 10 : 2,
                      }}
                      onClick={() => setSelected(isSelected ? null : event.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === 'Enter' && setSelected(isSelected ? null : event.id)
                      }
                      aria-label={`${event.label}, ${event.year > 0 ? 'AD' : 'BC'} ${Math.abs(event.year)}`}
                    >
                      <div
                        className={styles.connector}
                        style={{
                          height: connectorHeight,
                          minHeight: '20px',
                          marginBottom: isAboveCenter ? '4px' : undefined,
                          marginTop: !isAboveCenter ? '4px' : undefined,
                          order: isAboveCenter ? 2 : 0,
                          transform: isAboveCenter ? 'rotate(180deg)' : 'none',
                        }}
                      />
                      <div
                        className={`${styles.nodeCircle} ${isSelected ? styles.nodeCircleSelected : ''}`}
                        style={{ order: 1 }}
                      >
                        {event.icon}
                      </div>
                      <div
                        className={`${styles.eventLabel} ${isSelected ? styles.eventLabelSelected : ''}`}
                        style={{
                          order: isAboveCenter ? 0 : 2,
                          marginTop: isAboveCenter ? 0 : '6px',
                          marginBottom: isAboveCenter ? '6px' : 0,
                        }}
                      >
                        {event.label}
                        <div className={styles.labelYear}>
                          {event.year > 0 ? `AD ${event.year}` : `${Math.abs(event.year)} BC`}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
          <div className={styles.scrollHint}>
            <span>Scroll horizontally to explore the full timeline &gt;&gt;</span>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🔍</div>
            <p>No events found matching your search.</p>
          </div>
        )}

        {selectedEvent && (
          <div
            className={styles.detailCard}
            style={{ '--eraColor': getEra(selectedEvent.year)?.color || '#6B7280' }}
          >
            <div className={styles.detailIcon}>{selectedEvent.icon}</div>
            <div className={styles.detailContent}>
              <div className={styles.detailHeader}>
                <h3 className={styles.detailTitle}>{selectedEvent.label}</h3>
                <span className={styles.detailBadge}>
                  {selectedEvent.year > 0
                    ? `AD ${selectedEvent.year}`
                    : `${Math.abs(selectedEvent.year)} BC`}
                </span>
                <span className={styles.detailRef}>{selectedEvent.ref}</span>
              </div>
              <p className={styles.detailDesc}>{selectedEvent.desc}</p>
              <p className={styles.detailEra}>
                {getEra(selectedEvent.year)?.emoji} {getEra(selectedEvent.year)?.label}
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
