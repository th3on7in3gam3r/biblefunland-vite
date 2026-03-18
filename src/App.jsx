import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import MusicPlayer from './components/MusicPlayer'
import PwaInstallBanner from './components/PwaInstallBanner'
import EmailPopup from './components/EmailPopup'
import BibleRadio from './components/BibleRadio'
import CookieConsent from './components/CookieConsent'
import { PageLoader } from './components/Skeleton'
import Home from './pages/Home'
import Auth from './pages/Auth'
import AdminLogin from './pages/AdminLogin'
import NotFound from './pages/NotFound'

// Providers
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { MusicProvider } from './context/MusicContext'
import { StreakProvider } from './context/StreakContext'
import { LanguageProvider } from './i18n/LanguageContext'
import { AdsProvider } from './context/AdsContext'
import { BadgeProvider } from './context/BadgeContext'
import { KidsModeProvider, useKidsMode, KIDS_HIDDEN_ROUTES } from './context/KidsModeContext'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'

// Lazy pages
const lazy_ = (fn) => lazy(fn)
const Trivia=lazy_(()=>import('./pages/Trivia'))
const Devotional=lazy_(()=>import('./pages/Devotional'))
const BibleMap=lazy_(()=>import('./pages/BibleMap'))
const Flashcards=lazy_(()=>import('./pages/Flashcards'))
const SermonNotes=lazy_(()=>import('./pages/SermonNotes'))
const ShareCards=lazy_(()=>import('./pages/ShareCards'))
const Premium=lazy_(()=>import('./pages/Premium'))
const Videos=lazy_(()=>import('./pages/Videos'))
const Blog=lazy_(()=>import('./pages/Blog'))
const PrayerWall=lazy_(()=>import('./pages/PrayerWallRealtime'))
const Dashboard=lazy_(()=>import('./pages/Dashboard'))
const Admin=lazy_(()=>import('./pages/Admin'))
const Profile=lazy_(()=>import('./pages/Profile'))
const DavidGoliath=lazy_(()=>import('./pages/DavidGoliath'))
const BibleCharacterChat=lazy_(()=>import('./pages/BibleCharacterChat'))
const DailyChallenge=lazy_(()=>import('./pages/DailyChallenge'))
const ChatRooms=lazy_(()=>import('./pages/ChatRooms'))
const FamilyGroups=lazy_(()=>import('./pages/FamilyGroups'))
const ChurchCalendar=lazy_(()=>import('./pages/ChurchCalendar'))
const ActivitySheets=lazy_(()=>import('./pages/ActivitySheets'))
const PrivacyPolicy=lazy_(()=>import('./pages/PrivacyPolicy'))
const TermsOfService=lazy_(()=>import('./pages/TermsOfService'))
const Contact=lazy_(()=>import('./pages/Contact'))
// v8 — Never Done Before
const BibleRapGenerator=lazy_(()=>import('./pages/BibleRapGenerator'))
const BibleCharacterQuiz=lazy_(()=>import('./pages/BibleCharacterQuiz'))
const VoiceBibleReader=lazy_(()=>import('./pages/VoiceBibleReader'))
const GlobalPrayerMap=lazy_(()=>import('./pages/GlobalPrayerMap'))
const ScriptureRunner=lazy_(()=>import('./pages/ScriptureRunner'))
const ParableEscapeRoom=lazy_(()=>import('./pages/ParableEscapeRoom'))
const SpinTheVerse=lazy_(()=>import('./pages/SpinTheVerse'))
const BibleMiracleArt=lazy_(()=>import('./pages/BibleMiracleArt'))
const EncouragementWall=lazy_(()=>import('./pages/EncouragementWall'))
const DigitalPrayerBeads=lazy_(()=>import('./pages/DigitalPrayerBeads'))
const BibleCertification=lazy_(()=>import('./pages/BibleCertification'))
// v9 — New features
const BibleBookExplorer=lazy_(()=>import('./pages/BibleBookExplorer'))
const BibleReadingPlan=lazy_(()=>import('./pages/BibleReadingPlan'))
const Achievements=lazy_(()=>import('./pages/Achievements'))

// ── v10 Features ──────────────────────────────────────────────────────────────
const AIPrayerCompanion=lazy_(()=>import('./pages/AIPrayerCompanion'))
const PrayForTheWorld=lazy_(()=>import('./pages/PrayForTheWorld'))
const OriginalLanguageExplorer=lazy_(()=>import('./pages/OriginalLanguageExplorer'))
const ScriptureCrossReference=lazy_(()=>import('./pages/ScriptureCrossReference'))
const BibleStudyGenerator=lazy_(()=>import('./pages/BibleStudyGenerator'))
const TestimonyArchive=lazy_(()=>import('./pages/TestimonyArchive'))
const BibleTimeline=lazy_(()=>import('./pages/BibleTimeline'))
const WallpaperMaker=lazy_(()=>import('./pages/WallpaperMaker'))
const ScriptureMemoryLeague=lazy_(()=>import('./pages/ScriptureMemoryLeague'))
const BibleBattleArena=lazy_(()=>import('./pages/BibleBattleArena'))
const BibleSearch=lazy_(()=>import('./pages/BibleSearch'))

const SP = ({c:C}) => <Suspense fallback={<PageLoader/>}><C/></Suspense>

export default function App() {
  return (
    <ThemeProvider><LanguageProvider><AuthProvider><StreakProvider><MusicProvider>
    <BadgeProvider><KidsModeProvider><AdsProvider>
      <AppContent />
    </AdsProvider></KidsModeProvider></BadgeProvider>
    </MusicProvider></StreakProvider></AuthProvider></LanguageProvider></ThemeProvider>
  )
}

function AppContent() {
  const { kidsMode } = useKidsMode()
  return (
    <Suspense fallback={<PageLoader/>}>
      <div className="app-shell">
        <Nav/>
        <PwaInstallBanner/>
        <EmailPopup/>
        <CookieConsent onConsent={()=>{}}/>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/auth" element={<Auth/>}/>
            <Route path="/admin/login" element={<AdminLogin/>}/>

            {[
              { path: '/trivia', element: <SP c={Trivia}/> },
              { path: '/devotional', element: <SP c={Devotional}/> },
              { path: '/map', element: <SP c={BibleMap}/> },
              { path: '/flashcards', element: <SP c={Flashcards}/> },
              { path: '/notes', element: <SP c={SermonNotes}/> },
              { path: '/share', element: <SP c={ShareCards}/> },
              { path: '/videos', element: <SP c={Videos}/> },
              { path: '/blog', element: <SP c={Blog}/> },
              { path: '/activity-sheets', element: <SP c={ActivitySheets}/> },
              { path: '/bible', element: <SP c={BibleBookExplorer}/> },
              { path: '/reading-plan', element: <SP c={BibleReadingPlan}/> },
              { path: '/game/david-goliath', element: <SP c={DavidGoliath}/> },
              { path: '/game/runner', element: <SP c={ScriptureRunner}/> },
              { path: '/game/escape-room', element: <SP c={ParableEscapeRoom}/> },
              { path: '/game/spin-the-verse', element: <SP c={SpinTheVerse}/> },
              { path: '/challenge', element: <SP c={DailyChallenge}/> },
              { path: '/chat/characters', element: <SP c={BibleCharacterChat}/> },
              { path: '/ai/rap-generator', element: <SP c={BibleRapGenerator}/> },
              { path: '/ai/miracle-art', element: <SP c={BibleMiracleArt}/> },
              { path: '/quiz/character', element: <SP c={BibleCharacterQuiz}/> },
              { path: '/voice-reader', element: <SP c={VoiceBibleReader}/> },
              { path: '/prayer-map', element: <SP c={GlobalPrayerMap}/> },
              { path: '/prayer', element: <SP c={PrayerWall}/> },
              { path: '/prayer-beads', element: <SP c={DigitalPrayerBeads}/> },
              { path: '/encouragement', element: <SP c={EncouragementWall}/> },
              { path: '/certification', element: <SP c={BibleCertification}/> },
              { path: '/community/chat', element: <SP c={ChatRooms}/> },
              { path: '/community/family', element: <SP c={FamilyGroups}/> },
              { path: '/community/events', element: <SP c={ChurchCalendar}/> },
              { path: '/ai/prayer-companion', element: <SP c={AIPrayerCompanion}/> },
              { path: '/pray-for-world', element: <SP c={PrayForTheWorld}/> },
              { path: '/ai/study-generator', element: <SP c={BibleStudyGenerator}/> },
              { path: '/language-explorer', element: <SP c={OriginalLanguageExplorer}/> },
              { path: '/cross-reference', element: <SP c={ScriptureCrossReference}/> },
              { path: '/timeline', element: <SP c={BibleTimeline}/> },
              { path: '/bible-search', element: <SP c={BibleSearch}/> },
              { path: '/testimony', element: <SP c={TestimonyArchive}/> },
              { path: '/wallpaper', element: <SP c={WallpaperMaker}/> },
              { path: '/game/memory-league', element: <SP c={ScriptureMemoryLeague}/> },
              { path: '/game/battle-arena', element: <SP c={BibleBattleArena}/> },
              { path: '/privacy', element: <SP c={PrivacyPolicy}/> },
              { path: '/terms', element: <SP c={TermsOfService}/> },
              { path: '/contact', element: <SP c={Contact}/> },
              { path: '/premium', element: <SP c={Premium}/> },
            ].map((r, i) => (
              (!kidsMode || !KIDS_HIDDEN_ROUTES.includes(r.path)) && (
                <Route key={i} path={r.path} element={r.element} />
              )
            ))}

            <Route element={<PrivateRoute/>}>
              <Route path="/dashboard"    element={<SP c={Dashboard}/>}/>
              <Route path="/profile"      element={<SP c={Profile}/>}/>
              <Route path="/achievements" element={<SP c={Achievements}/>}/>
            </Route>
            <Route element={<AdminRoute/>}>
              <Route path="/admin" element={<SP c={Admin}/>}/>
            </Route>

            <Route path="*" element={<NotFound/>}/>
          </Routes>
        </main>
        <Footer/><MusicPlayer/><BibleRadio/>
      </div>
    </Suspense>
  )
}
