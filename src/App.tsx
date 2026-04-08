import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged, ensureUserExists, FirebaseUser } from './firebase';
import { UserProfile } from './types';
import { LogIn, LogOut, LayoutDashboard, ClipboardList, PlusCircle, Trophy, Timer, ChevronRight, CheckCircle2, XCircle, Users } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Components
import AdminDashboard from './components/AdminDashboard';
import StudentDashboard from './components/StudentDashboard';
import QuizTaking from './components/QuizTaking';
import QuizResults from './components/QuizResults';
import CreateQuiz from './components/CreateQuiz';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRole] = useState<'admin' | 'student' | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (signingIn) return;
    setSigningIn(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.code === 'auth/popup-blocked') {
        setAuthError("Popup blocked! Please allow popups for this site to sign in.");
      } else if (error.code === 'auth/cancelled-popup-request') {
        // This often happens if the user clicks multiple times, we can just ignore it or show a subtle message
        setAuthError("Sign-in request was cancelled. Please try again.");
      } else if (error.code === 'auth/popup-closed-by-user') {
        setAuthError("Sign-in window was closed before completion.");
      } else {
        setAuthError("An error occurred during sign-in. Please try again.");
      }
    } finally {
      setSigningIn(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const role = await ensureUserExists(firebaseUser);
        const userProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: role as 'admin' | 'student',
          createdAt: new Date()
        };
        setProfile(userProfile);
        setActiveRole(userProfile.role);
      } else {
        setUser(null);
        setProfile(null);
        setActiveRole(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF6E3]">
        <div className="animate-bounce text-4xl font-black text-[#2D3436] tracking-tighter">
          QUIZMASTER<span className="text-[#FF7675]">.</span>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#FDF6E3] font-sans text-[#2D3436]">
        {profile ? (
          <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 bg-white border-b-4 border-[#2D3436] px-6 py-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(45,52,54,1)]">
              <Link to="/" className="text-2xl font-black tracking-tighter hover:text-[#FF7675] transition-colors">
                QUIZMASTER<span className="text-[#FF7675]">.</span>
              </Link>
              <div className="flex items-center gap-6">
                <nav className="hidden md:flex items-center gap-4">
                  {activeRole === 'admin' ? (
                    <>
                      <Link to="/admin" className="font-bold hover:underline decoration-4 underline-offset-4">Dashboard</Link>
                      <Link to="/admin/create" className="font-bold hover:underline decoration-4 underline-offset-4">Create Quiz</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/student" className="font-bold hover:underline decoration-4 underline-offset-4">My Quizzes</Link>
                    </>
                  )}
                </nav>
                <div className="flex items-center gap-3 pl-6 border-l-2 border-[#2D3436]">
                  <button 
                    onClick={() => setActiveRole(activeRole === 'admin' ? 'student' : 'admin')}
                    className="px-3 py-1 bg-[#A29BFE] border-2 border-[#2D3436] text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(45,52,54,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
                    title="Dev Toggle: Switch Role"
                  >
                    Switch to {activeRole === 'admin' ? 'Student' : 'Admin'}
                  </button>
                  <img src={profile.photoURL || ''} alt="" className="w-10 h-10 rounded-full border-2 border-[#2D3436]" referrerPolicy="no-referrer" />
                  <div className="hidden sm:block">
                    <p className="text-sm font-black leading-none">{profile.displayName}</p>
                    <p className="text-xs font-bold text-[#636E72] uppercase tracking-wider">{activeRole}</p>
                  </div>
                  <button 
                    onClick={() => signOut(auth)}
                    className="p-2 hover:bg-[#FFEAA7] rounded-lg border-2 border-transparent hover:border-[#2D3436] transition-all"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </div>
            </header>

            <main className="flex-1 container mx-auto px-6 py-8">
              <Routes>
                <Route path="/" element={<Navigate to={activeRole === 'admin' ? "/admin" : "/student"} />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={activeRole === 'admin' ? <AdminDashboard profile={profile} /> : <Navigate to="/" />} />
                <Route path="/admin/create" element={activeRole === 'admin' ? <CreateQuiz profile={profile} /> : <Navigate to="/" />} />
                
                {/* Student Routes */}
                <Route path="/student" element={activeRole === 'student' ? <StudentDashboard profile={profile} /> : <Navigate to="/" />} />
                <Route path="/quiz/:quizId" element={<QuizTaking profile={profile} />} />
                <Route path="/results/:attemptId" element={<QuizResults profile={profile} />} />
                
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(#FF7675_1px,transparent_1px)] [background-size:20px_20px]">
            <div className="max-w-md w-full bg-white border-4 border-[#2D3436] p-10 shadow-[12px_12px_0px_0px_rgba(45,52,54,1)] text-center">
              <h1 className="text-5xl font-black mb-4 tracking-tighter">
                QUIZMASTER<span className="text-[#FF7675]">.</span>
              </h1>
              <p className="text-xl font-bold text-[#636E72] mb-8">
                The ultimate platform for real-time quizzes and instant results.
              </p>
              {authError && (
                <div className="mb-6 p-4 bg-[#FF7675] border-4 border-[#2D3436] font-bold text-sm shadow-[4px_4px_0px_0px_rgba(45,52,54,1)]">
                  {authError}
                </div>
              )}
              <button 
                onClick={handleSignIn}
                disabled={signingIn}
                className="w-full bg-[#55EFC4] border-4 border-[#2D3436] py-4 px-8 text-xl font-black flex items-center justify-center gap-3 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(45,52,54,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none"
              >
                <LogIn size={24} />
                {signingIn ? 'SIGNING IN...' : 'SIGN IN WITH GOOGLE'}
              </button>
              <p className="mt-6 text-sm font-bold text-[#B2BEC3]">
                By signing in, you agree to our terms of service.
              </p>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}
