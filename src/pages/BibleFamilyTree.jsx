import { useState } from 'react'

const PEOPLE = {
  adam:    { name:'Adam',    emoji:'🌿', era:'Creation',  color:'#10B981', ref:'Gen 2', desc:'The first man. Created from dust. Named every creature. Chose Eve over obedience.', key:'Father of all humanity', children:['cain','abel','seth'] },
  eve:     { name:'Eve',    emoji:'🌸', era:'Creation',  color:'#EC4899', ref:'Gen 2-3', desc:'Created from Adam\'s rib. First to be deceived. Named "mother of all the living" by Adam.', key:'Mother of all humanity', children:['cain','abel','seth'] },
  cain:    { name:'Cain',   emoji:'⚔️', era:'Creation',  color:'#EF4444', ref:'Gen 4', desc:'First murderer. Killed his brother Abel out of jealousy. Marked by God for protection.', key:'First murder in history', children:[] },
  abel:    { name:'Abel',   emoji:'🐑', era:'Creation',  color:'#F59E0B', ref:'Gen 4', desc:'Offered the firstborn of his flock. God accepted his offering. Killed by his brother Cain.', key:'First martyr in Scripture', children:[] },
  seth:    { name:'Seth',   emoji:'⭐', era:'Creation',  color:'#6366F1', ref:'Gen 4-5', desc:'Third son of Adam and Eve. Ancestor of Noah. Named because "God has granted me another child in place of Abel."', key:'Ancestor of Noah', children:['enos'] },
  enos:    { name:'Enos',   emoji:'🙏', era:'Pre-Flood', color:'#8B5CF6', ref:'Gen 4:26', desc:'Son of Seth. In his time "people began to call on the name of the Lord."', key:'When prayer began', children:['kenan'] },
  kenan:   { name:'Kenan',  emoji:'📜', era:'Pre-Flood', color:'#8B5CF6', ref:'Gen 5', desc:'Lived 910 years. Part of the unbroken line from Seth to Noah.', key:'Ante-diluvian patriarch', children:['mahalalel'] },
  mahalalel:{ name:'Mahalalel', emoji:'✨', era:'Pre-Flood', color:'#8B5CF6', ref:'Gen 5', desc:'Name means "Blessed God." Lived 895 years. Grandfather of Enoch.', key:'Blessed God', children:['jared'] },
  jared:   { name:'Jared',  emoji:'📖', era:'Pre-Flood', color:'#8B5CF6', ref:'Gen 5', desc:'Father of Enoch. Lived 962 years — one of the longest-lived people in Scripture.', key:'Father of Enoch', children:['enoch'] },
  enoch:   { name:'Enoch',  emoji:'☁️', era:'Pre-Flood', color:'#60A5FA', ref:'Gen 5:24', desc:'"Enoch walked faithfully with God; then he was no more, because God took him away." Never died.', key:'Taken to heaven without dying', children:['methuselah'] },
  methuselah:{ name:'Methuselah', emoji:'⏳', era:'Pre-Flood', color:'#F59E0B', ref:'Gen 5', desc:'Lived 969 years — the oldest person recorded in Scripture. Died in the year of the flood.', key:'Oldest person in Bible history', children:['lamech2'] },
  lamech2: { name:'Lamech', emoji:'🕊️', era:'Pre-Flood', color:'#8B5CF6', ref:'Gen 5', desc:'Father of Noah. Prophesied that Noah would "bring us comfort in the labor and painful toil of our hands."', key:'Prophesied Noah\'s calling', children:['noah'] },
  noah:    { name:'Noah',   emoji:'🚢', era:'Flood',     color:'#14B8A6', ref:'Gen 6-9', desc:'Righteous man who built an ark. Saved his family and the animals from a global flood. God made a covenant with him.', key:'Saved humanity through obedience', children:['shem','ham','japheth'] },
  shem:    { name:'Shem',   emoji:'⭐', era:'Post-Flood', color:'#6366F1', ref:'Gen 10', desc:'Eldest son of Noah. "Father of all the sons of Eber" — ancestor of the Semitic peoples and Abraham.', key:'Ancestor of Abraham', children:['arphaxad'] },
  ham:     { name:'Ham',    emoji:'🌍', era:'Post-Flood', color:'#F97316', ref:'Gen 10', desc:'Son of Noah. Father of Canaan. Saw his father\'s nakedness and told his brothers — this led to Noah\'s prophecy over Canaan.', key:'Father of African and Canaanite peoples', children:[] },
  japheth: { name:'Japheth', emoji:'🌐', era:'Post-Flood', color:'#3B82F6', ref:'Gen 10', desc:'Son of Noah. Father of the Indo-European peoples. "God shall enlarge Japheth, and he shall dwell in the tents of Shem."', key:'Father of European peoples', children:[] },
  arphaxad:{ name:'Arphaxad', emoji:'📜', era:'Post-Flood', color:'#8B5CF6', ref:'Gen 11', desc:'Son of Shem. Born two years after the flood. Ancestor of Eber and through him of Abraham.', key:'Bridge from Shem to Abraham', children:['shelah'] },
  shelah:  { name:'Shelah', emoji:'📖', era:'Post-Flood', color:'#8B5CF6', ref:'Gen 11', desc:'Son of Arphaxad. Part of the genealogical line from Noah to Abraham.', key:'Patriarch of the Shemite line', children:['eber'] },
  eber:    { name:'Eber',   emoji:'✡️', era:'Post-Flood', color:'#F59E0B', ref:'Gen 11', desc:'Some scholars believe the word "Hebrew" derives from his name. Ancestor of both Abraham and the Joktanite Arabs.', key:'"Hebrew" may derive from his name', children:['peleg'] },
  peleg:   { name:'Peleg',  emoji:'🌍', era:'Post-Flood', color:'#8B5CF6', ref:'Gen 10:25', desc:'"In his time the earth was divided." This may refer to the division of Babel or the separation of continents.', key:'"The earth was divided in his days"', children:['reu'] },
  reu:     { name:'Reu',    emoji:'📜', era:'Post-Flood', color:'#8B5CF6', ref:'Gen 11', desc:'Son of Peleg. Grandfather of Nahor, great-grandfather of Terah, and ancestor of Abraham.', key:'Ancestor of Abraham', children:['serug'] },
  serug:   { name:'Serug',  emoji:'📖', era:'Post-Flood', color:'#8B5CF6', ref:'Gen 11', desc:'Lived 230 years. Grandfather of Terah and great-great-grandfather of Abraham.', key:'Abraham\'s ancestor', children:['nahor'] },
  nahor:   { name:'Nahor',  emoji:'🏠', era:'Post-Flood', color:'#8B5CF6', ref:'Gen 11', desc:'Father of Terah and grandfather of Abraham. Also the name of Abraham\'s brother.', key:'Father of Terah', children:['terah'] },
  terah:   { name:'Terah',  emoji:'🌙', era:'Patriarchs', color:'#A855F7', ref:'Gen 11:26', desc:'Father of Abraham, Nahor, and Haran. Began the journey to Canaan from Ur but stopped and died in Haran.', key:'Began the journey Abraham completed', children:['abraham','nahor2','haran'] },
  haran:   { name:'Haran',  emoji:'☠️', era:'Patriarchs', color:'#6B7280', ref:'Gen 11:28', desc:'Father of Lot. Died before his father Terah in Ur of the Chaldeans.', key:'Father of Lot', children:['lot'] },
  nahor2:  { name:'Nahor',  emoji:'🏡', era:'Patriarchs', color:'#8B5CF6', ref:'Gen 22:20', desc:'Brother of Abraham. His descendants included Rebekah (wife of Isaac) and Rachel\'s family.', key:'Ancestor of Rebekah and Rachel', children:[] },
  lot:     { name:'Lot',    emoji:'🧂', era:'Patriarchs', color:'#9CA3AF', ref:'Gen 13-19', desc:'Nephew of Abraham. Chosen Sodom for its prosperity. His wife looked back and became a pillar of salt. Rescued by angels.', key:'Rescued from Sodom', children:['moab','benammi'] },
  moab:    { name:'Moab',   emoji:'🌄', era:'Patriarchs', color:'#9CA3AF', ref:'Gen 19:37', desc:'Son of Lot. Ancestor of the Moabites, including Ruth — great-grandmother of David.', key:'Ancestor of Ruth', children:[] },
  benammi: { name:'Ben-Ammi', emoji:'🗡️', era:'Patriarchs', color:'#9CA3AF', ref:'Gen 19:38', desc:'Son of Lot. Ancestor of the Ammonites. The name means "son of my people."', key:'Father of the Ammonites', children:[] },
  abraham: { name:'Abraham', emoji:'⭐', era:'Patriarchs', color:'#F59E0B', ref:'Gen 12-25', desc:'"Father of many nations." Called out of Ur. Offered Isaac. Made the covenant with God that changed history forever.', key:'Father of faith; covenant with God', children:['ishmael','isaac'] },
  sarah:   { name:'Sarah',  emoji:'👑', era:'Patriarchs', color:'#EC4899', ref:'Gen 17-21', desc:'Wife of Abraham. Laughed at the promise of a son at 90. Named "Princess" by God. Gave birth to Isaac, the child of promise.', key:'Mother of the promise', children:['isaac'] },
  hagar:   { name:'Hagar',  emoji:'🏜️', era:'Patriarchs', color:'#9CA3AF', ref:'Gen 16', desc:'Egyptian servant of Sarah. Mother of Ishmael. God heard her crying in the desert and promised to multiply her descendants.', key:'"God who sees me" (El Roi)', children:['ishmael'] },
  ishmael: { name:'Ishmael', emoji:'🏹', era:'Patriarchs', color:'#F97316', ref:'Gen 16-21', desc:'First son of Abraham, born to Hagar. Father of 12 princes. Ancestor of the Arab peoples. Buried his father alongside Isaac.', key:'Father of the Arab nations', children:[] },
  isaac:   { name:'Isaac',  emoji:'🔥', era:'Patriarchs', color:'#F59E0B', ref:'Gen 21-27', desc:'Son of promise. Bound on the altar. Married Rebekah. Father of Jacob and Esau. Lived 180 years.', key:'The child of promise — a type of Christ', children:['esau','jacob'] },
  rebekah: { name:'Rebekah', emoji:'💧', era:'Patriarchs', color:'#EC4899', ref:'Gen 24', desc:'Found at a well. Chosen for Isaac. Favored Jacob over Esau and helped him receive the blessing. Mother of twins.', key:'Mother of Jacob and Esau', children:['esau','jacob'] },
  esau:    { name:'Esau',   emoji:'🦔', era:'Patriarchs', color:'#EF4444', ref:'Gen 25-36', desc:'Hairy twin who sold his birthright for stew. Father of the Edomites. Reconciled with Jacob after decades apart.', key:'Sold his birthright; father of Edom', children:[] },
  jacob:   { name:'Jacob',  emoji:'🪜', era:'Patriarchs', color:'#8B5CF6', ref:'Gen 25-49', desc:'Supplanter turned Israel. Wrestled with God and prevailed. Father of the 12 tribes. Name changed to Israel.', key:'Became Israel — father of 12 tribes', children:['reuben','simeon','levi','judah','dan','naphtali','gad','asher','issachar','zebulun','joseph','benjamin'] },
  judah:   { name:'Judah',  emoji:'🦁', era:'Patriarchs', color:'#F59E0B', ref:'Gen 29,37-49', desc:'4th son of Jacob. Offered to be enslaved in Benjamin\'s place. Received the royal blessing: "the scepter will not depart from Judah."', key:'Ancestor of David and Jesus', children:['perez'] },
  perez:   { name:'Perez',  emoji:'👑', era:'Patriarchs', color:'#8B5CF6', ref:'Gen 38', desc:'Son of Judah and Tamar. Born first though he pulled back his hand in favor of his twin Zerah. Ancestor of Boaz and David.', key:'Ancestor of David', children:['hezron'] },
  hezron:  { name:'Hezron', emoji:'📜', era:'Egypt',       color:'#8B5CF6', ref:'Ruth 4', desc:'Son of Perez. Part of the royal line from Judah to David. His line included Boaz, great-grandfather of David.', key:'Line of David through Perez', children:['ram'] },
  ram:     { name:'Ram',    emoji:'🐏', era:'Egypt',       color:'#8B5CF6', ref:'Ruth 4', desc:'Son of Hezron. Ancestor of Amminadab and the Davidic line.', key:'Davidic ancestor', children:['amminadab'] },
  amminadab:{ name:'Amminadab', emoji:'📖', era:'Exodus', color:'#8B5CF6', ref:'Ruth 4', desc:'Father of Nahshon, who was leader of Judah during the Exodus. Father-in-law of Aaron.', key:'Father-in-law of Aaron', children:['nahshon'] },
  nahshon: { name:'Nahshon', emoji:'🌊', era:'Exodus',     color:'#3B82F6', ref:'Num 1', desc:'Leader of the tribe of Judah during the Exodus. According to tradition, first to walk into the Red Sea.', key:'First into the Red Sea', children:['salmon'] },
  salmon:  { name:'Salmon', emoji:'❤️', era:'Conquest',    color:'#EC4899', ref:'Ruth 4', desc:'Father of Boaz. According to Matthew 1, his mother was Rahab — the Jericho prostitute who hid the spies.', key:'Son of Rahab of Jericho', children:['boaz'] },
  boaz:    { name:'Boaz',   emoji:'🌾', era:'Judges',      color:'#10B981', ref:'Ruth 1-4', desc:'"Mighty man of worth." Kinsman-redeemer who married Ruth. Picture of Christ as our Redeemer.', key:'Redeemer — a picture of Christ', children:['obed'] },
  ruth:    { name:'Ruth',   emoji:'💚', era:'Judges',      color:'#10B981', ref:'Ruth 1-4', desc:'Moabite widow who chose her mother-in-law over her homeland. "Your people shall be my people." Great-grandmother of David.', key:'Loyalty and redemption; great-grandmother of David', children:['obed'] },
  obed:    { name:'Obed',   emoji:'🙏', era:'Judges',      color:'#10B981', ref:'Ruth 4', desc:'Son of Boaz and Ruth. Father of Jesse. Grandfather of David.', key:'Grandfather of David', children:['jesse'] },
  jesse:   { name:'Jesse',  emoji:'🌳', era:'Judges/Kings', color:'#F59E0B', ref:'1 Sam 16', desc:'Father of 8 sons, the youngest being David. When Samuel came to anoint a king, God said "Man looks at the outward appearance, but the Lord looks at the heart."', key:'Father of King David', children:['david'] },
  david:   { name:'David',  emoji:'👑', era:'Kingdom',     color:'#F59E0B', ref:'1 Sam 16 — 1 Kgs 2', desc:'"A man after God\'s own heart." Shepherd, warrior, poet, king. Killed Goliath. Wrote most of the Psalms. God promised his throne would last forever.', key:'The eternal covenant — throne forever', children:['solomon'] },
  bathsheba:{ name:'Bathsheba', emoji:'💫', era:'Kingdom', color:'#EC4899', ref:'2 Sam 11-12', desc:'Wife of Uriah, taken by David. Their first child died. Solomon was their second. Her wisdom and advocacy secured Solomon\'s throne.', key:'Mother of Solomon', children:['solomon'] },
  solomon: { name:'Solomon', emoji:'💎', era:'Kingdom',    color:'#F59E0B', ref:'1 Kgs 1-11', desc:'Wisest man who ever lived. Built the Temple. Wrote Proverbs, Ecclesiastes, Song of Solomon. His wealth and wisdom exceeded all kings. But his heart turned away.', key:'Wisdom, temple builder, then fall', children:['rehoboam'] },
  rehoboam:{ name:'Rehoboam', emoji:'💔', era:'Divided Kingdom', color:'#3B82F6', ref:'1 Kgs 12', desc:'Solomon\'s son. Rejected the elders\' counsel. His harshness split the kingdom in two. Ruled Judah for 17 years.', key:'His foolishness split the kingdom', children:['abijah'] },
  abijah:  { name:'Abijah', emoji:'⚔️', era:'Divided Kingdom', color:'#3B82F6', ref:'1 Kgs 15', desc:'King of Judah for 3 years. Trusted in God against superior numbers and won a remarkable victory.', key:'Won by calling on God', children:['asa'] },
  asa:     { name:'Asa',    emoji:'🌿', era:'Divided Kingdom', color:'#10B981', ref:'1 Kgs 15', desc:'One of Judah\'s good kings. Removed idols. Led revival. But trusted Aram over God near the end of his life.', key:'One of Judah\'s good kings', children:['jehoshaphat'] },
  jehoshaphat:{ name:'Jehoshaphat', emoji:'🎺', era:'Divided Kingdom', color:'#F59E0B', ref:'2 Chr 17-20', desc:'"Praise the Lord, for his love endures forever." Sent teachers throughout the land. Defeated Moab and Ammon through worship.', key:'Victory through worship', children:['jehoram'] },
  jehoram: { name:'Jehoram', emoji:'⚡', era:'Divided Kingdom', color:'#EF4444', ref:'2 Kgs 8', desc:'Married Athaliah, daughter of Ahab and Jezebel. Killed his brothers. Struck with a disease and died unmourned.', key:'Evil king; married into Ahab\'s line', children:['ahaziah'] },
  ahaziah2:{ name:'Ahaziah', emoji:'☠️', era:'Divided Kingdom', color:'#EF4444', ref:'2 Kgs 8', desc:'Son of Jehoram and Athaliah. Reigned 1 year in Jerusalem. Killed by Jehu during the purge of Ahab\'s line.', key:'Killed in Jehu\'s purge', children:['joash'] },
  joash:   { name:'Joash',  emoji:'🛡️', era:'Divided Kingdom', color:'#3B82F6', ref:'2 Kgs 11-12', desc:'Hidden in the Temple as an infant when Athaliah killed the royal family. Made king at age 7. Repaired the Temple.', key:'Hidden infant who repaired the Temple', children:['amaziah'] },
  amaziah: { name:'Amaziah', emoji:'⚔️', era:'Divided Kingdom', color:'#3B82F6', ref:'2 Kgs 14', desc:'King of Judah. Victory against Edom — then foolishly brought back Edomite gods. Defeated by Israel and humiliated.', key:'Pride led to downfall', children:['uzziah'] },
  uzziah:  { name:'Uzziah', emoji:'✝️', era:'Divided Kingdom', color:'#8B5CF6', ref:'2 Chr 26', desc:'Long and prosperous reign. "As long as he sought the LORD, God gave him success." But pride led him to burn incense in the Temple — reserved for priests — and he was struck with leprosy.', key:'Prosperity then leprosy from pride', children:['jotham'] },
  jotham:  { name:'Jotham', emoji:'🏰', era:'Divided Kingdom', color:'#10B981', ref:'2 Kgs 15', desc:'"Jotham grew powerful because he walked steadfastly before the LORD his God." Built much. Good king.', key:'Walked steadfastly with God', children:['ahaz'] },
  ahaz:    { name:'Ahaz',   emoji:'🔥', era:'Divided Kingdom', color:'#EF4444', ref:'2 Kgs 16', desc:'Sacrificed his own son in fire. Closed the Temple. Turned to Assyria rather than God. One of Judah\'s worst kings.', key:'Sacrificed his son; closed the Temple', children:['hezekiah'] },
  hezekiah:{ name:'Hezekiah', emoji:'🙏', era:'Divided Kingdom', color:'#10B981', ref:'2 Kgs 18-20', desc:'"There was no one like him among all the kings of Judah." Crushed idol worship. Prayed and God added 15 years to his life. The angel of the Lord destroyed 185,000 Assyrians in one night.', key:'God added 15 years to his life', children:['manasseh'] },
  manasseh:{ name:'Manasseh', emoji:'↩️', era:'Divided Kingdom', color:'#F97316', ref:'2 Kgs 21', desc:'Reigned 55 years — longest of any king. The worst evil. Then imprisoned in Babylon. Humbled himself. Returned and removed idols. One of Scripture\'s greatest repentance stories.', key:'Worst king who repented', children:['amon'] },
  amon:    { name:'Amon',   emoji:'☠️', era:'Divided Kingdom', color:'#EF4444', ref:'2 Kgs 21', desc:'Followed his father Manasseh\'s evil but did not repent. Killed by his servants after just 2 years.', key:'Evil without repentance', children:['josiah'] },
  josiah:  { name:'Josiah', emoji:'📜', era:'Divided Kingdom', color:'#10B981', ref:'2 Kgs 22-23', desc:'Became king at 8 years old. Found the Book of the Law. Wept. Led the greatest revival in Judah\'s history. "No king before or after turned to the Lord as Josiah did."', key:'Greatest revival king of Judah', children:['jehoahaz','jehoiakim'] },
  jehoiakim:{ name:'Jehoiakim', emoji:'🔥', era:'Exile',       color:'#EF4444', ref:'2 Kgs 23-24', desc:'Burned Jeremiah\'s scroll. Taxed the people for Egypt. Nebuchadnezzar deported him to Babylon. First wave of exile.', key:'Burned the scroll of Jeremiah', children:['jeconiah'] },
  jeconiah:{ name:'Jeconiah', emoji:'⛓️', era:'Exile',        color:'#6B7280', ref:'2 Kgs 24', desc:'Also called Coniah. Exiled to Babylon. Cursed so none of his descendants would prosper on the throne — yet he is in the genealogy of Jesus (Matt 1).', key:'Cursed king in Jesus\'s genealogy', children:['shealtiel'] },
  shealtiel:{ name:'Shealtiel', emoji:'📜', era:'Exile',       color:'#8B5CF6', ref:'Ezr 3', desc:'Son of Jeconiah. Father of Zerubbabel. Part of the royal line preserved in exile.', key:'Royal line preserved in Babylon', children:['zerubbabel'] },
  zerubbabel:{ name:'Zerubbabel', emoji:'🏗️', era:'Return',   color:'#14B8A6', ref:'Ezr 3', desc:'Led the first wave of exiles back from Babylon. Laid the foundation of the Second Temple. Messianic hope figure.', key:'Led return; rebuilt the Temple', children:['abiud'] },
  abiud:   { name:'Abiud',  emoji:'📖', era:'Post-Exile',     color:'#8B5CF6', ref:'Matt 1', desc:'Son of Zerubbabel in Matthew\'s genealogy. Bridge between the exile period and the intertestamental era.', key:'Post-exile Davidic line', children:['eliakim2'] },
  eliakim2:{ name:'Eliakim', emoji:'📜', era:'Post-Exile',    color:'#8B5CF6', ref:'Matt 1', desc:'Post-exile ancestor of Joseph, adoptive father of Jesus. Part of the royal Davidic line preserved to the first century.', key:'Davidic line to Joseph', children:['azor'] },
  azor:    { name:'Azor',   emoji:'📖', era:'Post-Exile',     color:'#8B5CF6', ref:'Matt 1', desc:'Ancestor of Joseph in Matthew 1. The Davidic royal line continuing toward the Messiah.', key:'Ancestor of Jesus through Joseph', children:['zadok2'] },
  zadok2:  { name:'Zadok',  emoji:'⭐', era:'Post-Exile',     color:'#8B5CF6', ref:'Matt 1', desc:'Ancestor of Joseph in Matthew\'s genealogy. Davidic royal line.', key:'Davidic lineage', children:['achim'] },
  achim:   { name:'Achim',  emoji:'📜', era:'Post-Exile',     color:'#8B5CF6', ref:'Matt 1', desc:'Ancestor of Joseph. Part of the preserved royal line.', key:'Royal line to Jesus', children:['eliud'] },
  eliud:   { name:'Eliud',  emoji:'✨', era:'Post-Exile',     color:'#8B5CF6', ref:'Matt 1', desc:'Ancestor of Joseph in Matthew 1.', key:'Davidic ancestor', children:['eleazar2'] },
  eleazar2:{ name:'Eleazar', emoji:'📖', era:'Post-Exile',    color:'#8B5CF6', ref:'Matt 1', desc:'Ancestor of Joseph. Davidic line preserved through the centuries.', key:'Ancestor of Matthan', children:['matthan'] },
  matthan: { name:'Matthan', emoji:'🌟', era:'Post-Exile',    color:'#8B5CF6', ref:'Matt 1', desc:'Father of Jacob, grandfather of Joseph. Royal Davidic line approaching fulfillment.', key:'Grandfather of Joseph', children:['jacob2'] },
  jacob2:  { name:'Jacob',  emoji:'⭐', era:'NT',             color:'#EC4899', ref:'Matt 1', desc:'Father of Joseph, husband of Mary. The last recorded generation before the birth of Jesus.', key:'Father of Joseph', children:['joseph2'] },
  joseph2: { name:'Joseph', emoji:'🔨', era:'NT',             color:'#3B82F6', ref:'Matt 1, Luke 1', desc:'Carpenter from Nazareth. Betrothed to Mary. Visited by an angel twice. Adopted Jesus into the Davidic legal line. Fled to Egypt. Model of quiet faithfulness.', key:'Adoptive father of Jesus', children:['jesus'] },
  mary:    { name:'Mary',   emoji:'🌸', era:'NT',             color:'#EC4899', ref:'Luke 1-2', desc:'"Blessed among women." Conceived Jesus by the Holy Spirit. Sang the Magnificat. Stood at the cross. Present at Pentecost.', key:'Mother of Jesus; Theotokos', children:['jesus'] },
  jesus:   { name:'Jesus',  emoji:'✝️', era:'NT',             color:'#FCD34D', ref:'Matt 1 — Rev 22', desc:'"The Word became flesh." Fully God, fully man. Born in Bethlehem, raised in Nazareth. Baptized, tempted, transfigured. Crucified. Risen. Ascended. Coming again. Alpha and Omega.', key:'Son of God · Savior · King of Kings · Lord of Lords', children:[] },
}

const ERA_ORDER = ['Creation','Pre-Flood','Flood','Post-Flood','Patriarchs','Egypt','Exodus','Conquest','Judges','Judges/Kings','Kingdom','Divided Kingdom','Exile','Return','Post-Exile','NT']
const ERA_COLORS = { Creation:'#10B981','Pre-Flood':'#8B5CF6',Flood:'#3B82F6','Post-Flood':'#14B8A6',Patriarchs:'#F59E0B',Egypt:'#F97316',Exodus:'#EF4444',Conquest:'#EC4899',Judges:'#A855F7','Judges/Kings':'#F59E0B',Kingdom:'#F59E0B','Divided Kingdom':'#3B82F6',Exile:'#6B7280',Return:'#14B8A6','Post-Exile':'#8B5CF6',NT:'#FCD34D' }

export default function BibleFamilyTree() {
  const [selected, setSelected] = useState('jesus')
  const [era, setEra]           = useState('All')
  const [search, setSearch]     = useState('')
  const person = PEOPLE[selected]

  const allEras = [...new Set(Object.values(PEOPLE).map(p=>p.era))]
    .sort((a,b)=>ERA_ORDER.indexOf(a)-ERA_ORDER.indexOf(b))

  const filteredPeople = Object.entries(PEOPLE).filter(([id,p])=>{
    if (era!=='All' && p.era!==era) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const parents = Object.entries(PEOPLE).filter(([id,p])=>p.children?.includes(selected))
  const children = (person?.children||[]).map(id=>({id,p:PEOPLE[id]})).filter(x=>x.p)

  return (
    <div style={{background:'var(--bg)',minHeight:'100vh',fontFamily:'Poppins,sans-serif'}}>
      <div style={{background:'linear-gradient(135deg,#0F0F1A,#1A0A2E,#0A1A14)',padding:'48px 36px 36px',textAlign:'center'}}>
        <h1 style={{fontFamily:"'Baloo 2',cursive",fontSize:'clamp(2rem,5vw,3.2rem)',fontWeight:800,background:'linear-gradient(90deg,#FCD34D,#F9A8D4,#6EE7B7)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',marginBottom:8}}>🌳 Bible Family Tree</h1>
        <p style={{color:'rgba(255,255,255,.45)',fontSize:'.88rem',fontWeight:500}}>Every major Bible character — their lineage, their story, their place in God's plan. Click anyone to explore.</p>
      </div>

      <div style={{maxWidth:1060,margin:'0 auto',padding:'24px 20px',display:'grid',gridTemplateColumns:'280px 1fr',gap:20,alignItems:'start'}}>
        {/* Left: search + list */}
        <div>
          <input className="input-field" placeholder="Search people..." value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:10}} />
          <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:12}}>
            <button onClick={()=>setEra('All')} style={{fontSize:'.62rem',fontWeight:700,padding:'3px 8px',borderRadius:100,cursor:'pointer',border:`1px solid ${era==='All'?'var(--blue)':'var(--border)'}`,background:era==='All'?'var(--blue-bg)':'var(--surface)',color:era==='All'?'var(--blue)':'var(--ink3)'}}>All</button>
            {allEras.map(e=>{
              const c=ERA_COLORS[e]||'#6B7280'
              return <button key={e} onClick={()=>setEra(e)} style={{fontSize:'.6rem',fontWeight:700,padding:'3px 8px',borderRadius:100,cursor:'pointer',border:`1px solid ${era===e?c:'var(--border)'}`,background:era===e?c+'18':'var(--surface)',color:era===e?c:'var(--ink3)'}}>{e}</button>
            })}
          </div>
          <div style={{maxHeight:580,overflowY:'auto',display:'flex',flexDirection:'column',gap:5}}>
            {filteredPeople.map(([id,p])=>(
              <div key={id} onClick={()=>setSelected(id)} style={{borderRadius:12,border:`1.5px solid ${selected===id?p.color:'var(--border)'}`,padding:'9px 12px',cursor:'pointer',transition:'all .18s',background:selected===id?p.color+'10':'var(--surface)'}}>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <span style={{fontSize:'1.2rem'}}>{p.emoji}</span>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,color:selected===id?p.color:'var(--ink)',fontSize:'.86rem',lineHeight:1.2}}>{p.name}</div>
                    <div style={{fontSize:'.6rem',color:ERA_COLORS[p.era]||'var(--ink3)',fontWeight:600}}>{p.era}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: detail */}
        {person && (
          <div>
            {/* Parents */}
            {parents.length>0&&(
              <div style={{marginBottom:14}}>
                <div style={{fontSize:'.68rem',fontWeight:700,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Parents</div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {parents.map(([pid,pp])=>(
                    <div key={pid} onClick={()=>setSelected(pid)} style={{display:'flex',alignItems:'center',gap:6,background:'var(--surface)',borderRadius:12,border:`1.5px solid ${pp.color}44`,padding:'8px 12px',cursor:'pointer',transition:'all .2s'}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=pp.color}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=pp.color+'44'}}>
                      <span>{pp.emoji}</span><span style={{fontFamily:"'Baloo 2',cursive",fontWeight:700,color:pp.color,fontSize:'.82rem'}}>{pp.name}</span>
                    </div>
                  ))}
                </div>
                <div style={{textAlign:'center',fontSize:'1.2rem',color:'var(--ink3)',margin:'8px 0'}}>↓</div>
              </div>
            )}

            {/* Main card */}
            <div style={{background:'var(--surface)',borderRadius:24,border:`2px solid ${person.color}44`,overflow:'hidden',marginBottom:14}}>
              <div style={{background:`linear-gradient(135deg,${person.color}22,${person.color}08)`,padding:'28px 28px 20px'}}>
                <div style={{display:'flex',gap:14,alignItems:'flex-start',flexWrap:'wrap'}}>
                  <div style={{width:64,height:64,borderRadius:18,background:`${person.color}18`,border:`2px solid ${person.color}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.2rem',flexShrink:0}}>{person.emoji}</div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap',marginBottom:4}}>
                      <div style={{fontFamily:"'Baloo 2',cursive",fontSize:'1.6rem',fontWeight:800,color:'var(--ink)'}}>{person.name}</div>
                      <span style={{fontSize:'.66rem',fontWeight:800,padding:'3px 9px',borderRadius:100,background:(ERA_COLORS[person.era]||'#6B7280')+'18',color:ERA_COLORS[person.era]||'#6B7280'}}>{person.era}</span>
                      <span style={{fontSize:'.66rem',fontWeight:700,padding:'3px 9px',borderRadius:100,background:'var(--bg2)',color:'var(--blue)'}}>{person.ref}</span>
                    </div>
                    <div style={{fontSize:'.82rem',fontWeight:700,color:person.color,marginBottom:8}}>"{person.key}"</div>
                  </div>
                </div>
              </div>
              <div style={{padding:'18px 28px 24px'}}>
                <p style={{fontSize:'.9rem',color:'var(--ink2)',lineHeight:1.8,fontWeight:500,marginBottom:0}}>{person.desc}</p>
              </div>
            </div>

            {/* Children */}
            {children.length>0&&(
              <div>
                <div style={{textAlign:'center',fontSize:'1.2rem',color:'var(--ink3)',marginBottom:8}}>↓</div>
                <div style={{fontSize:'.68rem',fontWeight:700,color:'var(--ink3)',textTransform:'uppercase',letterSpacing:.5,marginBottom:8}}>Children</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))',gap:9}}>
                  {children.map(({id,p:cp})=>(
                    <div key={id} onClick={()=>setSelected(id)} style={{background:'var(--surface)',borderRadius:14,border:`1.5px solid ${cp.color}44`,padding:'12px',cursor:'pointer',textAlign:'center',transition:'all .2s'}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=cp.color;e.currentTarget.style.boxShadow=`0 4px 16px ${cp.color}20`}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=cp.color+'44';e.currentTarget.style.boxShadow='none'}}>
                      <div style={{fontSize:'1.5rem',marginBottom:4}}>{cp.emoji}</div>
                      <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,color:cp.color,fontSize:'.8rem',lineHeight:1.2}}>{cp.name}</div>
                      <div style={{fontSize:'.58rem',color:'var(--ink3)',fontWeight:500,marginTop:2}}>{cp.era}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
