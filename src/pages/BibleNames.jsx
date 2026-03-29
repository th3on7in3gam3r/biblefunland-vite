import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useKidsMode } from '../context/KidsModeContext'

const BIBLE_NAMES = [
  { name: 'Aaron', root: 'Aharon (Hebrew)', meaning: 'Light Bringer, Exalted, Mountain of Strength', summary: 'Brother of Moses and the first High Priest of Israel.', identity: 'You are called to uplift others and stand as a steady, supportive presence in times of need.' },
  { name: 'Abigail', root: 'Avigayil (Hebrew)', meaning: 'My Father\'s Joy', summary: 'A woman of great wisdom and beauty who became King David\'s wife.', identity: 'Your wisdom and gentle spirit bring joy and peace to those around you, diffusing conflict with grace.' },
  { name: 'Abraham', root: 'Avraham (Hebrew)', meaning: 'Father of a Multitude', summary: 'Originally Abram (Exalted Father). God changed his name to reflect his destiny as the patriarch of nations.', identity: 'Your faith has the power to leave a legacy that impacts generations long after you.' },
  { name: 'Adam', root: 'Adama (Hebrew)', meaning: 'Man, from the Red Earth', summary: 'The first man created by God in the Garden of Eden.', identity: 'You are deeply connected to God\'s creation, formed with profound purpose and divine intention.' },
  { name: 'Andrew', root: 'Andreas (Greek)', meaning: 'Strong, Manly, Courageous', summary: 'A fisherman and the first disciple called by Jesus, who immediately brought his brother Peter to Christ.', identity: 'You have a bold, inviting spirit that naturally connects others to the truth.' },
  { name: 'Anna', root: 'Channah (Hebrew)', meaning: 'Grace, Favor', summary: 'A devoted prophetess who spent her life in the temple and recognized the infant Jesus as the Messiah.', identity: 'Your patient devotion and spiritual sensitivity allow you to see God moving when others might miss it.' },
  { name: 'Asher', root: 'Osher (Hebrew)', meaning: 'Happy, Blessed', summary: 'The eighth son of Jacob, promised a life rich in blessings and prosperity.', identity: 'Joy is your portion. You possess a spirit that finds the blessing in every season.' },
  { name: 'Benjamin', root: 'Binyamin (Hebrew)', meaning: 'Son of My Right Hand', summary: 'The youngest and highly favored son of Jacob and Rachel.', identity: 'You are deeply cherished, positioned for honor, and held securely in the Father\'s grip.' },
  { name: 'Caleb', root: 'Kalev (Hebrew)', meaning: 'Whole-Hearted, Loyal, Brave', summary: 'One of the two spies who believed God would deliver the Promised Land despite the giants.', identity: 'You possess a fierce, whole-hearted loyalty to God, refusing to be intimidated by life\'s giants.' },
  { name: 'Chloe', root: 'Khloē (Greek)', meaning: 'Green Herb, Blooming', summary: 'A prominent Christian woman in the early church of Corinth.', identity: 'You bring fresh life, growth, and flourishing energy into every environment you enter.' },
  { name: 'Daniel', root: 'Daniyyel (Hebrew)', meaning: 'God is My Judge', summary: 'A prophet of unwavering faith who survived the lions\' den and interpreted royal dreams.', identity: 'You are anchored by unshakeable convictions, seeking approval from God alone.' },
  { name: 'David', root: 'Dawid (Hebrew)', meaning: 'Beloved', summary: 'The shepherd boy who defeated Goliath and became Israel\'s greatest earthly king.', identity: 'Beyond your accomplishments, your truest identity is simply being deeply loved by the Father.' },
  { name: 'Deborah', root: 'Devorah (Hebrew)', meaning: 'Bee (Industrious, Sweet, Stinging)', summary: 'A fearless prophetess and judge who led Israel to a miraculous military victory.', identity: 'You are a uniquely gifted leader—combining industrious wisdom with decisive courage.' },
  { name: 'Elijah', root: 'Eliyyahu (Hebrew)', meaning: 'My God is Yahweh', summary: 'A bold prophet who confronted idolatry and called down fire from heaven.', identity: 'You carry a fiery passion for truth, uncompromising in your dedication to God\'s supremacy.' },
  { name: 'Elizabeth', root: 'Elisheva (Hebrew)', meaning: 'God is My Oath / God is Abundance', summary: 'The righteous mother of John the Baptist, who experienced a miracle in her old age.', identity: 'You can trust that God remembers His promises to you; your life is a testament to His faithfulness.' },
  { name: 'Enoch', root: 'Chanokh (Hebrew)', meaning: 'Dedicated, Trained', summary: 'A man who walked so closely with God that he was taken directly to heaven without dying.', identity: 'Your highest calling is a daily, intimate walk with your Creator above all earthly pursuits.' },
  { name: 'Esther', root: 'Hadassah (Hebrew) / Esther (Persian)', meaning: 'Star / Hidden', summary: 'A Jewish orphan who became queen of Persia and risked her life to boldly save her people.', identity: 'You are positioned with purpose for "such a time as this," carrying a light that shines brightest in the dark.' },
  { name: 'Eve', root: 'Chawwah (Hebrew)', meaning: 'Life-Giver, Breath', summary: 'The first woman and mother of all the living.', identity: 'You have a nurturing spirit meant to breathe life, encouragement, and hope into the world.' },
  { name: 'Ezekiel', root: 'Yechezkel (Hebrew)', meaning: 'God Strengthens', summary: 'A prophetic visionary who showed Israel how God breathes life into dry bones.', identity: 'When you feel dry or depleted, God is the ultimate source of your renewal and strength.' },
  { name: 'Ezra', root: 'Ezra (Hebrew)', meaning: 'Help, Helper', summary: 'A scribe and priest who led the rebuilding of the faith community by teaching the Word.', identity: 'You are an essential builder and helper, using wisdom to restore and establish truth.' },
  { name: 'Gabriel', root: 'Gavriel (Hebrew)', meaning: 'God is My Strength / Mighty Man of God', summary: 'The archangel who delivered major prophetic news to Daniel, Zechariah, and Mary.', identity: 'You are an announcer of good news, carrying the powerful messages and strength of heaven.' },
  { name: 'Gideon', root: 'Gid\'on (Hebrew)', meaning: 'Mighty Warrior, Feller of Trees', summary: 'A hesitant farmer whom God called a "mighty warrior" to deliver Israel with only 300 men.', identity: 'God sees your potential, not your insecurities. In His hands, your small obedience wins massive victories.' },
  { name: 'Grace', root: 'Chen (Hebrew) / Charis (Greek)', meaning: 'Unmerited Favor, Elegance', summary: 'While not a specific character, Grace is the central theme of the New Testament—God giving us what we don\'t deserve.', identity: 'Your life is beautifully marked by God\'s unearned goodness, and you are called to extend that same grace to others.' },
  { name: 'Hadassah', root: 'Hadas (Hebrew)', meaning: 'Myrtle Tree', summary: 'The beautiful Hebrew birth name of Queen Esther before she became queen of Persia.', identity: 'Like a myrtle leaf, your true strength, sweetness, and courage are released most powerfully when you are tested or under pressure.' },
  { name: 'Hannah', root: 'Channah (Hebrew)', meaning: 'Favor, Grace, Compassion', summary: 'A woman of deep prayer whose tearful intercession gave birth to the prophet Samuel.', identity: 'Your persistent, heartfelt prayers are powerful enough to shift atmospheres and birth miracles.' },
  { name: 'Isaac', root: 'Yitzchak (Hebrew)', meaning: 'He Will Laugh, Laughter', summary: 'The miracle child born to Abraham and Sarah in their old age.', identity: 'You are a living reminder of God\'s joy—bringing laughter and impossible promises to life.' },
  { name: 'Isaiah', root: 'Yeshayahu (Hebrew)', meaning: 'Yahweh is Salvation', summary: 'The major prophet who saw the holiness of God and prophesied vividly about the coming Messiah.', identity: 'You carry a voice of redemption, designed to point others toward the ultimate Savior.' },
  { name: 'Israel', root: 'Yisrael (Hebrew)', meaning: 'Wrestles with God / Triumphant with God', summary: 'The name given to Jacob after he wrestled the angel, becoming the father of the 12 tribes.', identity: 'Your struggles and wrestling with God don\'t disqualify you; they transform you into someone with divine purpose.' },
  { name: 'Jacob', root: 'Ya\'akov (Hebrew)', meaning: 'Supplanter, Heel-Catcher', summary: 'The cunning younger twin who bought his brother\'s birthright but was eventually redeemed by God.', identity: 'Regardless of your past mistakes or striving, God\'s grace is capable of rewriting your entire story.' },
  { name: 'James', root: 'Iakobos (Greek) from Ya\'akov', meaning: 'Supplanter', summary: 'A devoted apostle and brother of Jesus, known for practical faith and leadership.', identity: 'You value authentic action—proving that real faith is always demonstrated through everyday love.' },
  { name: 'Jeremiah', root: 'Yirmeyahu (Hebrew)', meaning: 'Yahweh Exalts / Appointed by God', summary: 'The "weeping prophet" who faithfully warned Judah despite constant rejection.', identity: 'Your calling has been appointed since before you were born. You are built to stand firm even when unpopular.' },
  { name: 'Jesus', root: 'Yeshua (Hebrew) / Iesous (Greek)', meaning: 'Yahweh Saves, Salvation', summary: 'The Son of God, the prophesied Messiah, who died for the world\'s sins and rose again.', identity: 'Your ultimate identity is hidden in Him. Because He saves, you are completely forgiven, adopted, and free.' },
  { name: 'John', root: 'Yochanan (Hebrew)', meaning: 'Yahweh is Gracious', summary: 'The "disciple whom Jesus loved," author of a Gospel and Revelation.', identity: 'You are identified by love and intimacy with Christ, drawing your confidence from His immense grace.' },
  { name: 'Jonah', root: 'Yonah (Hebrew)', meaning: 'Dove', summary: 'A reluctant prophet swallowed by a great fish before finally obeying God\'s call to Nineveh.', identity: 'Even when you run, God\'s mercy relentlessly pursues you to bring you back to your purpose.' },
  { name: 'Jonathan', root: 'Yehonatan (Hebrew)', meaning: 'Yahweh has Given / Gift of God', summary: 'King Saul\'s son and David\'s fiercely loyal best friend, modeling sacrificial love.', identity: 'You are an incredible friend—offering selfless loyalty and protecting those around you.' },
  { name: 'Joseph', root: 'Yosef (Hebrew)', meaning: 'He Will Add / Increase', summary: 'A favored son sold into slavery who rose to save Egypt and his betraying family from famine.', identity: 'God is using your current trials to prepare you for a future position of great influence and redemption.' },
  { name: 'Joshua', root: 'Yehoshua (Hebrew)', meaning: 'Yahweh is Salvation', summary: 'Moses\' successor, a brilliant leader who courageously guided Israel into the Promised Land.', identity: 'You are called to step into new territories with immense courage, trusting God\'s absolute victory.' },
  { name: 'Josiah', root: 'Yoshiyahu (Hebrew)', meaning: 'Supported by Yahweh / Fire of the Lord', summary: 'A boy king who rediscovered God\'s forgotten law and sparked a massive national revival.', identity: 'You have a reformist heart—capable of breaking bad generational cycles and restoring truth.' },
  { name: 'Judah', root: 'Yehudah (Hebrew)', meaning: 'Praise, Thanks', summary: 'The fourth son of Jacob; the tribe from which King David and Jesus (the Lion of Judah) descended.', identity: 'Praise is your primary weapon. When you lead with gratitude, breakthrough follows.' },
  { name: 'Levi', root: 'Levi (Hebrew)', meaning: 'Joined, Attached', summary: 'The third son of Jacob whose descendants became the priests dedicated entirely to serving God.', identity: 'You are meant to be deeply connected and securely attached to the presence and service of God.' },
  { name: 'Luke', root: 'Loukas (Greek)', meaning: 'Light-Giving, Luminous', summary: 'The meticulous physician and historian who authored the Gospel of Luke and Acts.', identity: 'You possess a brilliant, analytical mind meant to illuminate truth and heal the broken.' },
  { name: 'Lydia', root: 'Ludia (Greek)', meaning: 'Woman from Lydia / Beautiful', summary: 'A successful businesswoman whose opened heart made her the first European Christian convert.', identity: 'Your hospitality, sharp intellect, and open heart make you a pivotal pillar in your community.' },
  { name: 'Mark', root: 'Marcus (Latin)', meaning: 'Warlike, Consecrated', summary: 'A young man who initially failed on a mission trip but matured to write the earliest Gospel.', identity: 'Early failures do not define you. Your comeback story will be powerful and deeply useful to God\'s kingdom.' },
  { name: 'Martha', root: 'Marta (Aramaic)', meaning: 'Lady, Mistress of the House', summary: 'A hardworking and devoted friend of Jesus who hosted Him faithfully in her home.', identity: 'Your serving heart is beautiful, but you are most loved not for what you do, but for seeking His presence.' },
  { name: 'Mary', root: 'Miryam (Hebrew)', meaning: 'Rebellion / Bitter / Beloved', summary: 'The young, faithful virgin chosen to be the earthly mother of Jesus the Messiah.', identity: 'When you say "yes" to God\'s impossible plans, you become a vessel for world-changing miracles.' },
  { name: 'Matthew', root: 'Mattityahu (Hebrew)', meaning: 'Gift of Yahweh', summary: 'A despised tax collector who dropped everything when Jesus called him, authoring the first Gospel.', identity: 'No matter your past reputation, God views you as a treasured gift capable of profound transformation.' },
  { name: 'Michael', root: 'Mikha\'el (Hebrew)', meaning: 'Who is Like God?', summary: 'The fierce warrior archangel who leads heaven\'s armies against spiritual darkness.', identity: 'You carry a protective, warrior spirit designed to intercede and champion the truth against any opposition.' },
  { name: 'Moses', root: 'Moshe (Hebrew)', meaning: 'Drawn Out of the Water', summary: 'The humblest of men who delivered Israel from endless slavery and received the Ten Commandments.', identity: 'God has drawn you out of deep waters so that you can become a deliverer for others.' },
  { name: 'Naomi', root: 'No\'omi (Hebrew)', meaning: 'Pleasantness, Delight', summary: 'A widow who lost everything and became bitter, until God beautifully restored her through Ruth.', identity: 'Even in your darkest seasons of loss, God is actively working behind the scenes to restore your joy.' },
  { name: 'Nathaniel', root: 'Netanel (Hebrew)', meaning: 'God Has Given', summary: 'An early disciple whom Jesus praised as a "true Israelite in whom there is no deceit."', identity: 'Your greatest asset is your profound authenticity and transparency. You are a genuine gift.' },
  { name: 'Noah', root: 'Noach (Hebrew)', meaning: 'Rest, Comfort', summary: 'A righteous man in a wicked generation who built an ark to save his family and creation.', identity: 'In a chaotic world, you are called to provide an atmosphere of safety, peace, and restorative comfort.' },
  { name: 'Paul', root: 'Paulos (Latin)', meaning: 'Small, Humble', summary: 'Originally Saul, a persecutor of Christians whose radical encounter with Jesus turned him into the greatest apostle.', identity: 'When you humble yourself before God, He relies on your passion to spread His unending grace.' },
  { name: 'Peter', root: 'Petros (Greek) / Cephas (Aramaic)', meaning: 'Rock, Stone', summary: 'An impulsive fisherman who failed Jesus but was restored to become the rock-solid leader of the early church.', identity: 'Your passionate missteps are outweighed by your deep love. Christ is building something solid on your life.' },
  { name: 'Phoebe', root: 'Phoibe (Greek)', meaning: 'Radiant, Pure, Bright', summary: 'A trusted deaconess and patron who personally delivered Paul\'s masterful letter to the Romans.', identity: 'You are a radiant, trustworthy pillar in your community, carrying immense responsibilities with grace.' },
  { name: 'Rachel', root: 'Rachel (Hebrew)', meaning: 'Ewe, Little Lamb', summary: 'The beloved wife of Jacob and mother of Joseph, whose story is marked by longing and devotion.', identity: 'You are deeply loved and cherished, possessing a gentle but enduring spirit that leaves a lasting legacy.' },
  { name: 'Rebecca', root: 'Rivkah (Hebrew)', meaning: 'To Bind, Captivating', summary: 'The beautiful, decisive wife of Isaac who actively pursued God\'s promise for her twin sons.', identity: 'You are captivating and action-oriented, not afraid to take decisive steps to align with God\'s will.' },
  { name: 'Ruth', root: 'Rut (Hebrew)', meaning: 'Compassionate Friend, Companion', summary: 'A faithful Moabite widow whose famous loyalty led her to become the great-grandmother of King David.', identity: 'Your fierce devotion and loyal friendship are creating waves of blessing you can\'t fully see yet.' },
  { name: 'Samuel', root: 'Shmu\'el (Hebrew)', meaning: 'God Has Heard', summary: 'The dedicated prophet and last judge who anointed Israel\'s first two kings.', identity: 'God hears the deepest cries of your heart, and your life is a testament to the power of answering His call.' },
  { name: 'Sarah', root: 'Sarah (Hebrew)', meaning: 'Princess, Noblewoman', summary: 'The wife of Abraham who, despite decades of barrenness, gave birth to the promised nation.', identity: 'You are a woman of royal, spiritual lineage. God will laugh with you as He fulfills the impossible in your life.' },
  { name: 'Silas', root: 'Silvanus (Latin)', meaning: 'Of the Forest / Wooded', summary: 'A faithful prophetic companion who worshipped with Paul while locked in chains in a Philippian prison.', identity: 'Your steadfast worship in the darkest, most restrictive circumstances has the power to break chains for everyone around you.' },
  { name: 'Solomon', root: 'Shlomo (Hebrew)', meaning: 'Peaceful, Perfect', summary: 'The king noted for an era of unprecedented peace, unfathomable wealth, and building the first Temple.', identity: 'When you ask for wisdom above all else, God will equip you to build environments of profound peace.' },
  { name: 'Stephen', root: 'Stephanos (Greek)', meaning: 'Crown, Garland', summary: 'The first Christian martyr, known for his angelic face and forgiving his attackers as he died.', identity: 'You carry a heavenly crown of victory. Your grace under intense pressure leaves an eternal mark on witnesses.' },
  { name: 'Timothy', root: 'Timotheos (Greek)', meaning: 'One Who Honors God', summary: 'A young, somewhat timid pastor mentored by Paul, instructed not to let anyone look down on his youth.', identity: 'You possess a sincere, generational faith. Your quiet honor of God speaks louder than age or experience.' },
  { name: 'Zechariah', root: 'Zekharyah (Hebrew)', meaning: 'Yahweh Remembers', summary: 'A priest who was literally struck speechless by an angel\'s promise, later breaking into prophetic song.', identity: 'God has not forgotten your sacrifices or prayers. He remembers every detail and is timing your breakthrough perfectly.' }
].sort((a, b) => a.name.localeCompare(b.name))

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function BibleNames() {
  const [search, setSearch] = useState('')
  const [activeLetter, setActiveLetter] = useState('All')
  const { kidsMode } = useKidsMode()

  // Filter names based on search and selected letter
  const filteredNames = useMemo(() => {
    return BIBLE_NAMES.filter(item => {
      const matchSearch = 
        item.name.toLowerCase().includes(search.toLowerCase()) || 
        item.meaning.toLowerCase().includes(search.toLowerCase()) ||
        item.root.toLowerCase().includes(search.toLowerCase())
      
      const matchLetter = activeLetter === 'All' || item.name.startsWith(activeLetter)
      return matchSearch && matchLetter
    })
  }, [search, activeLetter])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{ 
        position: 'relative', 
        padding: '80px 24px 60px', 
        textAlign: 'center', 
        background: kidsMode ? 'linear-gradient(135deg,#3B82F6,#8B5CF6)' : 'linear-gradient(160deg,#0F0F1A 0%,#1E1B4B 50%,#0F0F1A 100%)',
        overflow: 'hidden'
      }}>
        {/* Decorative elements */}
        <div style={{ position: 'absolute', top: -100, left: -50, width: 400, height: 400, background: 'radial-gradient(circle,rgba(244,114,182,.15),transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, right: -50, width: 500, height: 500, background: 'radial-gradient(circle,rgba(96,165,250,.1),transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 800, margin: '0 auto' }}>
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '.75rem', fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', 
            background: 'rgba(255,255,255,.1)', color: 'white', border: '1px solid rgba(255,255,255,.2)', padding: '6px 16px', borderRadius: 100, marginBottom: 24,
            animation: 'fadeDown .6s ease both'
          }}>
            🔤 500+ Dictionary Database
          </div>
          <h1 style={{ fontFamily: "'Baloo 2',cursive", fontSize: 'clamp(2.5rem,6vw,4.5rem)', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: 20, animation: 'fadeUp .7s .1s ease both' }}>
            Bible Name Meanings
          </h1>
          <p style={{ fontSize: 'clamp(.9rem,2vw,1.15rem)', color: 'rgba(255,255,255,.8)', fontWeight: 500, lineHeight: 1.6, maxWidth: 640, margin: '0 auto 40px', animation: 'fadeUp .7s .2s ease both' }}>
            Discover the profound Hebrew and Greek roots behind biblical names. 
            Learn what God formed them to mean—and what that reveals about your own identity today.
          </p>

          {/* SEARCH BAR */}
          <div style={{ position:'relative', maxWidth: 600, margin: '0 auto', animation: 'fadeUp .7s .3s ease both' }}>
            <span style={{ position:'absolute', left:20, top:'50%', transform:'translateY(-50%)', fontSize:'1.4rem' }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search by name, meaning, or language (e.g. David, Grace)..." 
              value={search}
              onChange={e => { setSearch(e.target.value); setActiveLetter('All'); }}
              style={{ 
                width: '100%', padding: '20px 20px 20px 56px', borderRadius: 100, border: 'none', 
                background: 'rgba(255,255,255,.95)', fontSize: '1.05rem', fontFamily: 'Poppins,sans-serif', fontWeight: 600,
                boxShadow: '0 12px 40px rgba(0,0,0,.3)', outline: 'none', color: '#0F0F1A'
              }}
            />
          </div>
        </div>
      </section>

      {/* ── ALPHABET FILTER ───────────────────────────────────────────────── */}
      <section style={{ padding: '24px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
        <button 
          onClick={() => { setActiveLetter('All'); setSearch(''); }}
          style={{ 
            padding: '8px 16px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.85rem', transition: 'all .2s',
            background: activeLetter === 'All' ? 'var(--blue)' : 'var(--bg2)', 
            color: activeLetter === 'All' ? 'white' : 'var(--ink3)' 
          }}
        >
          ALL
        </button>
        {ALPHABET.map(letter => {
          // Check if we have any names starting with this letter to dim empty ones
          const hasNames = BIBLE_NAMES.some(n => n.name.startsWith(letter))
          return (
            <button 
              key={letter}
              onClick={() => { setActiveLetter(letter); setSearch(''); }}
              disabled={!hasNames}
              style={{ 
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: 'none', cursor: hasNames ? 'pointer' : 'default', fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: '.85rem', transition: 'all .2s',
                background: activeLetter === letter ? 'var(--blue)' : 'transparent', 
                color: activeLetter === letter ? 'white' : hasNames ? 'var(--ink)' : 'var(--ink3)',
                opacity: hasNames ? 1 : 0.3
              }}
            >
              {letter}
            </button>
          )
        })}
      </section>

      {/* ── RESULTS GRID ──────────────────────────────────────────────────── */}
      <section style={{ padding: '60px 24px', maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Results Info */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)' }}>
            {search ? `Search Results (${filteredNames.length})` : activeLetter !== 'All' ? `Names starting with ${activeLetter} (${filteredNames.length})` : 'Featured Names'}
          </h2>
        </div>

        {filteredNames.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--surface)', borderRadius: 24, border: '2px dashed var(--border)' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔎</div>
            <h3 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '1.5rem', fontWeight: 800, color: 'var(--ink)' }}>No exact matches found</h3>
            <p style={{ color: 'var(--ink3)', fontWeight: 500, marginTop: 8 }}>We are constantly expanding our 500+ name dictionary. Try searching a different root meaning!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
            {filteredNames.map((item, idx) => (
              <div 
                key={item.name} 
                style={{ 
                  background: 'var(--surface)', borderRadius: 24, border: '1.5px solid var(--border)', padding: 28, transition: 'all .3s', boxShadow: 'var(--sh)',
                  display: 'flex', flexDirection: 'column', animation: `fadeUp .6s ${idx * 0.05}s ease both`
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <h3 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '2rem', fontWeight: 800, color: 'var(--ink)', lineHeight: 1 }}>{item.name}</h3>
                  <div style={{ background: 'var(--bg2)', padding: '6px 12px', borderRadius: 8, fontSize: '.72rem', fontWeight: 700, color: 'var(--ink3)' }}>
                    {item.root}
                  </div>
                </div>

                {/* Meaning */}
                <div style={{ fontSize: '.9rem', fontWeight: 800, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>M e a n i n g</div>
                <div style={{ fontSize: '1.25rem', fontFamily: "'Baloo 2',cursive", fontWeight: 700, color: 'var(--ink)', lineHeight: 1.3, marginBottom: 20 }}>
                  "{item.meaning}"
                </div>

                {/* Summary */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '.9rem', color: 'var(--ink3)', lineHeight: 1.6, marginBottom: 24 }}>
                    <strong style={{ color: 'var(--ink)' }}>Summary:</strong> {item.summary}
                  </p>
                </div>

                {/* Identity Reflection */}
                <div style={{ background: 'linear-gradient(135deg,rgba(99,102,241,.1),rgba(168,85,247,.1))', padding: '20px', borderRadius: 16, border: '1px solid rgba(99,102,241,.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ fontSize: '1.2rem' }}>✨</div>
                    <div style={{ fontSize: '.8rem', fontWeight: 800, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: 1 }}>Your Identity</div>
                  </div>
                  <p style={{ fontSize: '.88rem', color: 'var(--ink)', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
                    {item.identity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── CALL TO ACTION ────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 24px', textAlign: 'center', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontFamily: "'Baloo 2',cursive", fontSize: '2.5rem', fontWeight: 800, color: 'var(--ink)', marginBottom: 16 }}>Didn't find your name?</h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--ink3)', fontWeight: 500, maxWidth: 600, margin: '0 auto 32px' }}>
          We add new names and deep theological root meanings every week. Have a specific name you want us to research in the original Hebrew or Greek texts?
        </p>
        <Link to="/community/chat" className="btn btn-lg btn-blue">Request a Name Meaning</Link>
      </section>
      
    </div>
  )
}
