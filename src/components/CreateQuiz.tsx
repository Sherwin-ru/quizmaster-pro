import { useState } from 'react';
import { db, collection, addDoc, serverTimestamp } from '../firebase';
import { UserProfile, Question } from '../types';
import { Plus, Trash2, Save, AlertCircle, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateQuiz({ profile }: { profile: UserProfile }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timerMinutes, setTimerMinutes] = useState(10);
  const [questions, setQuestions] = useState<Partial<Question>[]>([
    { text: '', options: ['', '', '', ''], correctOptionIndex: 0 }
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const addQuestion = () => {
    if (questions.length < 10) {
      setQuestions([...questions, { text: '', options: ['', '', '', ''], correctOptionIndex: 0 }]);
    }
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQuestions = [...questions];
    const newOptions = [...(newQuestions[qIndex].options || [])];
    newOptions[oIndex] = value;
    newQuestions[qIndex].options = newOptions;
    setQuestions(newQuestions);
  };

  const handleSave = async () => {
    if (!title) return setError('Title is required');
    if (questions.length < 1) return setError('At least one question is required');
    if (questions.some(q => !q.text || q.options?.some(o => !o))) return setError('All questions and options must be filled');

    setSaving(true);
    setError('');

    try {
      const quizRef = await addDoc(collection(db, 'quizzes'), {
        title,
        description,
        timerMinutes,
        createdBy: profile.uid,
        createdAt: serverTimestamp(),
        isPublished: true,
        questionsCount: questions.length
      });

      // Add questions
      for (let i = 0; i < questions.length; i++) {
        await addDoc(collection(db, `quizzes/${quizRef.id}/questions`), {
          ...questions[i],
          quizId: quizRef.id,
          order: i
        });
      }

      navigate('/admin');
    } catch (err) {
      setError('Failed to save quiz. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black tracking-tight">CREATE NEW QUIZ</h1>
        <button 
          onClick={() => navigate('/admin')}
          className="font-bold flex items-center gap-2 hover:underline decoration-4 underline-offset-4"
        >
          <ChevronLeft size={20} />
          BACK TO DASHBOARD
        </button>
      </div>

      {error && (
        <div className="bg-[#FF7675] border-4 border-[#2D3436] p-4 font-black flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(45,52,54,1)]">
          <AlertCircle size={24} />
          {error}
        </div>
      )}

      <div className="bg-white border-4 border-[#2D3436] p-8 shadow-[8px_8px_0px_0px_rgba(45,52,54,1)] space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block font-black text-sm uppercase tracking-widest">Quiz Title</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="E.G. JAVASCRIPT BASICS"
              className="w-full border-4 border-[#2D3436] p-3 font-bold focus:bg-[#FDF6E3] outline-none transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-black text-sm uppercase tracking-widest">Timer (Minutes)</label>
            <input 
              type="number" 
              value={timerMinutes}
              onChange={(e) => setTimerMinutes(parseInt(e.target.value))}
              className="w-full border-4 border-[#2D3436] p-3 font-bold focus:bg-[#FDF6E3] outline-none transition-colors"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="block font-black text-sm uppercase tracking-widest">Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="WHAT IS THIS QUIZ ABOUT?"
            className="w-full border-4 border-[#2D3436] p-3 font-bold focus:bg-[#FDF6E3] outline-none transition-colors h-24 resize-none"
          />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">QUESTIONS ({questions.length}/10)</h2>
          <button 
            onClick={addQuestion}
            disabled={questions.length >= 10}
            className="bg-[#55EFC4] border-4 border-[#2D3436] py-2 px-4 font-black flex items-center gap-2 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] disabled:opacity-50 disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-none transition-all"
          >
            <Plus size={18} />
            ADD QUESTION
          </button>
        </div>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-white border-4 border-[#2D3436] p-6 shadow-[8px_8px_0px_0px_rgba(45,52,54,1)] space-y-4 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="bg-[#2D3436] text-white px-3 py-1 font-black text-sm">QUESTION {qIndex + 1}</span>
              <button 
                onClick={() => removeQuestion(qIndex)}
                className="text-[#FF7675] hover:bg-[#FF7675] hover:text-white p-1 rounded border-2 border-transparent hover:border-[#2D3436] transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
            
            <input 
              type="text" 
              value={q.text}
              onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
              placeholder="ENTER YOUR QUESTION HERE"
              className="w-full border-4 border-[#2D3436] p-3 font-bold focus:bg-[#FDF6E3] outline-none transition-colors"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {q.options?.map((opt, oIndex) => (
                <div key={oIndex} className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name={`correct-${qIndex}`}
                    checked={q.correctOptionIndex === oIndex}
                    onChange={() => updateQuestion(qIndex, 'correctOptionIndex', oIndex)}
                    className="w-6 h-6 border-4 border-[#2D3436] checked:bg-[#55EFC4] appearance-none cursor-pointer"
                  />
                  <input 
                    type="text" 
                    value={opt}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    placeholder={`OPTION ${oIndex + 1}`}
                    className="flex-1 border-4 border-[#2D3436] p-2 font-bold focus:bg-[#FDF6E3] outline-none transition-colors"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-8">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[#A29BFE] border-4 border-[#2D3436] py-4 px-12 text-2xl font-black flex items-center gap-3 hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_0px_rgba(45,52,54,1)] disabled:opacity-50 transition-all"
        >
          {saving ? 'SAVING...' : 'PUBLISH QUIZ'}
          <Save size={24} />
        </button>
      </div>
    </div>
  );
}
