import { useState } from 'react';

const COURSES = [
  {
    id: 'old-testament',
    title: 'Old Testament Foundations',
    emoji: '📜',
    color: '#F59E0B',
    bg: '#FFFBEB',
    desc: 'Genesis through Malachi — creation, the patriarchs, the Exodus, the kingdom, and the prophets.',
    lessons: [
      {
        title: 'Creation & The Fall',
        key: 'gen',
        summary:
          'In the beginning God created the heavens and the earth. He made man in His image. But Adam and Eve sinned, introducing separation from God.',
      },
      {
        title: 'Abraham, Isaac & Jacob',
        key: 'pat',
        summary:
          'God called Abraham from Ur and made a covenant — from his family, all nations would be blessed. The lineage continued through Isaac, then Jacob (Israel).',
      },
      {
        title: 'Moses & The Exodus',
        key: 'exo',
        summary:
          'Israel cried out from slavery in Egypt. God called Moses from a burning bush and performed 10 plagues. The Red Sea parted. The Law was given at Sinai.',
      },
      {
        title: 'Judges, Kings & Prophets',
        key: 'kng',
        summary:
          'After Joshua, Israel cycled through rebellion and rescue. Saul, David, and Solomon ruled. The kingdom split. The prophets called Israel back to God.',
      },
      {
        title: 'Exile & Return',
        key: 'exl',
        summary:
          "Israel's unfaithfulness led to Babylonian exile. But God restored them — Ezra, Nehemiah, and Esther's stories all happen here. The prophets foretold a coming Messiah.",
      },
    ],
    quiz: [
      {
        q: 'Who did God command to build the Ark?',
        options: ['Abraham', 'Moses', 'Noah', 'David'],
        correct: 2,
      },
      {
        q: 'What was the first plague God sent on Egypt?',
        options: ['Frogs', 'Darkness', 'Blood', 'Locusts'],
        correct: 2,
      },
      {
        q: 'Which king built the Temple in Jerusalem?',
        options: ['David', 'Saul', 'Solomon', 'Rehoboam'],
        correct: 2,
      },
      {
        q: 'Who was the first judge of Israel after Joshua?',
        options: ['Samson', 'Gideon', 'Othniel', 'Deborah'],
        correct: 2,
      },
      {
        q: 'The book of Psalms was primarily written by which king?',
        options: ['Solomon', 'David', 'Josiah', 'Hezekiah'],
        correct: 1,
      },
    ],
  },
  {
    id: 'life-of-jesus',
    title: 'The Life of Jesus',
    emoji: '✝️',
    color: '#3B82F6',
    bg: '#EFF6FF',
    desc: 'From the manger in Bethlehem to the empty tomb — the life, miracles, teachings, and resurrection of Jesus.',
    lessons: [
      {
        title: 'Birth & Early Life',
        key: 'bir',
        summary:
          "Jesus was born of a virgin in Bethlehem. Wise men followed a star. He fled to Egypt and grew up in Nazareth as a carpenter's son.",
      },
      {
        title: 'Baptism, Temptation & Ministry',
        key: 'min',
        summary:
          'John baptized Jesus in the Jordan. The Spirit descended like a dove. Jesus was tempted 40 days in the wilderness, then began His ministry in Galilee.',
      },
      {
        title: 'The Parables & Teachings',
        key: 'tea',
        summary:
          'Jesus taught in parables — the Prodigal Son, the Good Samaritan, the Sower, the Lost Sheep. The Sermon on the Mount is the greatest sermon ever preached.',
      },
      {
        title: 'Miracles & Controversies',
        key: 'mir',
        summary:
          'Jesus healed the blind, walked on water, raised Lazarus from the dead, and fed 5,000. The religious leaders opposed Him at every turn.',
      },
      {
        title: 'The Cross & Resurrection',
        key: 'res',
        summary:
          'Jesus was betrayed, crucified, buried — and on the third day rose from the dead. He appeared to over 500 people before ascending to the Father.',
      },
    ],
    quiz: [
      {
        q: 'Where was Jesus born?',
        options: ['Jerusalem', 'Nazareth', 'Bethlehem', 'Jericho'],
        correct: 2,
      },
      {
        q: 'How many days did Jesus fast in the wilderness?',
        options: ['30', '40', '3', '7'],
        correct: 1,
      },
      {
        q: 'Which disciple walked on water with Jesus?',
        options: ['John', 'James', 'Peter', 'Andrew'],
        correct: 2,
      },
      {
        q: 'Jesus raised which man from the dead after 4 days?',
        options: ['Jairus', 'Stephen', 'Lazarus', 'Nicodemus'],
        correct: 2,
      },
      {
        q: 'Who denied Jesus three times?',
        options: ['Judas', 'Thomas', 'John', 'Peter'],
        correct: 3,
      },
    ],
  },
];

export default function BibleCertification() {
  const [view, setView] = useState('home'); // home | course | quiz | certificate
  const [activeCourse, setActiveCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [lessonsDone, setLessonsDone] = useState({});
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizDone, setQuizDone] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [completed, setCompleted] = useState({});
  const [studentName, setStudentName] = useState(localStorage.getItem('bfl_student_name') || '');
  const [showNameInput, setShowNameInput] = useState(false);

  function startCourse(course) {
    setActiveCourse(course);
    setActiveLesson(0);
    setView('course');
    setLessonsDone((d) => ({ ...d }));
  }

  function completeLesson() {
    const key = `${activeCourse.id}-${activeLesson}`;
    setLessonsDone((d) => ({ ...d, [key]: true }));
    if (activeLesson < activeCourse.lessons.length - 1) {
      setActiveLesson((l) => l + 1);
    } else {
      // All lessons done, start quiz
      setView('quiz');
      setQuizAnswers([]);
      setQuizDone(false);
      setQuizScore(0);
    }
  }

  function answerQuiz(qIdx, aIdx) {
    const newAnswers = [...quizAnswers];
    newAnswers[qIdx] = aIdx;
    setQuizAnswers(newAnswers);
  }

  function submitQuiz() {
    const score = activeCourse.quiz.reduce(
      (s, q, i) => s + (quizAnswers[i] === q.correct ? 1 : 0),
      0
    );
    setQuizScore(score);
    setQuizDone(true);
    const passed = score >= 4;
    if (passed) {
      setCompleted((c) => ({
        ...c,
        [activeCourse.id]: { score, date: new Date().toLocaleDateString() },
      }));
    }
  }

  const course = activeCourse;
  const lesson = course?.lessons[activeLesson];
  const allLessonsDone = course && course.lessons.every((_, i) => lessonsDone[`${course.id}-${i}`]);

  function printCertificate(c, comp) {
    const name = studentName || 'Faithful Student';
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>Certificate - ${c.title}</title>
    <style>
      body{font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#FFF8F0;}
      .cert{width:780px;padding:60px;border:8px double #F59E0B;background:white;text-align:center;position:relative;}
      .cross{font-size:60px;margin-bottom:10px;}
      .site{font-size:13px;color:#888;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;}
      h1{font-size:14px;color:#888;text-transform:uppercase;letter-spacing:3px;margin:0 0 24px;}
      .divider{width:120px;height:2px;background:#F59E0B;margin:0 auto 24px;}
      .presented{font-size:13px;color:#666;margin-bottom:12px;}
      .name{font-size:42px;color:#1A1A1A;margin:0 0 6px;font-style:italic;}
      .completed{font-size:13px;color:#666;margin-bottom:10px;}
      .course{font-size:22px;color:#1E40AF;font-weight:bold;margin-bottom:20px;}
      .score{font-size:13px;color:#888;margin-bottom:28px;}
      .verse{font-size:13px;color:#666;font-style:italic;max-width:420px;margin:0 auto 28px;line-height:1.6;}
      .footer{display:flex;justify-content:space-between;margin-top:40px;padding-top:16px;border-top:1px solid #eee;}
      .sig{font-size:12px;color:#888;}
    </style></head><body>
    <div class="cert">
      <div class="cross">✝️</div>
      <div class="site">BibleFunLand.com</div>
      <h1>Certificate of Completion</h1>
      <div class="divider"></div>
      <div class="presented">This certifies that</div>
      <div class="name">${name}</div>
      <div class="completed">has successfully completed</div>
      <div class="course">${c.title}</div>
      <div class="score">Quiz Score: ${comp.score}/5 · Completed: ${comp.date}</div>
      <div class="verse">"Your word is a lamp to my feet and a light to my path." — Psalm 119:105</div>
      <div class="footer">
        <div class="sig">BibleFunLand Academy</div>
        <div class="sig">${comp.date}</div>
        <div class="sig">Score: ${comp.score}/5 (${Math.round((comp.score / 5) * 100)}%)</div>
      </div>
    </div></body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'Poppins,sans-serif' }}>
      <div
        style={{
          background: 'linear-gradient(135deg,#0F0F1A,#1E1B4B)',
          padding: '52px 36px 40px',
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontFamily: "'Baloo 2',cursive",
            fontSize: 'clamp(2rem,5vw,3.5rem)',
            fontWeight: 800,
            background: 'linear-gradient(90deg,#FCD34D,#60A5FA,#A5B4FC)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 8,
          }}
        >
          🎓 Bible Certification
        </h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: '.92rem', fontWeight: 500 }}>
          Complete courses, pass tests, earn printable certificates. Real structured learning —
          free.
        </p>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '36px 20px' }}>
        {view === 'home' && (
          <div>
            {/* Student name */}
            {!studentName ? (
              <div
                style={{
                  background: 'var(--blue-bg)',
                  border: '1.5px solid rgba(59,130,246,.2)',
                  borderRadius: 14,
                  padding: '14px 20px',
                  marginBottom: 24,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '.88rem', color: 'var(--ink2)', fontWeight: 500 }}>
                  Enter your name to personalize your certificates:
                </span>
                <input
                  className="input-field"
                  placeholder="Your name"
                  style={{ flex: 1, maxWidth: 240 }}
                  id="nameField"
                />
                <button
                  className="btn btn-blue btn-sm"
                  onClick={() => {
                    const v = document.getElementById('nameField').value;
                    if (v) {
                      setStudentName(v);
                      localStorage.setItem('bfl_student_name', v);
                    }
                  }}
                >
                  Save
                </button>
              </div>
            ) : (
              <div style={{ fontSize: '.84rem', color: 'var(--ink3)', marginBottom: 20 }}>
                👋 Welcome, <strong style={{ color: 'var(--blue)' }}>{studentName}</strong> ·{' '}
                <button
                  onClick={() => setStudentName('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--blue)',
                    cursor: 'pointer',
                    fontSize: '.84rem',
                    fontWeight: 600,
                  }}
                >
                  Change name
                </button>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }}>
              {COURSES.map((c) => {
                const comp = completed[c.id];
                return (
                  <div
                    key={c.id}
                    style={{
                      background: 'var(--surface)',
                      borderRadius: 24,
                      border: `1.5px solid ${comp ? 'var(--green)' : 'var(--border)'}`,
                      boxShadow: comp ? '0 0 0 4px rgba(16,185,129,.08)' : 'var(--sh)',
                      overflow: 'hidden',
                      transition: 'all .28s',
                    }}
                  >
                    <div
                      style={{
                        background: `linear-gradient(135deg,${c.color}22,${c.color}08)`,
                        padding: '28px 26px',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      <div style={{ fontSize: '3rem', marginBottom: 10 }}>{c.emoji}</div>
                      <div
                        style={{
                          fontFamily: "'Baloo 2',cursive",
                          fontSize: '1.2rem',
                          fontWeight: 800,
                          color: c.color,
                          marginBottom: 6,
                        }}
                      >
                        {c.title}
                      </div>
                      <div
                        style={{
                          fontSize: '.82rem',
                          color: 'var(--ink2)',
                          fontWeight: 500,
                          lineHeight: 1.65,
                        }}
                      >
                        {c.desc}
                      </div>
                    </div>
                    <div style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                        <span
                          style={{
                            fontSize: '.7rem',
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 100,
                            background: 'var(--bg2)',
                            color: 'var(--ink3)',
                          }}
                        >
                          📚 {c.lessons.length} Lessons
                        </span>
                        <span
                          style={{
                            fontSize: '.7rem',
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 100,
                            background: 'var(--bg2)',
                            color: 'var(--ink3)',
                          }}
                        >
                          📝 5-Question Quiz
                        </span>
                        <span
                          style={{
                            fontSize: '.7rem',
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: 100,
                            background: 'var(--bg2)',
                            color: 'var(--ink3)',
                          }}
                        >
                          🖨️ Certificate
                        </span>
                      </div>
                      {comp ? (
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          <div
                            style={{
                              fontSize: '.8rem',
                              fontWeight: 700,
                              color: 'var(--green)',
                              flex: 1,
                            }}
                          >
                            ✅ Passed · {comp.score}/5 · {comp.date}
                          </div>
                          <button
                            className="btn btn-green btn-sm"
                            onClick={() => printCertificate(c, comp)}
                          >
                            🖨️ Print Certificate
                          </button>
                          <button className="btn btn-outline btn-sm" onClick={() => startCourse(c)}>
                            Retake
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-sm"
                          style={{
                            background: `linear-gradient(135deg,${c.color},${c.color}cc)`,
                            color: 'white',
                            border: 'none',
                            width: '100%',
                            justifyContent: 'center',
                          }}
                          onClick={() => startCourse(c)}
                        >
                          🎓 Start Course →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === 'course' && course && lesson && (
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => setView('home')}
              style={{ marginBottom: 20 }}
            >
              ← All Courses
            </button>
            {/* Progress */}
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '.76rem',
                  fontWeight: 700,
                  color: 'var(--ink3)',
                  marginBottom: 7,
                }}
              >
                <span>
                  {course.emoji} {course.title}
                </span>
                <span>
                  Lesson {activeLesson + 1}/{course.lessons.length}
                </span>
              </div>
              <div
                style={{
                  height: 7,
                  borderRadius: 100,
                  background: 'var(--bg3)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    borderRadius: 100,
                    background: `linear-gradient(90deg,${course.color},${course.color}99)`,
                    width: `${((activeLesson + 1) / course.lessons.length) * 100}%`,
                    transition: 'width .5s ease',
                  }}
                />
              </div>
            </div>
            <div
              style={{
                background: 'var(--surface)',
                borderRadius: 24,
                border: '1.5px solid var(--border)',
                boxShadow: 'var(--sh)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: `linear-gradient(135deg,${course.color}22,${course.color}08)`,
                  padding: '26px 30px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    fontSize: '.72rem',
                    fontWeight: 700,
                    color: course.color,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  Lesson {activeLesson + 1}
                </div>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1.4rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                  }}
                >
                  {lesson.title}
                </div>
              </div>
              <div style={{ padding: '28px 30px' }}>
                <p
                  style={{
                    fontSize: '.92rem',
                    color: 'var(--ink2)',
                    lineHeight: 1.85,
                    fontWeight: 500,
                    marginBottom: 28,
                  }}
                >
                  {lesson.summary}
                </p>
                <button
                  className="btn btn-sm"
                  style={{
                    background: `linear-gradient(135deg,${course.color},${course.color}bb)`,
                    color: 'white',
                    border: 'none',
                  }}
                  onClick={completeLesson}
                >
                  {activeLesson < course.lessons.length - 1
                    ? 'Next Lesson →'
                    : '📝 Take the Quiz →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'quiz' && course && (
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            {!quizDone ? (
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 24,
                  border: '1.5px solid var(--border)',
                  boxShadow: 'var(--sh)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    background: `linear-gradient(135deg,${course.color}22,${course.color}08)`,
                    padding: '24px 30px',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Baloo 2',cursive",
                      fontSize: '1.3rem',
                      fontWeight: 800,
                      color: 'var(--ink)',
                    }}
                  >
                    📝 {course.title} — Quiz
                  </div>
                  <div
                    style={{
                      fontSize: '.8rem',
                      color: 'var(--ink3)',
                      fontWeight: 500,
                      marginTop: 4,
                    }}
                  >
                    Answer all 5 questions. You need 4/5 to earn your certificate.
                  </div>
                </div>
                <div
                  style={{
                    padding: '24px 30px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 24,
                  }}
                >
                  {course.quiz.map((q, qi) => (
                    <div key={qi}>
                      <div
                        style={{
                          fontFamily: "'Baloo 2',cursive",
                          fontSize: '1rem',
                          fontWeight: 700,
                          color: 'var(--ink)',
                          marginBottom: 12,
                        }}
                      >
                        {qi + 1}. {q.q}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                        {q.options.map((opt, oi) => (
                          <button
                            key={oi}
                            onClick={() => answerQuiz(qi, oi)}
                            style={{
                              padding: '11px 14px',
                              borderRadius: 12,
                              textAlign: 'left',
                              cursor: 'pointer',
                              border: `2px solid ${quizAnswers[qi] === oi ? course.color : 'var(--border)'}`,
                              background:
                                quizAnswers[qi] === oi ? course.color + '18' : 'var(--bg2)',
                              color: quizAnswers[qi] === oi ? course.color : 'var(--ink2)',
                              fontSize: '.86rem',
                              fontWeight: quizAnswers[qi] === oi ? 700 : 500,
                              fontFamily: 'Poppins,sans-serif',
                              transition: 'all .2s',
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    className="btn"
                    style={{
                      background: `linear-gradient(135deg,${course.color},${course.color}bb)`,
                      color: 'white',
                      border: 'none',
                      justifyContent: 'center',
                    }}
                    onClick={submitQuiz}
                    disabled={
                      quizAnswers.length < course.quiz.length || quizAnswers.includes(undefined)
                    }
                  >
                    Submit Quiz →
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: 'var(--surface)',
                  borderRadius: 24,
                  border: `2px solid ${quizScore >= 4 ? 'var(--green)' : 'var(--orange)'}`,
                  boxShadow: 'var(--sh)',
                  padding: 36,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>
                  {quizScore >= 4 ? '🏆' : '📖'}
                </div>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: quizScore >= 4 ? 'var(--green)' : 'var(--orange)',
                    marginBottom: 8,
                  }}
                >
                  {quizScore}/5 — {Math.round((quizScore / 5) * 100)}%
                </div>
                <div
                  style={{
                    fontFamily: "'Baloo 2',cursive",
                    fontSize: '1.3rem',
                    fontWeight: 800,
                    color: 'var(--ink)',
                    marginBottom: 12,
                  }}
                >
                  {quizScore >= 4 ? 'Certificate Earned! 🎓' : 'Almost! Try Again 💪'}
                </div>
                <p
                  style={{
                    fontSize: '.88rem',
                    color: 'var(--ink2)',
                    lineHeight: 1.7,
                    marginBottom: 24,
                  }}
                >
                  {quizScore >= 4
                    ? `Congratulations, ${studentName || 'faithful student'}! You passed with ${quizScore}/5. Your certificate is ready to print!`
                    : "You need 4/5 to pass. Review the lessons and try again — you've got this!"}
                </p>
                <div
                  style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}
                >
                  {quizScore >= 4 && completed[course.id] && (
                    <button
                      className="btn btn-green"
                      onClick={() => printCertificate(course, completed[course.id])}
                    >
                      🖨️ Print Certificate
                    </button>
                  )}
                  {quizScore < 4 && (
                    <button
                      className="btn btn-orange"
                      onClick={() => {
                        setQuizAnswers([]);
                        setQuizDone(false);
                      }}
                    >
                      Retry Quiz
                    </button>
                  )}
                  <button className="btn btn-outline" onClick={() => setView('home')}>
                    ← All Courses
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
