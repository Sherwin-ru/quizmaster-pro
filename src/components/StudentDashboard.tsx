import { useState, useEffect } from 'react';
import { db, collection, query, getDocs, onSnapshot, where, Timestamp } from '../firebase';
import { Quiz, UserProfile, Attempt } from '../types';
import { Play, Clock, Trophy, ChevronRight, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function StudentDashboard({ profile }: { profile: UserProfile }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [myAttempts, setMyAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'quizzes'), where('isPublished', '==', true));
    const unsubscribeQuizzes = onSnapshot(q, (snapshot) => {
      setQuizzes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Quiz)));
      setLoading(false);
    });

    const aq = query(collection(db, 'attempts'), where('userId', '==', profile.uid));
    const unsubscribeAttempts = onSnapshot(aq, (snapshot) => {
      setMyAttempts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attempt)));
    });

    return () => {
      unsubscribeQuizzes();
      unsubscribeAttempts();
    };
  }, [profile.uid]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">STUDENT DASHBOARD</h1>
          <p className="text-lg font-bold text-[#636E72]">Welcome back, {profile.displayName}! Ready for a challenge?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Quizzes */}
        <section className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black flex items-center gap-2">
              <Play size={24} className="text-[#FF7675]" />
              AVAILABLE QUIZZES
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.length === 0 ? (
              <div className="md:col-span-2 bg-white border-4 border-[#2D3436] p-12 text-center shadow-[8px_8px_0px_0px_rgba(45,52,54,1)]">
                <p className="text-xl font-bold text-[#B2BEC3]">No quizzes available at the moment.</p>
              </div>
            ) : (
              quizzes.map(quiz => {
                const hasAttempted = myAttempts.some(a => a.quizId === quiz.id && a.status === 'completed');
                return (
                  <div key={quiz.id} className="bg-white border-4 border-[#2D3436] p-6 shadow-[8px_8px_0px_0px_rgba(45,52,54,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_0px_rgba(45,52,54,1)] transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-[#FFEAA7] border-2 border-[#2D3436] p-2">
                        <Clock size={20} />
                      </div>
                      {hasAttempted && (
                        <span className="bg-[#55EFC4] border-2 border-[#2D3436] px-2 py-0.5 text-xs font-black">COMPLETED</span>
                      )}
                    </div>
                    <h3 className="text-2xl font-black mb-2 uppercase tracking-tight leading-tight">{quiz.title}</h3>
                    <p className="text-[#636E72] font-bold mb-6 line-clamp-2">{quiz.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm">{quiz.timerMinutes} MINUTES</span>
                      <Link 
                        to={`/quiz/${quiz.id}`}
                        className="bg-[#FF7675] border-2 border-[#2D3436] px-4 py-2 font-black flex items-center gap-2 group-hover:bg-[#D63031] group-hover:text-white transition-colors"
                      >
                        {hasAttempted ? 'RETAKE' : 'START'}
                        <ChevronRight size={18} />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* My Stats & History */}
        <section className="space-y-6">
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Trophy size={24} className="text-[#FDCB6E]" />
            MY PERFORMANCE
          </h2>
          
          <div className="bg-white border-4 border-[#2D3436] p-6 shadow-[8px_8px_0px_0px_rgba(45,52,54,1)]">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-[#2D3436] pb-4">
                <span className="font-bold text-[#636E72]">Quizzes Taken</span>
                <span className="text-2xl font-black">{myAttempts.filter(a => a.status === 'completed').length}</span>
              </div>
              <div className="flex items-center justify-between border-b-2 border-[#2D3436] pb-4">
                <span className="font-bold text-[#636E72]">Avg. Score</span>
                <span className="text-2xl font-black">
                  {myAttempts.length > 0 
                    ? Math.round((myAttempts.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0) / myAttempts.length) * 100)
                    : 0}%
                </span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-black text-sm uppercase tracking-widest text-[#B2BEC3] mb-4">Recent History</h3>
              <div className="space-y-3">
                {myAttempts.slice(0, 5).map(attempt => (
                  <Link 
                    key={attempt.id} 
                    to={`/results/${attempt.id}`}
                    className="flex items-center justify-between p-3 border-2 border-[#2D3436] hover:bg-[#FDF6E3] transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-black text-xs uppercase truncate max-w-[120px]">
                        {quizzes.find(q => q.id === attempt.quizId)?.title || 'Quiz'}
                      </span>
                      <span className="text-[10px] font-bold text-[#636E72]">
                        {attempt.endTime ? format(attempt.endTime.toDate(), 'MMM d') : 'In Progress'}
                      </span>
                    </div>
                    <span className="font-black text-lg">{attempt.score}/{attempt.totalQuestions}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
