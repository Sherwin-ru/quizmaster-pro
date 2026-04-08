import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, collection, query, getDocs, doc, getDoc, addDoc, updateDoc, serverTimestamp, Timestamp, onSnapshot, deleteDoc } from '../firebase';
import { Quiz, Question, UserProfile, Attempt } from '../types';
import { Timer, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function QuizTaking({ profile }: { profile: UserProfile }) {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [liveSessionId, setLiveSessionId] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!quizId) return;
      
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      if (!quizDoc.exists()) return navigate('/');
      
      const quizData = { id: quizDoc.id, ...quizDoc.data() } as Quiz;
      setQuiz(quizData);
      setTimeLeft(quizData.timerMinutes * 60);

      const qSnap = await getDocs(query(collection(db, `quizzes/${quizId}/questions`)));
      const qData = qSnap.docs.map(d => ({ id: d.id, ...d.data() } as Question)).sort((a, b) => a.order - b.order);
      setQuestions(qData);

      // Create attempt
      const attemptRef = await addDoc(collection(db, 'attempts'), {
        quizId,
        userId: profile.uid,
        userName: profile.displayName,
        score: 0,
        totalQuestions: qData.length,
        startTime: serverTimestamp(),
        status: 'in-progress'
      });
      setAttemptId(attemptRef.id);

      // Create live session
      const liveRef = await addDoc(collection(db, 'live_sessions'), {
        quizId,
        userId: profile.uid,
        userName: profile.displayName,
        lastActive: serverTimestamp()
      });
      setLiveSessionId(liveRef.id);

      setLoading(false);
    };

    fetchData();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (liveSessionId) deleteDoc(doc(db, 'live_sessions', liveSessionId));
    };
  }, [quizId, profile.uid, profile.displayName]);

  useEffect(() => {
    if (timeLeft > 0 && !loading && !submitting) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
        
        // Update live session heartbeat
        if (liveSessionId) {
          updateDoc(doc(db, 'live_sessions', liveSessionId), {
            lastActive: serverTimestamp()
          });
        }
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, loading, submitting, liveSessionId]);

  const handleSubmit = async () => {
    if (submitting || !attemptId) return;
    setSubmitting(true);

    let score = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correctOptionIndex) {
        score++;
      }
    });

    await updateDoc(doc(db, 'attempts', attemptId), {
      score,
      endTime: serverTimestamp(),
      status: 'completed'
    });

    if (liveSessionId) {
      await deleteDoc(doc(db, 'live_sessions', liveSessionId));
    }

    navigate(`/results/${attemptId}`);
  };

  if (loading || !quiz) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#2D3436] border-t-[#FF7675]"></div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header Info */}
      <div className="flex items-center justify-between bg-white border-4 border-[#2D3436] p-6 shadow-[8px_8px_0px_0px_rgba(45,52,54,1)]">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">{quiz.title}</h1>
          <p className="font-bold text-[#636E72]">Question {currentQuestionIndex + 1} of {questions.length}</p>
        </div>
        <div className={cn(
          "flex items-center gap-3 px-4 py-2 border-4 border-[#2D3436] font-black text-2xl",
          timeLeft < 60 ? "bg-[#FF7675] animate-pulse" : "bg-[#FFEAA7]"
        )}>
          <Timer size={24} />
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-6 bg-white border-4 border-[#2D3436] shadow-[4px_4px_0px_0px_rgba(45,52,54,1)]">
        <div 
          className="h-full bg-[#55EFC4] transition-all duration-500" 
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white border-4 border-[#2D3436] p-8 shadow-[12px_12px_0px_0px_rgba(45,52,54,1)] space-y-8">
        <h2 className="text-3xl font-black leading-tight">{currentQuestion.text}</h2>
        
        <div className="grid grid-cols-1 gap-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => setAnswers({ ...answers, [currentQuestionIndex]: index })}
              className={cn(
                "w-full text-left p-6 border-4 border-[#2D3436] font-bold text-xl transition-all flex items-center justify-between group",
                answers[currentQuestionIndex] === index 
                  ? "bg-[#A29BFE] translate-x-1 translate-y-1 shadow-none" 
                  : "bg-white hover:bg-[#FDF6E3] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(45,52,54,1)]"
              )}
            >
              <span>{option}</span>
              <div className={cn(
                "w-6 h-6 border-4 border-[#2D3436] rounded-full",
                answers[currentQuestionIndex] === index ? "bg-[#2D3436]" : "bg-transparent"
              )} />
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
          className="font-black text-lg disabled:opacity-30 hover:underline decoration-4 underline-offset-4"
        >
          PREVIOUS
        </button>
        
        {currentQuestionIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#55EFC4] border-4 border-[#2D3436] py-4 px-12 text-2xl font-black flex items-center gap-3 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(45,52,54,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
          >
            {submitting ? 'SUBMITTING...' : 'FINISH QUIZ'}
            <CheckCircle2 size={24} />
          </button>
        ) : (
          <button
            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            className="bg-[#2D3436] text-white border-4 border-[#2D3436] py-4 px-12 text-2xl font-black flex items-center gap-3 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(85,239,196,1)] active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
          >
            NEXT
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
