import { useState } from 'react';

// Public domain Strong's data — key words
const HEBREW = [
  {
    word: 'אַהֲבָה',
    transliteration: 'Ahavah',
    english: 'Love',
    strongs: 'H160',
    meaning:
      'Unconditional, covenant love. The love of God for His people — steadfast regardless of merit.',
    verses: ['Deut 7:9', 'Jer 31:3', 'Song 8:6'],
    root: 'From אָהַב (ahav) — to love, desire, breathe after',
    audio: 'ah-hah-VAH',
    examples: [
      { ref: 'Deut 6:5', text: 'Love the Lord your God with all your heart' },
      { ref: 'Hos 11:4', text: 'I led them with cords of human kindness, with ties of love' },
    ],
  },
  {
    word: 'חֶסֶד',
    transliteration: 'Hesed',
    english: 'Lovingkindness / Mercy',
    strongs: 'H2617',
    meaning:
      "Covenant faithfulness. God's loyal, steadfast love that never gives up. Often translated lovingkindness, mercy, or steadfast love — but no English word fully captures it.",
    verses: ['Ps 136', 'Lam 3:22-23', 'Mic 7:18'],
    root: 'Related to חָסָה (hasah) — to take refuge, flee for protection',
    audio: 'KHEH-sed',
    examples: [
      { ref: 'Lam 3:22', text: "Because of the Lord's great love we are not consumed" },
      {
        ref: 'Ps 103:8',
        text: 'The Lord is compassionate and gracious, slow to anger, abounding in hesed',
      },
    ],
  },
  {
    word: 'שָׁלוֹם',
    transliteration: 'Shalom',
    english: 'Peace',
    strongs: 'H7965',
    meaning:
      'Far more than absence of conflict. Shalom means completeness, wholeness, prosperity, harmony, and wellbeing — in body, soul, community, and with God.',
    verses: ['Num 6:24-26', 'Isa 26:3', 'Jer 29:11'],
    root: 'From שָׁלֵם (shalem) — to be complete, whole, safe',
    audio: 'sha-LOME',
    examples: [
      { ref: 'Num 6:26', text: 'The Lord turn his face toward you and give you shalom' },
      { ref: 'Isa 26:3', text: 'You will keep in perfect shalom him whose mind is stayed on you' },
    ],
  },
  {
    word: 'אֱמוּנָה',
    transliteration: 'Emunah',
    english: 'Faith / Faithfulness',
    strongs: 'H530',
    meaning:
      'Steadfastness, firmness, trustworthiness. Emunah is not merely belief — it is reliable, consistent, trustworthy behavior. The righteous live by this quality.',
    verses: ['Hab 2:4', 'Lam 3:23', 'Ps 119:90'],
    root: 'From אָמַן (aman) — to support, confirm, be faithful (root of "Amen")',
    audio: 'eh-moo-NAH',
    examples: [
      { ref: 'Hab 2:4', text: 'The righteous person shall live by his emunah' },
      { ref: 'Lam 3:23', text: 'Great is your emunah (faithfulness)' },
    ],
  },
  {
    word: 'קָדוֹשׁ',
    transliteration: 'Kadosh',
    english: 'Holy / Set Apart',
    strongs: 'H6918',
    meaning:
      "Separated, consecrated, set apart for God's purposes. Holiness is God's most fundamental attribute — blazing moral purity combined with transcendent otherness.",
    verses: ['Isa 6:3', 'Lev 11:44', 'Ps 99:5'],
    root: 'From קָדַשׁ (qadash) — to be separate, consecrated',
    audio: 'kah-DOSH',
    examples: [
      {
        ref: 'Isa 6:3',
        text: 'Holy, holy, holy is the Lord Almighty — the whole earth is full of His glory',
      },
      { ref: 'Lev 11:45', text: 'Be holy, because I am holy' },
    ],
  },
  {
    word: 'גָּאַל',
    transliteration: 'Gaal',
    english: 'Redeem / Kinsman-Redeemer',
    strongs: 'H1350',
    meaning:
      'The right and responsibility of a close relative to buy back family property or rescue a family member from servitude. Jesus is our ultimate Goel — our kinsman-redeemer.',
    verses: ['Ruth 3:9', 'Job 19:25', 'Isa 43:1'],
    root: 'Legal concept of next-of-kin obligation to rescue',
    audio: 'gah-AL',
    examples: [
      { ref: 'Job 19:25', text: 'I know that my Redeemer (Goel) lives' },
      { ref: 'Isa 43:1', text: 'Fear not, for I have redeemed you; I have called you by name' },
    ],
  },
  {
    word: 'נְבִיא',
    transliteration: 'Nabi',
    english: 'Prophet',
    strongs: 'H5030',
    meaning:
      "One who speaks for another — a spokesman for God. Prophets did not primarily predict the future; they declared God's word for their present time and called people back to covenant faithfulness.",
    verses: ['Jer 1:5', 'Amos 3:7', 'Isa 61:1'],
    root: 'From נָבָא (naba) — to prophesy, speak by divine inspiration',
    audio: 'nah-VEE',
    examples: [
      {
        ref: 'Amos 3:7',
        text: 'Surely the Lord does nothing without revealing it to his servants the prophets',
      },
      {
        ref: 'Jer 1:5',
        text: 'Before you were born I set you apart; I appointed you as a prophet',
      },
    ],
  },
  {
    word: 'כָּבוֹד',
    transliteration: 'Kavod',
    english: 'Glory / Weight',
    strongs: 'H3519',
    meaning:
      'Literally "heaviness" or "weight." God\'s glory is His manifested presence — the tangible reality of His greatness. It fills the Temple, blinds the prophets, and one day will fill the earth.',
    verses: ['Exo 33:18', 'Isa 6:3', 'Ps 29:3'],
    root: 'From כָּבֵד (kaved) — to be heavy, honored, weighty',
    audio: 'kah-VODE',
    examples: [
      { ref: 'Exo 33:18', text: 'Moses said: "Show me your glory (kavod)"' },
      { ref: 'Isa 6:3', text: 'The whole earth is full of his kavod' },
    ],
  },
];

const GREEK = [
  {
    word: 'Ἀγάπη',
    transliteration: 'Agape',
    english: 'Unconditional Love',
    strongs: 'G26',
    meaning:
      'The highest form of love — selfless, sacrificial, unconditional. Not based on the merit of the receiver. This is the word used in John 3:16 ("God so loved") and 1 Corinthians 13.',
    verses: ['John 3:16', '1 Cor 13:4-7', '1 John 4:8'],
    root: 'From ἀγαπάω (agapao) — to love, esteem, delight in',
    audio: 'ah-GAH-pay',
    examples: [
      { ref: 'John 3:16', text: 'God so loved (agapao) the world...' },
      { ref: '1 John 4:8', text: 'Whoever does not love does not know God, because God IS agape' },
    ],
  },
  {
    word: 'Φιλία',
    transliteration: 'Philia',
    english: 'Brotherly Love / Friendship',
    strongs: 'G5373',
    meaning:
      'The warm affection between friends, companions, and family. Less comprehensive than agape — more about mutual enjoyment and fondness. Philadelphia = "city of brotherly love."',
    verses: ['John 11:36', 'Rom 12:10', 'Jas 4:4'],
    root: 'From φιλέω (phileo) — to be fond of, have affection for',
    audio: 'fee-LEE-ah',
    examples: [
      {
        ref: 'John 11:36',
        text: 'The Jews said, "See how he loved (phileo) him!" [about Lazarus]',
      },
      { ref: 'Rom 12:10', text: 'Be devoted to one another in brotherly love (philadelphia)' },
    ],
  },
  {
    word: 'Χάρις',
    transliteration: 'Charis',
    english: 'Grace',
    strongs: 'G5485',
    meaning:
      "Unmerited favor. The free, undeserved gift of God's goodness toward sinners. Charis is the entire basis of salvation — nothing earned, nothing owed, everything given freely.",
    verses: ['Eph 2:8', '2 Cor 12:9', 'John 1:14'],
    root: 'From χαίρω (chairo) — to rejoice, be glad',
    audio: 'KHA-rees',
    examples: [
      { ref: 'Eph 2:8', text: 'For it is by charis you have been saved, through faith' },
      {
        ref: '2 Cor 12:9',
        text: 'My charis is sufficient for you, for my power is made perfect in weakness',
      },
    ],
  },
  {
    word: 'Πίστις',
    transliteration: 'Pistis',
    english: 'Faith / Trust',
    strongs: 'G4102',
    meaning:
      'Belief, trust, confidence — but with the sense of reliability and faithfulness. Not mere intellectual assent but active trust in a person. The same word can mean both "faith" and "faithfulness."',
    verses: ['Heb 11:1', 'Rom 1:17', 'Gal 2:20'],
    root: 'From πείθω (peitho) — to persuade, trust, obey',
    audio: 'PIS-tis',
    examples: [
      { ref: 'Heb 11:1', text: 'Now pistis is the substance of things hoped for' },
      { ref: 'Gal 2:20', text: 'I live by pistis in the Son of God who loved me' },
    ],
  },
  {
    word: 'Λόγος',
    transliteration: 'Logos',
    english: 'Word / Reason / Logic',
    strongs: 'G3056',
    meaning:
      'The divine rational principle behind creation. John opens his Gospel with "In the beginning was the Logos" — applying the Greek philosophical concept of cosmic reason to Jesus. The Word that was with God and was God.',
    verses: ['John 1:1', 'John 1:14', 'Rev 19:13'],
    root: 'From λέγω (lego) — to speak, say, lay out',
    audio: 'LOH-gos',
    examples: [
      {
        ref: 'John 1:1',
        text: 'In the beginning was the Logos, and the Logos was with God, and the Logos was God',
      },
      { ref: 'John 1:14', text: 'The Logos became flesh and made his dwelling among us' },
    ],
  },
  {
    word: 'Μετάνοια',
    transliteration: 'Metanoia',
    english: 'Repentance / Change of Mind',
    strongs: 'G3341',
    meaning:
      'A complete change of mind and direction — not merely feeling sorry, but a fundamental reorientation of the whole person toward God. Meta (after/beyond) + nous (mind) = literally "after-thought" or "beyond-thinking."',
    verses: ['Matt 3:2', 'Acts 2:38', '2 Cor 7:10'],
    root: 'Meta (change/beyond) + νοῦς (nous — mind)',
    audio: 'meh-TA-noy-ah',
    examples: [
      { ref: 'Matt 3:2', text: 'Repent (metanoeite), for the kingdom of heaven has come near' },
      { ref: 'Acts 2:38', text: 'Repent (metanoesate) and be baptized, every one of you' },
    ],
  },
  {
    word: 'Σωτηρία',
    transliteration: 'Soteria',
    english: 'Salvation / Deliverance',
    strongs: 'G4991',
    meaning:
      "Complete deliverance — past (justified), present (being sanctified), and future (glorified). Not just rescue from hell but total restoration: body, soul, relationships, creation. Jesus' name (Yeshua) comes from this same root.",
    verses: ['Acts 4:12', 'Rom 1:16', 'Eph 1:13'],
    root: 'From σώζω (sozo) — to save, heal, preserve, make whole',
    audio: 'so-tay-REE-ah',
    examples: [
      { ref: 'Acts 4:12', text: 'Salvation (soteria) is found in no one else' },
      {
        ref: 'Rom 1:16',
        text: 'The Gospel is the power of God for soteria to everyone who believes',
      },
    ],
  },
  {
    word: 'Παράκλητος',
    transliteration: 'Parakletos',
    english: 'Helper / Advocate / Comforter',
    strongs: 'G3875',
    meaning:
      'One called alongside to help. The Holy Spirit\'s title — used only in John 14–16 and 1 John 2:1. Combines para (alongside) + kaleo (to call). English "Comforter" (KJV) comes from Latin fortis — strong — meaning the Spirit makes us strong, not just comfortable.',
    verses: ['John 14:16', 'John 14:26', '1 John 2:1'],
    root: 'Para (alongside) + καλέω (kaleo — to call)',
    audio: 'pah-RAH-klay-tos',
    examples: [
      { ref: 'John 14:16', text: 'I will ask the Father, and he will give you another Parakletos' },
      { ref: 'John 14:26', text: 'The Parakletos, the Holy Spirit, will teach you all things' },
    ],
  },
];

const VERSE_WORDS = {
  'John 3:16': [
    {
      greek: 'Οὕτως',
      trans: 'Houtos',
      eng: 'So / In this way',
      meaning: 'Not "so much" (quantity) but "in this manner" (quality) — this is HOW God loved.',
    },
    {
      greek: 'ἠγάπησεν',
      trans: 'Egapesen',
      eng: 'Loved (Agape)',
      meaning: "Past tense of agapao. God's love was expressed in a decisive, historical act.",
    },
    {
      greek: 'τὸν κόσμον',
      trans: 'ton kosmon',
      eng: 'the world',
      meaning:
        'Not the physical creation but humanity in its fallenness and rebellion — the very people who rejected Him.',
    },
    {
      greek: 'μονογενῆ',
      trans: 'monogene',
      eng: 'one and only / unique',
      meaning:
        'Not "only begotten" (older translation) but "unique, one of a kind" — Jesus is in a category entirely His own.',
    },
    {
      greek: 'ἀπόληται',
      trans: 'apoletai',
      eng: 'perish',
      meaning:
        'Not mere death but total destruction, eternal ruin — the complete unraveling of the self apart from God.',
    },
    {
      greek: 'αἰώνιον',
      trans: 'aionion',
      eng: 'eternal',
      meaning:
        "Not just unending duration but a quality of life — the very life of God's age, starting now.",
    },
  ],
};

export default function OriginalLanguageExplorer() {
  const [tab, setTab] = useState('hebrew'); // hebrew | greek | verse
  const [selected, setSelected] = useState(null);
  const [verseInput, setVerseInput] = useState('John 3:16');
  const [verseData, setVerseData] = useState(VERSE_WORDS['John 3:16']);
  const [hoveredWord, setHoveredWord] = useState(null);

  const dataset = tab === 'hebrew' ? HEBREW : GREEK;

  const s = {
    langTag: (active) => ({
      fontFamily: 'Poppins,sans-serif',
      fontSize: '.84rem',
      fontWeight: 800,
      padding: '9px 22px',
      border: 'none',
      background: active ? 'linear-gradient(135deg,#1E1B4B,#2D1B69)' : 'var(--bg2)',
      color: active ? 'white' : 'var(--ink3)',
      borderRadius: 12,
      cursor: 'pointer',
      transition: 'all .2s',
    }),
  };

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B,#0A1A0F)',
          padding: '52px 36px 40px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,5vw,3.2rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg,#FCD34D,#A5B4FC,#6EE7B7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}
        >
          Original Language Explorer
        </h1>
        <p
          style={{
            color: 'rgba(255,255,255,.45)',
            fontSize: '.88rem',
            fontWeight: 500,
            maxWidth: 500,
            margin: '0 auto',
          }}
        >
          Discover what the Bible really says in Hebrew and Greek — the languages God chose to write
          His Word in. No seminary required.
        </p>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 20px' }}>
        {/* Tab bar */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            marginBottom: 28,
            background: 'var(--surface)',
            borderRadius: 16,
            padding: 6,
            border: '1.5px solid var(--border)',
            width: 'fit-content',
          }}
        >
          {[
            ['hebrew', '📜 Hebrew (OT)'],
            ['greek', 'ΑΩ Greek (NT)'],
            ['verse', '🔍 Verse Explorer'],
          ].map(([id, label]) => (
            <button
              key={id}
              style={s.langTag(tab === id)}
              onClick={() => {
                setTab(id);
                setSelected(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Word grid */}
        {(tab === 'hebrew' || tab === 'greek') && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.4fr',
              gap: 20,
              alignItems: 'start',
            }}
          >
            {/* Left: word list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {dataset.map((word, i) => (
                <div
                  key={i}
                  onClick={() => setSelected(selected?.strongs === word.strongs ? null : word)}
                  style={{
                    borderRadius: 16,
                    border: `1.5px solid ${selected?.strongs === word.strongs ? 'var(--violet)' : 'var(--border)'}`,
                    padding: '16px 18px',
                    cursor: 'pointer',
                    transition: 'all .22s',
                    background:
                      selected?.strongs === word.strongs ? 'var(--violet-bg)' : 'var(--surface)',
                  }}
                  onMouseEnter={(e) => {
                    if (selected?.strongs !== word.strongs)
                      e.currentTarget.style.borderColor = 'var(--blue)';
                  }}
                  onMouseLeave={(e) => {
                    if (selected?.strongs !== word.strongs)
                      e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: 10,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: tab === 'hebrew' ? 'serif' : 'serif',
                          fontSize: '1.6rem',
                          color:
                            selected?.strongs === word.strongs ? 'var(--violet)' : 'var(--ink)',
                          lineHeight: 1.2,
                          marginBottom: 4,
                          direction: tab === 'hebrew' ? 'rtl' : 'ltr',
                        }}
                      >
                        {word.word}
                      </div>
                      <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--ink2)' }}>
                        {word.transliteration}
                      </div>
                      <div style={{ fontSize: '.72rem', color: 'var(--ink3)', fontWeight: 500 }}>
                        {word.english}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: '.6rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: 100,
                        background: 'var(--bg2)',
                        color: 'var(--ink3)',
                        flexShrink: 0,
                      }}
                    >
                      {word.strongs}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: detail panel */}
            {selected ? (
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 22,
                  border: '1.5px solid var(--border)',
                  overflow: 'hidden',
                  position: 'sticky',
                  top: 80,
                }}
              >
                <div
                  style={{
                    background: 'linear-gradient(135deg,#1E1B4B,#2D1B69)',
                    padding: '24px 28px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '.64rem',
                      fontWeight: 800,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      color: 'rgba(165,180,252,.6)',
                      marginBottom: 6,
                    }}
                  >
                    {selected.strongs}
                  </div>
                  <div
                    style={{
                      fontSize: '3rem',
                      color: 'white',
                      lineHeight: 1.2,
                      marginBottom: 6,
                      fontFamily: 'serif',
                      direction: tab === 'hebrew' ? 'rtl' : 'ltr',
                    }}
                  >
                    {selected.word}
                  </div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#A5B4FC' }}>
                    {selected.transliteration}
                  </div>
                  <div
                    style={{
                      fontSize: '.82rem',
                      color: 'rgba(165,180,252,.7)',
                      fontWeight: 500,
                      marginTop: 2,
                    }}
                  >
                    Pronunciation: {selected.audio}
                  </div>
                </div>
                <div style={{ padding: '22px 28px' }}>
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '.9rem',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      marginBottom: 6,
                    }}
                  >
                    💡 What it really means
                  </div>
                  <p
                    style={{
                      fontSize: '.88rem',
                      color: 'var(--ink2)',
                      lineHeight: 1.75,
                      fontWeight: 500,
                      marginBottom: 18,
                    }}
                  >
                    {selected.meaning}
                  </p>

                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '.9rem',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      marginBottom: 6,
                    }}
                  >
                    🌱 Root word
                  </div>
                  <div
                    style={{
                      fontSize: '.82rem',
                      color: 'var(--ink3)',
                      fontWeight: 500,
                      background: 'var(--bg2)',
                      borderRadius: 10,
                      padding: '10px 14px',
                      marginBottom: 18,
                    }}
                  >
                    {selected.root}
                  </div>

                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '.9rem',
                      fontWeight: 800,
                      color: 'var(--ink)',
                      marginBottom: 10,
                    }}
                  >
                    📖 In the text
                  </div>
                  {selected.examples.map((ex, i) => (
                    <div
                      key={i}
                      style={{
                        borderLeft: '3px solid var(--violet)',
                        paddingLeft: 12,
                        marginBottom: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: '.72rem',
                          fontWeight: 800,
                          color: 'var(--violet)',
                          marginBottom: 3,
                        }}
                      >
                        {ex.ref}
                      </div>
                      <div
                        style={{
                          fontSize: '.84rem',
                          color: 'var(--ink2)',
                          fontStyle: 'italic',
                          fontWeight: 500,
                        }}
                      >
                        "{ex.text}"
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: 14 }}>
                    <div
                      style={{
                        fontSize: '.7rem',
                        fontWeight: 700,
                        color: 'var(--ink3)',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        marginBottom: 8,
                      }}
                    >
                      Also appears in
                    </div>
                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                      {selected.verses.map((v, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '.72rem',
                            fontWeight: 700,
                            padding: '4px 10px',
                            borderRadius: 100,
                            background: 'var(--violet-bg)',
                            color: 'var(--violet)',
                            border: '1px solid rgba(139,92,246,.2)',
                          }}
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 22,
                  border: '1.5px solid var(--border)',
                  padding: '40px 32px',
                  textAlign: 'center',
                  color: 'var(--ink3)',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: 14, opacity: 0.4 }}>
                  {tab === 'hebrew' ? '📜' : 'ΑΩ'}
                </div>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    marginBottom: 8,
                  }}
                >
                  Select a word
                </div>
                <div style={{ fontSize: '.82rem', fontWeight: 500, lineHeight: 1.7 }}>
                  Click any word on the left to see its full meaning, root, pronunciation, and usage
                  in scripture.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Verse Explorer tab */}
        {tab === 'verse' && (
          <div>
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 20,
                border: '1.5px solid var(--border)',
                padding: '22px 26px',
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: 'var(--ink)',
                  marginBottom: 12,
                }}
              >
                🔍 Enter a verse reference
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  className="input-field"
                  placeholder="e.g. John 3:16"
                  value={verseInput}
                  onChange={(e) => setVerseInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  className="btn btn-violet"
                  onClick={() => setVerseData(VERSE_WORDS[verseInput] || null)}
                >
                  Explore
                </button>
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {Object.keys(VERSE_WORDS).map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      setVerseInput(v);
                      setVerseData(VERSE_WORDS[v]);
                    }}
                    style={{
                      fontSize: '.72rem',
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: 100,
                      border: `1.5px solid ${verseInput === v ? 'var(--violet)' : 'var(--border)'}`,
                      background: verseInput === v ? 'var(--violet-bg)' : 'var(--surface)',
                      color: verseInput === v ? 'var(--violet)' : 'var(--ink2)',
                      cursor: 'pointer',
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            {verseData ? (
              <div>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    marginBottom: 14,
                  }}
                >
                  Word-by-word breakdown: {verseInput}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {verseData.map((w, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'var(--surface)',
                        borderRadius: 16,
                        border: '1.5px solid var(--border)',
                        padding: '18px 20px',
                        display: 'flex',
                        gap: 18,
                        alignItems: 'flex-start',
                        transition: 'all .2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--violet)';
                        e.currentTarget.style.background = 'var(--violet-bg)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.background = 'var(--surface)';
                      }}
                    >
                      <div style={{ textAlign: 'center', minWidth: 80 }}>
                        <div
                          style={{
                            fontSize: '1.3rem',
                            fontFamily: 'serif',
                            color: 'var(--violet)',
                            marginBottom: 2,
                          }}
                        >
                          {w.greek}
                        </div>
                        <div style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--ink3)' }}>
                          {w.trans}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontFamily: "'Baloo 2',cursive",
                            fontSize: '.95rem',
                            fontWeight: 800,
                            color: 'var(--ink)',
                            marginBottom: 4,
                          }}
                        >
                          "{w.eng}"
                        </div>
                        <div
                          style={{
                            fontSize: '.84rem',
                            color: 'var(--ink2)',
                            fontWeight: 500,
                            lineHeight: 1.65,
                          }}
                        >
                          {w.meaning}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: 'var(--orange-bg)',
                  border: '1.5px solid var(--orange)',
                  borderRadius: 14,
                  padding: '14px 20px',
                  fontSize: '.84rem',
                  color: 'var(--ink2)',
                  fontWeight: 500,
                }}
              >
                ⚠️ Verse breakdown not yet available for "{verseInput}". More verses are being added
                regularly. Try "John 3:16" for a full example.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
