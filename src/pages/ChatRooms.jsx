import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// Realtime broadcast stub — replace with a real WS solution if needed
const createChannel = (name) => ({
  on: () => ({ on: () => ({ subscribe: () => {} }) }),
  send: () => {},
  unsubscribe: () => {},
});

const ROOMS = [
  {
    id: 'general',
    name: '#general',
    emoji: '💬',
    desc: 'General faith conversation',
    color: 'var(--blue)',
    bg: 'var(--blue-bg)',
  },
  {
    id: 'prayer',
    name: '#prayer',
    emoji: '🙏',
    desc: 'Share and receive prayer',
    color: 'var(--green)',
    bg: 'var(--green-bg)',
  },
  {
    id: 'devotional',
    name: '#devotional',
    emoji: '📖',
    desc: 'Daily devotionals & reflections',
    color: 'var(--violet)',
    bg: 'var(--violet-bg)',
  },
  {
    id: 'youth',
    name: '#youth',
    emoji: '⚡',
    desc: 'For teens and young adults',
    color: 'var(--orange)',
    bg: 'var(--orange-bg)',
  },
  {
    id: 'kids',
    name: '#kids',
    emoji: '🌈',
    desc: 'Parents & kids chat',
    color: 'var(--pink)',
    bg: 'var(--pink-bg)',
  },
  {
    id: 'ministry',
    name: '#ministry',
    emoji: '⛪',
    desc: 'Church leaders & pastors',
    color: 'var(--teal)',
    bg: 'var(--teal-bg)',
  },
];

const LOCAL_MSGS = {
  general: [
    {
      id: 1,
      user: 'JoyfulSarah',
      text: 'Good morning church family! 🙏 Starting the day with Psalm 118:24',
      time: '8:02 AM',
    },
    {
      id: 2,
      user: 'BlessedMike',
      text: 'Amen! This is the day the Lord has made! How is everyone doing today?',
      time: '8:05 AM',
    },
    {
      id: 3,
      user: 'FaithWalker',
      text: "Praying for everyone here. May God's peace fill your homes today 💙",
      time: '8:09 AM',
    },
  ],
  prayer: [
    {
      id: 1,
      user: 'GraceF',
      text: "Please pray for my sister's healing. She goes in for surgery tomorrow. 🙏",
      time: '7:45 AM',
    },
    {
      id: 2,
      user: 'PastorJames',
      text: 'Lifting her up right now, Grace. The Lord is our healer! Isaiah 53:5 💚',
      time: '7:48 AM',
    },
  ],
  devotional: [
    {
      id: 1,
      user: 'BibleLover',
      text: 'Today\'s thought: "His mercies are new every morning." Lamentations 3:23 — What a promise! ☀️',
      time: '6:30 AM',
    },
    {
      id: 2,
      user: 'MorningReader',
      text: 'That verse carries me every single day. Thank you for sharing!',
      time: '6:42 AM',
    },
  ],
  youth: [
    {
      id: 1,
      user: 'YoungDavid17',
      text: 'Anyone else find the Psalms super relatable?? David literally went through it 😭',
      time: '9:15 AM',
    },
    {
      id: 2,
      user: 'GraceGlow16',
      text: 'Yes!! Psalm 22 is literally me during finals week lol',
      time: '9:18 AM',
    },
  ],
  kids: [
    {
      id: 1,
      user: 'Mama_of_3',
      text: 'My 7-year-old just memorized John 3:16 this week! So proud 🎉',
      time: '10:00 AM',
    },
    {
      id: 2,
      user: 'VBS_Teacher',
      text: "That's amazing!! God's Word planted early grows deep 🌱",
      time: '10:04 AM',
    },
  ],
  ministry: [
    {
      id: 1,
      user: 'PastorLisa',
      text: 'Has anyone used BibleFunLand games in their youth services? Looking for ideas!',
      time: '11:00 AM',
    },
    {
      id: 2,
      user: 'YouthPastor',
      text: 'We used the trivia game last Sunday — kids LOVED it. Highly recommend!',
      time: '11:06 AM',
    },
  ],
};

const BANNED_WORDS = ['hate', 'kill', 'stupid', 'shut up', 'idiot'];

export default function ChatRooms() {
  const { user } = useAuth();
  const [room, setRoom] = useState('general');
  const [messages, setMessages] = useState(LOCAL_MSGS[room] || []);
  const [input, setInput] = useState('');
  const [onlineCount] = useState(Math.floor(Math.random() * 40) + 12);
  const [usingRealtime, setUsingRealtime] = useState(false);
  const channelRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages(LOCAL_MSGS[room] || []);
    channelRef.current?.unsubscribe();
    // Try realtime broadcast
    try {
      channelRef.current = createChannel(`chat-${room}`)
        .on('broadcast', { event: 'message' }, ({ payload }) => {
          setMessages((prev) => [...prev, payload]);
          setUsingRealtime(true);
        })
        .subscribe();
    } catch {
      setUsingRealtime(false);
    }
    return () => channelRef.current?.unsubscribe();
  }, [room]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send() {
    const text = input.trim();
    if (!text) return;
    if (!user) {
      alert('Please sign in to chat!');
      return;
    }
    const clean = text.toLowerCase();
    if (BANNED_WORDS.some((w) => clean.includes(w))) {
      alert('Please keep the conversation kind and respectful 🙏');
      return;
    }

    const msg = {
      id: Date.now(),
      user: user.email?.split('@')[0] || 'Friend',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, msg]);
    setInput('');

    try {
      createChannel(`chat-${room}`).send({ type: 'broadcast', event: 'message', payload: msg });
    } catch {}
  }

  const curRoom = ROOMS.find((r) => r.id === room);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)',
          padding: '56px 36px 36px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,5vw,3.5rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg,#60A5FA,#C084FC,#F472B6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}
        >
          Community Chat
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.9rem', fontWeight: 500 }}>
          Faith-based conversations. Keep it kind, keep it Christ-centered. 💙
        </p>
      </div>
      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '28px 20px' }}>
        {!user && (
          <div
            style={{
              background: 'var(--yellow-bg)',
              border: '1.5px solid var(--yellow)',
              borderRadius: 14,
              padding: '12px 18px',
              fontSize: '.84rem',
              color: 'var(--ink2)',
              fontWeight: 500,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span>💡</span>
            <span>
              <Link to="/auth" style={{ color: 'var(--blue)', fontWeight: 700 }}>
                Sign in
              </Link>{' '}
              to send messages. You can read without an account.
            </span>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
          {/* Sidebar */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 20,
              border: '1.5px solid var(--border)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--green)',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
              <span style={{ fontSize: '.76rem', fontWeight: 700, color: 'var(--ink3)' }}>
                {onlineCount} online now
              </span>
            </div>
            {ROOMS.map((r) => (
              <button
                key={r.id}
                onClick={() => setRoom(r.id)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  border: 'none',
                  background: room === r.id ? r.bg : 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderLeft: `3px solid ${room === r.id ? r.color : 'transparent'}`,
                  transition: 'all .15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <span style={{ fontSize: '1.1rem' }}>{r.emoji}</span>
                <div>
                  <div
                    style={{
                      fontSize: '.82rem',
                      fontWeight: 700,
                      color: room === r.id ? r.color : 'var(--ink)',
                    }}
                  >
                    {r.name}
                  </div>
                  <div style={{ fontSize: '.65rem', color: 'var(--ink3)', fontWeight: 500 }}>
                    {r.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
          {/* Chat */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 20,
              border: '1.5px solid var(--border)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              height: 560,
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>{curRoom?.emoji}</span>
              <div
                style={{
                  fontFamily: "'Baloo 2',cursive",
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: curRoom?.color,
                }}
              >
                {curRoom?.name}
              </div>
              <span
                style={{ fontSize: '.72rem', color: 'var(--ink3)', fontWeight: 500, marginLeft: 4 }}
              >
                — {curRoom?.desc}
              </span>
              {usingRealtime && (
                <div
                  style={{
                    marginLeft: 'auto',
                    fontSize: '.65rem',
                    fontWeight: 700,
                    color: 'var(--green)',
                    background: 'var(--green-bg)',
                    padding: '2px 8px',
                    borderRadius: 100,
                  }}
                >
                  🔴 Live
                </div>
              )}
            </div>
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {messages.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: curRoom?.bg,
                      border: `1.5px solid ${curRoom?.color}22`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '.9rem',
                      fontWeight: 800,
                      color: curRoom?.color,
                      flexShrink: 0,
                    }}
                  >
                    {m.user[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div
                      style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginBottom: 2 }}
                    >
                      <span style={{ fontSize: '.8rem', fontWeight: 800, color: curRoom?.color }}>
                        {m.user}
                      </span>
                      <span style={{ fontSize: '.65rem', color: 'var(--ink3)', fontWeight: 500 }}>
                        {m.time}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '.84rem',
                        color: 'var(--ink)',
                        fontWeight: 500,
                        lineHeight: 1.55,
                      }}
                    >
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div
              style={{
                padding: '12px 16px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                gap: 10,
              }}
            >
              <input
                className="input-field"
                placeholder={user ? `Message ${curRoom?.name}...` : 'Sign in to chat...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                disabled={!user}
                style={{ flex: 1 }}
              />
              <button
                className="btn btn-blue"
                onClick={send}
                disabled={!user || !input.trim()}
                style={{ flexShrink: 0 }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
    </div>
  );
}
