import { useState, useEffect } from 'react';
import { db, collection, query, getDocs, onSnapshot, where, deleteDoc, doc, Timestamp } from '../firebase';
import { Quiz, UserProfile, Attempt, LiveSession } from '../types';
import { Plus, Trash2, Play, Users, BarChart3, Clock, ChevronRight, Trophy, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

export default function AdminDashboard({ profile }: { profile: UserProfile }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'quizzes'));
    const unsubscribeQuizzes = onSnapshot(q, (snapshot) => {
      setQuizzes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz)));
      setLoading(false);
    });

    const unsubscribeAttempts = onSnapshot(collection(db, 'attempts'), (snapshot) => {
      setAttempts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attempt)));
    });

    const unsubscribeLive = onSnapshot(collection(db, 'live_sessions'), (snapshot) => {
      setLiveSessions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LiveSession)));
    });

    return () => {
      unsubscribeQuizzes();
      unsubscribeAttempts();
      unsubscribeLive();
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this quiz?')) {
      await deleteDoc(doc(db, 'quizzes', id));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">ADMIN DASHBOARD</h1>
          <p className="text-lg font-bold text-[#636E72]">Manage quizzes and monitor student performance in real-time.</p>
        </div>
        <Link 
          to="/admin/create"
          className="bg-[#A29BFE] border-4 border-[#2D3436] py-3 px-6 font-black flex items-center gap-2 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] transition-all"
        >
          <Plus size={20} />
          CREATE NEW QUIZ
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#55EFC4] border-4 border-[#2D3436] p-6 shadow-[8px_8px_0px_0px_rgba(45,52,54,1)]">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 size={32} />
            <span className="text-4xl font-black">{quizzes.length}</span>
          </div>
          <p className="font-black text-xl">TOTAL QUIZZES</p>
        </div>
        <div className="bg-[#FAB1A0] border-4 border-[#2D3436] p-6 shadow-[8px_8px_0px_0px_rgba(45,52,54,1)]">
          <div className="flex items-center justify-between mb-4">
            <Users size={32} />
            <span className="text-4xl font-black">{liveSessions.length}</span>
          </div>
          <p className="font-black text-xl">LIVE STUDENTS</p>
        </div>
        <div className="bg-[#FFEAA7] border-4 border-[#2D3436] p-6 shadow-[8px_8px_0px_0px_rgba(45,52,54,1)]">
          <div className="flex items-center justify-between mb-4">
            <Trophy size={32} />
            <span className="text-4xl font-black">{attempts.length}</span>
          </div>
          <p className="font-black text-xl">TOTAL ATTEMPTS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quizzes List */}
        <section className="bg-white border-4 border-[#2D3436] p-6 shadow-[8px_8px_0px_0px_rgba(45,52,54,1)]">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <ClipboardList size={24} />
            ACTIVE QUIZZES
          </h2>
          <div className="space-y-4">
            {quizzes.length === 0 ? (
              <p className="text-center py-8 font-bold text-[#B2BEC3]">No quizzes created yet.</p>
            ) : (
              quizzes.map(quiz => (
                <div key={quiz.id} className="border-4 border-[#2D3436] p-4 flex items-center justify-between hover:bg-[#FDF6E3] transition-colors">
                  <div>
                    <h3 className="font-black text-lg uppercase">{quiz.title}</h3>
                    <div className="flex items-center gap-3 text-sm font-bold text-[#636E72]">
                      <span className="flex items-center gap-1"><Clock size={14} /> {quiz.timerMinutes}m</span>
                      <span>•</span>
                      <span>{quiz.isPublished ? 'PUBLISHED' : 'DRAFT'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDelete(quiz.id)}
                      className="p-2 text-[#FF7675] hover:bg-[#FF7675] hover:text-white border-2 border-transparent hover:border-[#2D3436] rounded transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="bg-white border-4 border-[#2D3436] p-6 shadow-[8px_8px_0px_0px_rgba(45,52,54,1)]">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            <BarChart3 size={24} />
            RECENT RESULTS
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-4 border-[#2D3436]">
                  <th className="pb-3 font-black uppercase text-sm">Student</th>
                  <th className="pb-3 font-black uppercase text-sm">Quiz</th>
                  <th className="pb-3 font-black uppercase text-sm">Score</th>
                  <th className="pb-3 font-black uppercase text-sm">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#2D3436]">
                {attempts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center font-bold text-[#B2BEC3]">No attempts yet.</td>
                  </tr>
                ) : (
                  attempts.slice(0, 10).map(attempt => (
                    <tr key={attempt.id} className="hover:bg-[#FDF6E3]">
                      <td className="py-3 font-bold">{attempt.userName}</td>
                      <td className="py-3 font-bold">{quizzes.find(q => q.id === attempt.quizId)?.title || 'Deleted'}</td>
                      <td className="py-3">
                        <span className={cn(
                          "px-2 py-1 border-2 border-[#2D3436] font-black",
                          attempt.score / attempt.totalQuestions >= 0.7 ? "bg-[#55EFC4]" : "bg-[#FF7675]"
                        )}>
                          {attempt.score}/{attempt.totalQuestions}
                        </span>
                      </td>
                      <td className="py-3 text-sm font-bold text-[#636E72]">
                        {attempt.endTime ? format(attempt.endTime.toDate(), 'MMM d, HH:mm') : 'In Progress'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
