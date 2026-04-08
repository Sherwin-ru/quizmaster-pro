import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, doc, getDoc } from '../firebase';
import { Quiz, Attempt, UserProfile } from '../types';
import { Trophy, Home, RotateCcw, Share2, CheckCircle2, XCircle, Award } from 'lucide-react';
import { cn } from '../lib/utils';

export default function QuizResults({ profile }: { profile: UserProfile }) {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!attemptId) return;
      
      const attemptDoc = await getDoc(doc(db, 'attempts', attemptId));
      if (!attemptDoc.exists()) return;
      
      const attemptData = { id: attemptDoc.id, ...attemptDoc.data() } as Attempt;
      setAttempt(attemptData);

      const quizDoc = await getDoc(doc(db, 'quizzes', attemptData.quizId));
      if (quizDoc.exists()) {
        setQuiz({ id: quizDoc.id, ...quizDoc.data() } as Quiz);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [attemptId]);

  if (loading || !attempt || !quiz) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2D3436] border-t-[#FF7675]"></div>
      </div>
    );
  }

  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
  const isPassed = percentage >= 70;

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <div className={cn(
        "bg-white border-4 border-[#2D3436] p-12 text-center shadow-[12px_12px_0px_0px_rgba(45,52,54,1)] relative overflow-hidden",
        isPassed ? "bg-[radial-gradient(#55EFC4_1px,transparent_1px)]" : "bg-[radial-gradient(#FF7675_1px,transparent_1px)]",
        "[background-size:20px_20px]"
      )}>
        <div className="relative z-10">
          <div className="inline-block p-6 bg-white border-4 border-[#2D3436] rounded-full mb-8 shadow-[4px_4px_0px_0px_rgba(45,52,54,1)]">
            {isPassed ? <Award size={64} className="text-[#FDCB6E]" /> : <RotateCcw size={64} className="text-[#FF7675]" />}
          </div>
          
          <h1 className="text-5xl font-black mb-2 tracking-tighter uppercase">
            {isPassed ? 'QUIZ PASSED!' : 'KEEP TRYING!'}
          </h1>
          <p className="text-2xl font-bold text-[#636E72] mb-8 uppercase tracking-widest">{quiz.title}</p>
          
          <div className="flex items-center justify-center gap-8 mb-12">
            <div className="text-center">
              <p className="text-6xl font-black leading-none mb-2">{attempt.score}</p>
              <p className="text-sm font-black text-[#636E72] uppercase tracking-widest">Score</p>
            </div>
            <div className="w-1 h-16 bg-[#2D3436]" />
            <div className="text-center">
              <p className="text-6xl font-black leading-none mb-2">{percentage}%</p>
              <p className="text-sm font-black text-[#636E72] uppercase tracking-widest">Accuracy</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              to="/student"
              className="bg-white border-4 border-[#2D3436] py-4 px-6 font-black flex items-center justify-center gap-2 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] transition-all"
            >
              <Home size={20} />
              DASHBOARD
            </Link>
            <Link 
              to={`/quiz/${quiz.id}`}
              className="bg-[#55EFC4] border-4 border-[#2D3436] py-4 px-6 font-black flex items-center justify-center gap-2 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] transition-all"
            >
              <RotateCcw size={20} />
              RETAKE QUIZ
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white border-4 border-[#2D3436] p-8 shadow-[8px_8px_0px_0px_rgba(45,52,54,1)]">
        <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Attempt Summary</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b-2 border-[#2D3436]">
            <span className="font-bold text-[#636E72]">Total Questions</span>
            <span className="font-black">{attempt.totalQuestions}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b-2 border-[#2D3436]">
            <span className="font-bold text-[#636E72]">Correct Answers</span>
            <span className="font-black text-[#00B894]">{attempt.score}</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b-2 border-[#2D3436]">
            <span className="font-bold text-[#636E72]">Incorrect Answers</span>
            <span className="font-black text-[#D63031]">{attempt.totalQuestions - attempt.score}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
