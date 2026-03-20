import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Nav from './components/Nav'
import Footer from './components/Footer'
import MusicPlayer from './components/MusicPlayer'
import PwaInstallBanner from './components/PwaInstallBanner'
import EmailPopup from './components/EmailPopup'
import BibleRadio from './components/BibleRadio'
import CookieConsent from './components/CookieConsent'
import ErrorBoundary from './components/ErrorBoundary'
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
import { KidsModeProvider } from './context/KidsModeContext'
import { ParentalControlsProvider } from './context/ParentalControlsContext'
import { ChildSwitcherProvider } from './context/ChildSwitcherContext'
import { ScriptureMemoryProvider } from './context/ScriptureMemoryContext'
import { EmailDigestProvider } from './context/EmailDigestContext'
import { TeacherClassroomProvider } from './context/TeacherClassroomContext'
import { BedtimeModeProvider } from './context/BedtimeModeContext'
import { ActivityDashboardProvider } from './context/ActivityDashboardContext'
import { AdvancedAnalyticsProvider } from './context/AdvancedAnalyticsContext'
import { FamilyChallengesProvider } from './context/FamilyChallengesContext'
import PrivateRoute from './components/PrivateRoute'
import AdminRoute from './components/AdminRoute'
import ParentalProtectedRoute from './components/ParentalProtectedRoute'

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
const Bedtime=lazy_(()=>import('./pages/Bedtime'))
const BedtimeSettings=lazy_(()=>import('./pages/BedtimeSettings'))

// ── v12 Features ──────────────────────────────────────────────────────────────
const SermonWriter=lazy_(()=>import('./pages/SermonWriter'))
const CouplesDevotional=lazy_(()=>import('./pages/CouplesDevotional'))
const ScriptureTyping=lazy_(()=>import('./pages/ScriptureTyping'))
const FastingTracker=lazy_(()=>import('./pages/FastingTracker'))
const BibleFamilyTree=lazy_(()=>import('./pages/BibleFamilyTree'))
const WorshipDiscovery=lazy_(()=>import('./pages/WorshipDiscovery'))
const ParentTeacherHub=lazy_(()=>import('./pages/ParentTeacherHub'))

// ── v11 Features ──────────────────────────────────────────────────────────────
const BibleWordle=lazy_(()=>import('./pages/BibleWordle'))
const PrayerJournal=lazy_(()=>import('./pages/PrayerJournal'))
const BiblePromises=lazy_(()=>import('./pages/BiblePromises'))
const SermonIllustrations=lazy_(()=>import('./pages/SermonIllustrations'))
const KidsBibleStories=lazy_(()=>import('./pages/KidsBibleStories'))
const ReadingStats=lazy_(()=>import('./pages/ReadingStats'))
const ProphecyFulfillment=lazy_(()=>import('./pages/ProphecyFulfillment'))

const SP = ({c:C}) => <Suspense fallback={<PageLoader/>}><C/></Suspense>

export default function App() {
  return (
    <ErrorBoundary>
    <ThemeProvider><LanguageProvider><AuthProvider><StreakProvider><MusicProvider>
    <BadgeProvider><KidsModeProvider><ParentalControlsProvider><ChildSwitcherProvider>
    <ScriptureMemoryProvider><EmailDigestProvider><TeacherClassroomProvider><BedtimeModeProvider>
    <ActivityDashboardProvider><AdvancedAnalyticsProvider><FamilyChallengesProvider><AdsProvider>
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

            {/* Learning */}
            <Route path="/trivia"          element={<ParentalProtectedRoute featureId="trivia"><SP c={Trivia}/></ParentalProtectedRoute>}/>
            <Route path="/devotional"      element={<SP c={Devotional}/>}/>
            <Route path="/map"             element={<SP c={BibleMap}/>}/>
            <Route path="/flashcards"      element={<SP c={Flashcards}/>}/>
            <Route path="/notes"           element={<SP c={SermonNotes}/>}/>
            <Route path="/share"           element={<SP c={ShareCards}/>}/>
            <Route path="/videos"          element={<SP c={Videos}/>}/>
            <Route path="/blog"            element={<SP c={Blog}/>}/>
            <Route path="/activity-sheets" element={<SP c={ActivitySheets}/>}/>

            {/* Bible reference */}
            <Route path="/bible"           element={<SP c={BibleBookExplorer}/>}/>
            <Route path="/reading-plan"    element={<SP c={BibleReadingPlan}/>}/>

            {/* Games */}
            <Route path="/game/david-goliath"  element={<SP c={DavidGoliath}/>}/>
            <Route path="/game/runner"         element={<SP c={ScriptureRunner}/>}/>
            <Route path="/game/escape-room"    element={<SP c={ParableEscapeRoom}/>}/>
            <Route path="/game/spin-the-verse" element={<SP c={SpinTheVerse}/>}/>
            <Route path="/challenge"           element={<SP c={DailyChallenge}/>}/>

            {/* AI */}
            <Route path="/chat/characters"  element={<SP c={BibleCharacterChat}/>}/>
            <Route path="/ai/rap-generator" element={<ParentalProtectedRoute featureId="rap"><SP c={BibleRapGenerator}/></ParentalProtectedRoute>}/>
            <Route path="/ai/miracle-art"   element={<ParentalProtectedRoute featureId="art"><SP c={BibleMiracleArt}/></ParentalProtectedRoute>}/>

            {/* Never Done Before */}
            <Route path="/quiz/character"   element={<SP c={BibleCharacterQuiz}/>}/>
            <Route path="/voice-reader"     element={<SP c={VoiceBibleReader}/>}/>
            <Route path="/prayer-map"       element={<SP c={GlobalPrayerMap}/>}/>

            {/* Soul */}
            <Route path="/prayer"           element={<SP c={PrayerWall}/>}/>
            <Route path="/prayer-beads"     element={<SP c={DigitalPrayerBeads}/>}/>
            <Route path="/encouragement"    element={<SP c={EncouragementWall}/>}/>
            <Route path="/certification"    element={<SP c={BibleCertification}/>}/>
            <Route path="/bedtime"          element={<SP c={Bedtime}/>}/>

            {/* Community */}
            <Route path="/community/chat"   element={<SP c={ChatRooms}/>}/>
            <Route path="/community/family" element={<SP c={FamilyGroups}/>}/>
            <Route path="/community/events" element={<SP c={ChurchCalendar}/>}/>

            {/* v10 — AI & Prayer */}
            <Route path="/ai/prayer-companion"  element={<ParentalProtectedRoute featureId="prayer"><SP c={AIPrayerCompanion}/></ParentalProtectedRoute>}/>
            <Route path="/pray-for-world"       element={<SP c={PrayForTheWorld}/>}/>
            <Route path="/ai/study-generator"   element={<ParentalProtectedRoute featureId="study"><SP c={BibleStudyGenerator}/></ParentalProtectedRoute>}/>

            {/* v10 — Bible Tools */}
            <Route path="/language-explorer"    element={<SP c={OriginalLanguageExplorer}/>}/>
            <Route path="/cross-reference"      element={<SP c={ScriptureCrossReference}/>}/>
            <Route path="/timeline"             element={<SP c={BibleTimeline}/>}/>
            <Route path="/bible-search"         element={<SP c={BibleSearch}/>}/>

            {/* v10 — Community */}
            <Route path="/testimony"            element={<SP c={TestimonyArchive}/>}/>

            {/* v10 — Create */}
            <Route path="/wallpaper"            element={<SP c={WallpaperMaker}/>}/>

            {/* v10 — Games */}
            <Route path="/game/memory-league"   element={<SP c={ScriptureMemoryLeague}/>}/>
            <Route path="/game/battle-arena"    element={<SP c={BibleBattleArena}/>}/>

            {/* Legal */}
            <Route path="/privacy"  element={<SP c={PrivacyPolicy}/>}/>
            <Route path="/terms"    element={<SP c={TermsOfService}/>}/>
            <Route path="/contact"  element={<SP c={Contact}/>}/>
            <Route path="/premium"  element={<SP c={Premium}/>}/>

            {/* v12 — New Features */}
            <Route path="/sermon-writer"       element={<SP c={SermonWriter}/>}/>
            <Route path="/couples-devotional"  element={<SP c={CouplesDevotional}/>}/>
            <Route path="/scripture-typing"    element={<SP c={ScriptureTyping}/>}/>
            <Route path="/fasting"             element={<SP c={FastingTracker}/>}/>
            <Route path="/family-tree"         element={<SP c={BibleFamilyTree}/>}/>
            <Route path="/worship"             element={<SP c={WorshipDiscovery}/>}/>
            <Route path="/parent-hub"          element={<SP c={ParentTeacherHub}/>}/>

            {/* v11 — Daily & Discovery */}
            <Route path="/wordle"              element={<SP c={BibleWordle}/>}/>
            <Route path="/prayer-journal"      element={<SP c={PrayerJournal}/>}/>
            <Route path="/promises"             element={<SP c={BiblePromises}/>}/>
            <Route path="/sermon-illustrations" element={<SP c={SermonIllustrations}/>}/>
            <Route path="/kids-stories"         element={<SP c={KidsBibleStories}/>}/>
            <Route path="/reading-stats"        element={<SP c={ReadingStats}/>}/>
            <Route path="/prophecy"             element={<SP c={ProphecyFulfillment}/>}/>

            {/* Protected */}
            <Route element={<PrivateRoute/>}>
              <Route path="/dashboard"    element={<SP c={Dashboard}/>}/>
              <Route path="/profile"      element={<SP c={Profile}/>}/>
              <Route path="/bedtime-settings" element={<SP c={BedtimeSettings}/>}/>
              <Route path="/achievements" element={<SP c={Achievements}/>}/>
            </Route>
            <Route element={<AdminRoute/>}>
              <Route path="/admin" element={<SP c={Admin}/>}/>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound/>}/>
          </Routes>
        </main>
        <Footer/><MusicPlayer/><BibleRadio/>
      </div>
    </AdsProvider></FamilyChallengesProvider></AdvancedAnalyticsProvider></ActivityDashboardProvider></BedtimeModeProvider></TeacherClassroomProvider>
    </EmailDigestProvider></ScriptureMemoryProvider></ChildSwitcherProvider>
    </ParentalControlsProvider></KidsModeProvider></BadgeProvider>
    </MusicProvider></StreakProvider></AuthProvider></LanguageProvider></ThemeProvider>
    </ErrorBoundary>
  )
}
