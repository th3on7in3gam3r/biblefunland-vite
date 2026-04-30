import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LOCATIONS = [
  {
    id: 'jerusalem',
    name: 'Jerusalem',
    region: 'Judea',
    lat: 31.7683,
    lng: 35.2137,
    color: '#E53935',
    desc: "The holiest city in the Bible — capital of David's kingdom, site of Solomon's Temple, and the city where Jesus was crucified and rose from the dead.",
    stories: [
      { icon: '⚔️', title: 'David captures the city', ref: '2 Samuel 5:6-7' },
      { icon: '🏛️', title: "Solomon's Temple built", ref: '1 Kings 6' },
      { icon: '✝️', title: 'Jesus crucified & risen', ref: 'Matthew 27-28' },
      { icon: '🕊️', title: 'Pentecost — birth of the Church', ref: 'Acts 2' },
    ],
    verse: '"Pray for the peace of Jerusalem." — Psalm 122:6',
  },
  {
    id: 'bethlehem',
    name: 'Bethlehem',
    region: 'Judea',
    lat: 31.7054,
    lng: 35.2024,
    color: '#7B1FA2',
    desc: 'A small town south of Jerusalem with an outsized role in history. David was born here, and centuries later, the Messiah entered the world in a humble manger.',
    stories: [
      { icon: '👑', title: 'King David born here', ref: '1 Samuel 16:1-13' },
      { icon: '👶', title: 'Jesus born in a manger', ref: 'Luke 2:1-7' },
      { icon: '🌟', title: 'Wise men follow the star', ref: 'Matthew 2:1-12' },
      { icon: '📖', title: 'Ruth & Boaz love story', ref: 'Ruth 4' },
    ],
    verse:
      '"But you, Bethlehem… out of you will come… one who will be ruler over Israel." — Micah 5:2',
  },
  {
    id: 'nazareth',
    name: 'Nazareth',
    region: 'Galilee',
    lat: 32.6996,
    lng: 35.3035,
    color: '#1565C0',
    desc: 'A small village in Galilee where Jesus grew up. This is where the angel Gabriel appeared to Mary, and where Jesus lived for most of his 30 years.',
    stories: [
      { icon: '👼', title: 'Angel Gabriel visits Mary', ref: 'Luke 1:26-38' },
      { icon: '👦', title: 'Jesus grows up here', ref: 'Luke 2:51-52' },
      { icon: '📜', title: 'Jesus reads Isaiah in synagogue', ref: 'Luke 4:16-21' },
      { icon: '😮', title: 'Hometown rejects Jesus', ref: 'Mark 6:1-6' },
    ],
    verse:
      '"Jesus of Nazareth… a man accredited by God… by miracles, wonders and signs." — Acts 2:22',
  },
  {
    id: 'capernaum',
    name: 'Capernaum',
    region: 'Galilee',
    lat: 32.8808,
    lng: 35.5751,
    color: '#00695C',
    desc: "Jesus' base of operations during his Galilean ministry. He performed more miracles here than anywhere else.",
    stories: [
      { icon: '🏠', title: "Peter's home — Jesus' base", ref: 'Matthew 4:13' },
      { icon: '🦯', title: 'Paralyzed man healed', ref: 'Mark 2:1-12' },
      { icon: '⚕️', title: "Centurion's servant healed", ref: 'Matthew 8:5-13' },
      { icon: '🎣', title: 'Matthew called from tax booth', ref: 'Matthew 9:9' },
    ],
    verse: '"And leaving Nazareth, he came and settled in Capernaum by the sea." — Matthew 4:13',
  },
  {
    id: 'jericho',
    name: 'Jericho',
    region: 'Jordan Valley',
    lat: 31.8667,
    lng: 35.45,
    color: '#E65100',
    desc: "One of the world's oldest cities. The walls famously fell after Israel marched around them seven times.",
    stories: [
      { icon: '📯', title: 'Walls fall after 7 days', ref: 'Joshua 6' },
      { icon: '🌹', title: 'Rahab hides the spies', ref: 'Joshua 2' },
      { icon: '🌳', title: 'Zacchaeus in the tree', ref: 'Luke 19:1-10' },
      { icon: '🩹', title: 'Good Samaritan parable road', ref: 'Luke 10:25-37' },
    ],
    verse:
      '"So the wall fell down flat. Then the people went up… and they took the city." — Joshua 6:20',
  },
  {
    id: 'sinai',
    name: 'Mt. Sinai',
    region: 'Sinai Peninsula',
    lat: 28.5392,
    lng: 33.975,
    color: '#827717',
    desc: 'The sacred mountain where Moses encountered God in the burning bush and received the Ten Commandments.',
    stories: [
      { icon: '🔥', title: 'Burning bush — God calls Moses', ref: 'Exodus 3:1-6' },
      { icon: '📜', title: 'Ten Commandments given', ref: 'Exodus 20' },
      { icon: '🌩️', title: 'God descends in thunder & lightning', ref: 'Exodus 19:16-25' },
      { icon: '🙏', title: "Elijah hears God's still small voice", ref: '1 Kings 19:9-13' },
    ],
    verse:
      '"Moses said, I will now turn aside to see this great sight, why the bush does not burn." — Exodus 3:3',
  },
  {
    id: 'babylon',
    name: 'Babylon',
    region: 'Mesopotamia',
    lat: 32.5355,
    lng: 44.4275,
    color: '#BF360C',
    desc: 'The great empire where the Jews were exiled for 70 years. Daniel, Shadrach, Meshach & Abednego all lived here.',
    stories: [
      { icon: '🏛️', title: "Daniel interprets king's dream", ref: 'Daniel 2' },
      { icon: '🔥', title: 'Shadrach, Meshach & Abednego', ref: 'Daniel 3' },
      { icon: '🦁', title: "Daniel in the lion's den", ref: 'Daniel 6' },
      { icon: '😢', title: 'Jewish exiles by the rivers', ref: 'Psalm 137' },
    ],
    verse: '"By the rivers of Babylon we sat and wept when we remembered Zion." — Psalm 137:1',
  },
  {
    id: 'galilee',
    name: 'Sea of Galilee',
    region: 'Galilee',
    lat: 32.8208,
    lng: 35.5847,
    color: '#0277BD',
    desc: 'A freshwater lake in northern Israel where Jesus walked on water, calmed the storm, and called his first disciples.',
    stories: [
      { icon: '🚶', title: 'Jesus walks on water', ref: 'Matthew 14:22-33' },
      { icon: '🌊', title: 'Storm calmed', ref: 'Mark 4:35-41' },
      { icon: '🎣', title: 'First disciples called', ref: 'Matthew 4:18-22' },
      { icon: '🐟', title: 'Miraculous catch of fish', ref: 'Luke 5:1-11' },
    ],
    verse: '"He got up, rebuked the wind and said to the waves, Quiet! Be still!" — Mark 4:39',
  },
  {
    id: 'jordan',
    name: 'Jordan River',
    region: 'Jordan Valley',
    lat: 31.8333,
    lng: 35.55,
    color: '#1B5E20',
    desc: 'The river where Israel crossed into the Promised Land and where Jesus was baptized by John.',
    stories: [
      { icon: '🌊', title: 'Israel crosses into Canaan', ref: 'Joshua 3' },
      { icon: '🕊️', title: 'Jesus baptized by John', ref: 'Matthew 3:13-17' },
      { icon: '🙌', title: 'Naaman healed of leprosy', ref: '2 Kings 5:1-14' },
      { icon: '🔥', title: 'Elijah taken up to heaven', ref: '2 Kings 2:1-14' },
    ],
    verse:
      '"As soon as Jesus was baptized… the Spirit of God descended like a dove." — Matthew 3:16',
  },
];

// Custom colored marker
function makeIcon(color) {
  return L.divIcon({
    className: '',
    html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -14],
  });
}

// Fly to selected location
function FlyTo({ loc }) {
  const map = useMap();
  useEffect(() => {
    if (loc) map.flyTo([loc.lat, loc.lng], 9, { duration: 1.2 });
  }, [loc, map]);
  return null;
}

export default function BibleMap() {
  const [active, setActive] = useState(null);
  const loc = active ? LOCATIONS.find((l) => l.id === active) : null;

  useEffect(() => {
    if (window.location.hash === '#interactive-bible-map') {
      const target = document.getElementById('interactive-bible-map');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      {/* Header */}
      <div
        id="interactive-bible-map"
        style={{
          background: 'linear-gradient(135deg,#064E3B,#065F46,#047857)',
          padding: '60px 36px 44px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,4.5vw,3.4rem)',
            fontWeight: 800,
            color: 'white',
            letterSpacing: -1,
            marginBottom: 8,
          }}
        >
          🗺️ Interactive Bible Map
        </h1>
        <p style={{ color: 'rgba(255,255,255,.6)', fontSize: '.9rem', fontWeight: 500 }}>
          Click any pin to explore Bible stories, history, and key scriptures.
        </p>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr clamp(260px,32%,360px)',
            gap: 24,
            alignItems: 'start',
          }}
        >
          {/* Leaflet Map */}
          <div
            style={{
              borderRadius: 20,
              overflow: 'hidden',
              border: '1.5px solid var(--border)',
              boxShadow: '0 8px 32px rgba(0,0,0,.1)',
              height: 560,
            }}
          >
            <MapContainer
              center={[31.5, 35.5]}
              zoom={7}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {loc && <FlyTo loc={loc} />}
              {LOCATIONS.map((l) => (
                <Marker
                  key={l.id}
                  position={[l.lat, l.lng]}
                  icon={makeIcon(l.color)}
                  eventHandlers={{ click: () => setActive(l.id) }}
                >
                  <Popup>
                    <div style={{ fontFamily: 'Poppins,sans-serif', minWidth: 160 }}>
                      <div style={{ fontWeight: 800, fontSize: '.95rem', marginBottom: 2 }}>
                        {l.name}
                      </div>
                      <div
                        style={{
                          fontSize: '.72rem',
                          color: l.color,
                          fontWeight: 700,
                          marginBottom: 6,
                        }}
                      >
                        {l.region}
                      </div>
                      <div style={{ fontSize: '.78rem', color: '#444', lineHeight: 1.5 }}>
                        {l.desc.slice(0, 100)}…
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Info panel */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 20,
              border: '1.5px solid var(--border)',
              boxShadow: '0 8px 32px rgba(0,0,0,.08)',
              padding: 24,
              position: 'sticky',
              top: 80,
              maxHeight: 560,
              overflowY: 'auto',
            }}
          >
            {!loc ? (
              <div>
                <div style={{ textAlign: 'center', padding: '16px 0 20px', color: 'var(--ink3)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: 8, opacity: 0.4 }}>🗺️</div>
                  <p style={{ fontSize: '.82rem', fontWeight: 500, lineHeight: 1.6 }}>
                    Click any pin on the map to explore its Bible stories and scriptures.
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {LOCATIONS.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setActive(l.id)}
                      style={{
                        fontSize: '.78rem',
                        fontWeight: 600,
                        padding: '9px 13px',
                        borderRadius: 10,
                        border: '1.5px solid var(--border)',
                        background: 'var(--bg2)',
                        color: 'var(--ink2)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        transition: 'all .15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = l.color;
                        e.currentTarget.style.background = 'var(--surface)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.background = 'var(--bg2)';
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          background: l.color,
                          flexShrink: 0,
                        }}
                      />
                      {l.name}
                      <span style={{ color: 'var(--ink3)', fontSize: '.7rem', marginLeft: 'auto' }}>
                        {l.region}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: 'inline-block',
                    fontSize: '.65rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: 100,
                    background: loc.color + '18',
                    color: loc.color,
                    marginBottom: 10,
                  }}
                >
                  {loc.region}
                </div>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    marginBottom: 8,
                  }}
                >
                  {loc.name}
                </div>
                <div
                  style={{
                    fontSize: '.83rem',
                    color: 'var(--ink2)',
                    lineHeight: 1.7,
                    fontWeight: 500,
                    marginBottom: 16,
                  }}
                >
                  {loc.desc}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 16 }}>
                  {loc.stories.map((s, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'var(--bg2)',
                        borderRadius: 12,
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 9,
                      }}
                    >
                      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{s.icon}</span>
                      <div>
                        <div
                          style={{
                            fontSize: '.8rem',
                            fontWeight: 700,
                            color: 'var(--ink)',
                            marginBottom: 2,
                          }}
                        >
                          {s.title}
                        </div>
                        <div style={{ fontSize: '.7rem', color: 'var(--blue)', fontWeight: 600 }}>
                          {s.ref}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    background: 'var(--green-bg)',
                    borderLeft: `3px solid ${loc.color}`,
                    borderRadius: '0 12px 12px 0',
                    padding: '10px 12px',
                    fontSize: '.78rem',
                    color: 'var(--ink2)',
                    fontStyle: 'italic',
                    fontWeight: 500,
                    marginBottom: 14,
                  }}
                >
                  {loc.verse}
                </div>
                <button
                  onClick={() => setActive(null)}
                  className="btn btn-outline"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '.8rem' }}
                >
                  ← All Locations
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
