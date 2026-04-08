import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { generateAIContent } from '../lib/ai';
import { useAds } from '../context/AdsContext';

// Resource definitions — must match ParentsTeachers.jsx ids
const RESOURCE_PROMPTS = {
  'lp-1': {
    title: 'Fruit of the Spirit: Love',
    type: 'Lesson Plan',
    ageRange: '4-8',
    role: 'Teacher',
    prompt: `Create a complete, printable lesson plan titled "Fruit of the Spirit: Love" for children ages 4-8.

Use EXACTLY this format with labels on their own lines:

LESSON_TITLE: Fruit of the Spirit: Love
AGE_GROUP: Ages 4-8
DURATION: 45-60 minutes
SCRIPTURE: Galatians 5:22-23 and John 13:34-35

LEARNING_OBJECTIVES:
• [3 clear, age-appropriate learning objectives]

MATERIALS_NEEDED:
• [6-8 simple materials a teacher would have]

OPENING_ACTIVITY: (10 minutes)
[Fun, engaging opening activity that introduces the concept of love]

BIBLE_STORY_TIME: (15 minutes)
[Age-appropriate retelling of a Bible story about love — use simple language, dialogue, and vivid details]

MEMORY_VERSE:
[Simple memory verse with a fun way to memorize it]

CRAFT_ACTIVITY: (15 minutes)
[Step-by-step craft activity related to love — simple enough for ages 4-8]

DISCUSSION_QUESTIONS:
1. [Simple question for young children]
2. [Question about the Bible story]
3. [Application question: "How can you show love today?"]

CLOSING_PRAYER:
[Short, simple prayer the children can repeat]

TAKE_HOME_NOTE:
[Brief note for parents explaining what was learned and how to reinforce it at home]

Keep everything warm, joyful, and faith-centered. Use simple language throughout.`,
  },
  'lp-2': {
    title: 'David and Goliath: Faith',
    type: 'Lesson Plan',
    ageRange: '6-12',
    role: 'Teacher',
    prompt: `Create a complete, printable lesson plan titled "David and Goliath: Faith Over Fear" for children ages 6-12.

Use EXACTLY this format:

LESSON_TITLE: David and Goliath: Faith Over Fear
AGE_GROUP: Ages 6-12
DURATION: 45-60 minutes
SCRIPTURE: 1 Samuel 17:45-47

LEARNING_OBJECTIVES:
• [3 learning objectives about faith and courage]

MATERIALS_NEEDED:
• [6-8 materials]

OPENING_ICEBREAKER: (10 minutes)
[Fun activity about facing fears or challenges]

BIBLE_STORY_TIME: (15 minutes)
[Dramatic retelling of David and Goliath with dialogue and vivid details — make it exciting!]

MEMORY_VERSE:
[Key verse with memorization technique]

GROUP_ACTIVITY: (15 minutes)
[Interactive game or activity that reinforces the lesson about faith]

DISCUSSION_QUESTIONS:
1. [Question about the story]
2. [Question about David's faith]
3. [Personal application: "What is your Goliath?"]

CRAFT_OR_WORKSHEET:
[Simple craft or worksheet idea]

CLOSING_PRAYER:
[Prayer for courage and faith]

TAKE_HOME_CHALLENGE:
[One thing children can do this week to practice faith]`,
  },
  'lp-3': {
    title: 'Parables for Parents',
    type: 'Parent Guide',
    ageRange: '5-10',
    role: 'Parent',
    prompt: `Create a complete, printable parent guide titled "Teaching Jesus's Parables at Home" for children ages 5-10.

Use EXACTLY this format:

GUIDE_TITLE: Teaching Jesus's Parables at Home
AGE_GROUP: Ages 5-10
SCRIPTURE: Matthew 13:1-9, Luke 15:11-32

INTRODUCTION:
[2 paragraphs explaining why parables are powerful for children and how to use this guide]

PARABLE_1: The Prodigal Son
STORY_SUMMARY: [Brief, parent-friendly summary]
DISCUSSION_QUESTIONS:
• [3 questions to ask your child]
ACTIVITY: [Simple home activity]
LIFE_APPLICATION: [How to connect this to everyday family life]

PARABLE_2: The Good Samaritan
STORY_SUMMARY: [Brief summary]
DISCUSSION_QUESTIONS:
• [3 questions]
ACTIVITY: [Simple activity]
LIFE_APPLICATION: [Family connection]

PARABLE_3: The Lost Sheep
STORY_SUMMARY: [Brief summary]
DISCUSSION_QUESTIONS:
• [3 questions]
ACTIVITY: [Simple activity]
LIFE_APPLICATION: [Family connection]

TIPS_FOR_PARENTS:
• [5 practical tips for teaching Bible stories at home]

FAMILY_PRAYER:
[A prayer parents can pray with their children]`,
  },
  'lp-4': {
    title: 'Ten Commandments Exploration',
    type: 'Lesson Plan',
    ageRange: '8-14',
    role: 'Teacher',
    prompt: `Create a complete, printable lesson plan titled "The Ten Commandments: God's Blueprint for Life" for ages 8-14.

Use EXACTLY this format:

LESSON_TITLE: The Ten Commandments: God's Blueprint for Life
AGE_GROUP: Ages 8-14
DURATION: 60-75 minutes
SCRIPTURE: Exodus 20:1-17

LEARNING_OBJECTIVES:
• [3 objectives]

MATERIALS_NEEDED:
• [materials list]

HOOK_ACTIVITY: (10 minutes)
[Engaging activity about rules and why they exist]

TEACHING_CONTENT: (20 minutes)
[Clear explanation of all 10 commandments in modern, relatable language for tweens]

SMALL_GROUP_ACTIVITY: (15 minutes)
[Activity where students apply commandments to modern scenarios]

MEMORY_CHALLENGE:
[Creative way to memorize all 10 commandments]

DISCUSSION_QUESTIONS:
1. [Question about the purpose of the commandments]
2. [Question about which is hardest to follow today]
3. [Question about grace when we fail]

WORKSHEET:
[Description of a fill-in worksheet students can complete]

CLOSING_DEVOTION:
[Brief devotional connecting the commandments to Jesus's summary in Matthew 22:37-40]`,
  },
  'act-1': {
    title: 'Armor of God Craft',
    type: 'Activity Sheet',
    ageRange: '5-10',
    role: 'Teacher',
    prompt: `Create a complete, printable activity guide titled "Armor of God Craft & Activity" for children ages 5-10.

Use EXACTLY this format:

ACTIVITY_TITLE: Putting on the Armor of God
AGE_GROUP: Ages 5-10
DURATION: 30-45 minutes
SCRIPTURE: Ephesians 6:10-18

WHAT_YOU_NEED:
• [Simple craft materials list]

ARMOR_OF_GOD_GUIDE:
Belt of Truth: [Child-friendly explanation + how to make/represent it]
Breastplate of Righteousness: [Explanation + craft idea]
Shoes of Peace: [Explanation + craft idea]
Shield of Faith: [Explanation + craft idea]
Helmet of Salvation: [Explanation + craft idea]
Sword of the Spirit: [Explanation + craft idea]

STEP_BY_STEP_CRAFT:
[Numbered steps for making a simple Armor of God craft — paper plate shield, etc.]

MEMORY_VERSE:
Ephesians 6:11 — [verse] + memorization tip

DISCUSSION_QUESTIONS:
1. [Question about spiritual battles]
2. [Question about which piece of armor they need most]
3. [Application question]

PRAYER:
[Prayer putting on the armor of God together]`,
  },
  'act-2': {
    title: 'Bible Verse Memory Games',
    type: 'Activity Sheet',
    ageRange: '4-12',
    role: 'Parent',
    prompt: `Create a complete, printable activity guide titled "Fun Bible Verse Memory Games for Families" for ages 4-12.

Use EXACTLY this format:

ACTIVITY_TITLE: Fun Bible Verse Memory Games
AGE_GROUP: Ages 4-12 (adaptable)
SCRIPTURE_FOCUS: Psalm 119:11, Deuteronomy 6:6-7

INTRODUCTION:
[Brief paragraph on why memorizing Scripture matters]

GAME_1: Verse Scramble
INSTRUCTIONS: [How to play — cut up words, reassemble the verse]
VERSES_TO_USE: [5 age-appropriate verses]
VARIATIONS: [Easier version for younger kids, harder for older]

GAME_2: Fill in the Blank
INSTRUCTIONS: [How to play]
SAMPLE_WORKSHEET: [3 verses with blanks to fill in]

GAME_3: Verse Relay Race
INSTRUCTIONS: [Active game for groups]

GAME_4: Memory Card Match
INSTRUCTIONS: [Card game matching verse halves]
HOW_TO_MAKE_CARDS: [Simple instructions]

GAME_5: Verse of the Week Challenge
INSTRUCTIONS: [Daily family challenge format]
REWARD_IDEAS: [Simple, fun rewards for memorizing]

TIPS_FOR_SUCCESS:
• [5 tips for making memorization fun and stick]`,
  },
  'act-3': {
    title: 'Creation Week Art Project',
    type: 'Activity Sheet',
    ageRange: '6-11',
    role: 'Teacher',
    prompt: `Create a complete, printable 7-day art project guide titled "Creation Week Art Project" for children ages 6-11.

Use EXACTLY this format:

PROJECT_TITLE: Creation Week Art Project
AGE_GROUP: Ages 6-11
DURATION: 7 days (15-20 minutes per day)
SCRIPTURE: Genesis 1:1-2:3

INTRODUCTION:
[Brief, exciting introduction to the project]

MATERIALS_NEEDED:
• [Complete materials list for all 7 days]

DAY_1: Light and Darkness
SCRIPTURE: Genesis 1:3-5
ART_PROJECT: [Specific art activity — watercolor, collage, etc.]
DISCUSSION: [1-2 questions]
PRAYER: [Short prayer]

DAY_2: Sky and Water
SCRIPTURE: Genesis 1:6-8
ART_PROJECT: [Specific activity]
DISCUSSION: [Questions]
PRAYER: [Prayer]

DAY_3: Land, Sea, and Plants
SCRIPTURE: Genesis 1:9-13
ART_PROJECT: [Activity]
DISCUSSION: [Questions]
PRAYER: [Prayer]

DAY_4: Sun, Moon, and Stars
SCRIPTURE: Genesis 1:14-19
ART_PROJECT: [Activity]
DISCUSSION: [Questions]
PRAYER: [Prayer]

DAY_5: Birds and Fish
SCRIPTURE: Genesis 1:20-23
ART_PROJECT: [Activity]
DISCUSSION: [Questions]
PRAYER: [Prayer]

DAY_6: Animals and People
SCRIPTURE: Genesis 1:24-31
ART_PROJECT: [Activity]
DISCUSSION: [Questions]
PRAYER: [Prayer]

DAY_7: Rest and Celebration
SCRIPTURE: Genesis 2:1-3
FINAL_PROJECT: [How to assemble all 7 days into one display]
CELEBRATION: [How to celebrate completing the project]`,
  },
  'tr-1': {
    title: 'Classroom Discussion Guides',
    type: 'Teaching Resource',
    ageRange: '6-14',
    role: 'Teacher',
    prompt: `Create a complete, printable classroom discussion guide titled "Leading Meaningful Bible Discussions" for teachers of ages 6-14.

Use EXACTLY this format:

GUIDE_TITLE: Leading Meaningful Bible Discussions in the Classroom
TARGET: Teachers of ages 6-14

INTRODUCTION:
[2 paragraphs on the power of discussion in faith education]

DISCUSSION_FRAMEWORK:
The 4-Question Method:
1. OBSERVE: [What does the text say? — example questions]
2. INTERPRET: [What does it mean? — example questions]
3. APPLY: [What does it mean for us? — example questions]
4. RESPOND: [What will we do? — example questions]

DISCUSSION_GUIDE_1: The Sermon on the Mount (Matthew 5-7)
KEY_PASSAGE: Matthew 5:3-12
OPENING_QUESTION: [Engaging opener]
DISCUSSION_QUESTIONS: [5 questions using the 4-question method]
CLOSING_ACTIVITY: [Brief activity]

DISCUSSION_GUIDE_2: The Good Samaritan (Luke 10:25-37)
KEY_PASSAGE: Luke 10:30-37
OPENING_QUESTION: [Opener]
DISCUSSION_QUESTIONS: [5 questions]
CLOSING_ACTIVITY: [Activity]

DISCUSSION_GUIDE_3: Daniel in the Lions Den (Daniel 6)
KEY_PASSAGE: Daniel 6:10
OPENING_QUESTION: [Opener]
DISCUSSION_QUESTIONS: [5 questions]
CLOSING_ACTIVITY: [Activity]

TIPS_FOR_FACILITATORS:
• [8 practical tips for leading great discussions]

HANDLING_DIFFICULT_QUESTIONS:
[Guidance on handling tough theological questions from children]`,
  },
  'tr-2': {
    title: 'Parent-Teacher Communication Templates',
    type: 'Teaching Resource',
    ageRange: 'Adult',
    role: 'Teacher',
    prompt: `Create a complete, printable set of parent-teacher communication templates for faith-based educators.

Use EXACTLY this format:

RESOURCE_TITLE: Parent-Teacher Communication Templates for Faith Educators

INTRODUCTION:
[Brief intro on the importance of parent-teacher partnership in faith education]

TEMPLATE_1: Welcome Letter (Start of Year)
[Complete, ready-to-use welcome letter template with [TEACHER_NAME], [CLASS_NAME], [CHURCH/SCHOOL] placeholders]

TEMPLATE_2: Weekly Update Email
[Short weekly update template covering: what we learned, memory verse, upcoming topics, prayer requests]

TEMPLATE_3: Positive Behavior Note
[Encouraging note to send home when a child shows exceptional faith or character]

TEMPLATE_4: Concern/Support Letter
[Sensitive template for when a child needs extra support or is going through difficulty]

TEMPLATE_5: End of Year Letter
[Celebratory end-of-year letter highlighting growth and encouraging continued faith at home]

TEMPLATE_6: Prayer Request Card
[Simple card template for collecting family prayer requests]

TIPS_FOR_COMMUNICATION:
• [6 tips for effective parent-teacher communication in faith settings]`,
  },
};

const SYSTEM_PROMPT = `You are an expert Christian educator creating high-quality, printable educational resources for BibleFunLand. 
Your content should be:
- Scripturally accurate and faith-centered
- Age-appropriate and engaging
- Practical and immediately usable
- Warm, encouraging, and joyful in tone
- Formatted clearly for printing

Follow the exact format requested. Use clear headings. Make it professional and polished.`;

export default function PrintableResource() {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const { isProUser, proChecked } = useAds();
  const printRef = useRef(null);

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resource = RESOURCE_PROMPTS[resourceId];

  useEffect(() => {
    if (resource && !content && !loading) {
      generate();
    }
  }, [resourceId]);

  async function generate() {
    if (!resource) return;
    setLoading(true);
    setError('');
    try {
      const text = await generateAIContent({
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: resource.prompt }],
        max_tokens: 2000,
      });
      if (!text) { setError('Generation failed. Please try again.'); }
      else setContent(text);
    } catch (err) {
      setError(err.message || 'Failed to generate. Please try again.');
    }
    setLoading(false);
  }

  function handlePrint() {
    window.print();
  }

  if (!resource) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins,sans-serif', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: '3rem' }}>📄</div>
        <div style={{ fontWeight: 700, color: 'var(--ink)' }}>Resource not found</div>
        <Link to="/parents/parents-teachers" style={{ color: 'var(--blue)', textDecoration: 'none', fontWeight: 600 }}>← Back to Resources</Link>
      </div>
    );
  }

  // Pro gate check
  if (proChecked && !isProUser) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Poppins,sans-serif', padding: 24 }}>
        <div style={{
          maxWidth: 480, textAlign: 'center',
          background: 'linear-gradient(135deg,#1E1B4B,#312E81)',
          borderRadius: 24, padding: '40px 32px',
          border: '1.5px solid rgba(139,92,246,0.3)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔒</div>
          <h2 style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, color: 'white', marginBottom: 8 }}>Pro Feature</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '.9rem', marginBottom: 24, lineHeight: 1.7 }}>
            AI-generated printable resources are available to Pro subscribers. Upgrade to access unlimited lesson plans, activity sheets, and teaching guides.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/premium" style={{ padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg,#8B5CF6,#6366F1)', color: 'white', fontWeight: 800, fontSize: '.9rem', textDecoration: 'none' }}>
              💎 Upgrade to Pro
            </Link>
            <Link to="/parents/parents-teachers" style={{ padding: '12px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '.9rem', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)' }}>
              ← Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Screen UI */}
      <div className="no-print" style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg,#1E1B4B,#312E81)',
          padding: '40px 24px 32px', textAlign: 'center',
        }}>
          <Link to="/parents/parents-teachers" style={{ fontSize: '.8rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
            ← Back to Resources
          </Link>
          <h1 style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: 'clamp(1.5rem,4vw,2.2rem)', color: 'white', marginBottom: 6 }}>
            📄 {resource.title}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '.85rem' }}>
            {resource.type} · {resource.ageRange} · {resource.role}
          </p>
        </div>

        <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 20px 80px' }}>
          {/* Action bar */}
          {content && !loading && (
            <div style={{
              display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap',
              padding: '14px 18px', background: 'var(--surface)',
              borderRadius: 14, border: '1.5px solid var(--border)',
              alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '.82rem', color: 'var(--ink3)', fontWeight: 600 }}>
                ✅ Ready to print — use your browser's print dialog to save as PDF
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={generate} style={{
                  padding: '9px 16px', borderRadius: 10, border: '1.5px solid var(--border)',
                  background: 'var(--bg2)', color: 'var(--ink2)', fontWeight: 700,
                  fontSize: '.8rem', cursor: 'pointer', fontFamily: 'Poppins,sans-serif',
                }}>
                  ↺ Regenerate
                </button>
                <button onClick={handlePrint} style={{
                  padding: '9px 20px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg,#10B981,#059669)',
                  color: 'white', fontWeight: 800, fontSize: '.85rem',
                  cursor: 'pointer', fontFamily: 'Poppins,sans-serif',
                  boxShadow: '0 4px 14px rgba(16,185,129,0.4)',
                }}>
                  🖨️ Print / Save PDF
                </button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '64px 24px' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16, animation: 'spin 2s linear infinite', display: 'inline-block' }}>📄</div>
              <div style={{ fontFamily: "'Baloo 2',cursive", fontWeight: 800, fontSize: '1.2rem', color: 'var(--ink)', marginBottom: 8 }}>
                Generating your resource...
              </div>
              <p style={{ color: 'var(--ink3)', fontSize: '.85rem' }}>This takes about 10-15 seconds</p>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={{ background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 12, padding: '14px 18px', marginBottom: 20, fontWeight: 600, fontSize: '.88rem' }}>
              ⚠️ {error}
              <button onClick={generate} style={{ marginLeft: 12, background: 'var(--red)', color: 'white', border: 'none', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontWeight: 700, fontSize: '.78rem', fontFamily: 'Poppins,sans-serif' }}>
                Try Again
              </button>
            </div>
          )}

          {/* Content preview */}
          {content && !loading && (
            <div ref={printRef} style={{
              background: 'white', borderRadius: 16, border: '1.5px solid var(--border)',
              padding: '40px 44px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}>
              <ResourceContent text={content} title={resource.title} type={resource.type} ageRange={resource.ageRange} />
            </div>
          )}
        </div>
      </div>

      {/* Print-only version */}
      {content && (
        <div className="print-only" style={{ display: 'none', fontFamily: 'Georgia, serif', padding: '20px 40px', maxWidth: 800, margin: '0 auto' }}>
          {/* Print header */}
          <div style={{ borderBottom: '2px solid #1E1B4B', paddingBottom: 16, marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontWeight: 800, fontSize: '1.4rem', color: '#1E1B4B' }}>✝️ BibleFunLand</div>
              <div style={{ fontSize: '.75rem', color: '#6B7280' }}>biblefunland.com · Faith-centered learning for families</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '.75rem', color: '#6B7280' }}>
              <div>{resource.type} · {resource.ageRange}</div>
              <div>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
          </div>
          <ResourceContent text={content} title={resource.title} type={resource.type} ageRange={resource.ageRange} forPrint />
        </div>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; }
        }
      `}</style>
    </>
  );
}

// ── Content renderer ──────────────────────────────────────────────────────────
function ResourceContent({ text, title, type, ageRange, forPrint }) {
  const lines = text.split('\n');

  return (
    <div style={{ fontFamily: forPrint ? 'Georgia, serif' : 'Poppins, sans-serif' }}>
      {/* Title block */}
      <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '2px solid #E5E7EB' }}>
        <div style={{ fontSize: '.7rem', fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>
          {type} · {ageRange}
        </div>
        <h1 style={{ fontFamily: "'Baloo 2', cursive", fontSize: forPrint ? '1.6rem' : '1.4rem', fontWeight: 800, color: '#1E1B4B', margin: 0 }}>
          {title}
        </h1>
      </div>

      {/* Rendered content */}
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} style={{ height: 8 }} />;

        // Section headers (ALL_CAPS_WITH_UNDERSCORES:)
        if (/^[A-Z_]+:/.test(trimmed)) {
          const [label, ...rest] = trimmed.split(':');
          const value = rest.join(':').trim();
          const labelFormatted = label.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          return (
            <div key={i} style={{ marginTop: 20, marginBottom: 8 }}>
              <div style={{
                fontWeight: 800, fontSize: forPrint ? '.9rem' : '.85rem',
                color: '#1E1B4B', textTransform: 'uppercase', letterSpacing: '.5px',
                borderLeft: '3px solid #8B5CF6', paddingLeft: 10,
                display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap',
              }}>
                {labelFormatted}
                {value && <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0, color: '#374151', fontSize: forPrint ? '.9rem' : '.85rem' }}>{value}</span>}
              </div>
            </div>
          );
        }

        // Bullet points
        if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 5, paddingLeft: 8 }}>
              <span style={{ color: '#8B5CF6', flexShrink: 0, fontWeight: 800 }}>•</span>
              <span style={{ fontSize: forPrint ? '.88rem' : '.85rem', color: '#374151', lineHeight: 1.6 }}>
                {trimmed.replace(/^[•\-]\s*/, '')}
              </span>
            </div>
          );
        }

        // Numbered items
        if (/^\d+\./.test(trimmed)) {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, paddingLeft: 8 }}>
              <span style={{ color: '#8B5CF6', flexShrink: 0, fontWeight: 800, minWidth: 20 }}>
                {trimmed.match(/^\d+/)[0]}.
              </span>
              <span style={{ fontSize: forPrint ? '.88rem' : '.85rem', color: '#374151', lineHeight: 1.6 }}>
                {trimmed.replace(/^\d+\.\s*/, '')}
              </span>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={i} style={{ fontSize: forPrint ? '.9rem' : '.85rem', color: '#374151', lineHeight: 1.75, margin: '0 0 6px' }}>
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
