import React, { useState, useRef } from 'react';
import { QUESTIONS, calculateRiskScore, getResultClassification } from './constants';
import QuestionField from './components/QuestionField';
import Results from './components/Results';
import EmbedModal from './components/EmbedModal';
import { ScoringResult } from './types';
import { ClipboardCheck, ChevronRight, Loader2, CodeXml } from 'lucide-react';

const App: React.FC = () => {
  const [answers, setAnswers] = useState<{ [key: number]: string | number }>({});
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isEmbedOpen, setIsEmbedOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const handleAnswerChange = (id: number, value: string | number) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const isFormValid = () => {
    // Check if all 10 questions have a value (truthy check handles non-empty strings/numbers)
    // Note: for number 0, we need to check specifically if it is not undefined/null/empty string
    return QUESTIONS.every(q => {
      const val = answers[q.id];
      if (typeof val === 'number') return true;
      return val !== undefined && val !== '';
    });
  };

  const handleCalculate = () => {
    if (!isFormValid()) {
      alert("Vui lòng trả lời tất cả 10 câu hỏi để có kết quả chính xác.");
      return;
    }

    setIsCalculating(true);
    
    // Simulate processing time for UX
    setTimeout(() => {
      const score = calculateRiskScore(answers);
      const classification = getResultClassification(score);
      setResult(classification);
      setIsCalculating(false);
      
      // Scroll to top to see results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800);
  };

  const handleReset = () => {
    setAnswers({});
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const completionPercentage = Math.round((Object.keys(answers).length / QUESTIONS.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 font-sans pb-20" ref={topRef}>
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="bg-blue-600 p-2 rounded-lg">
                <ClipboardCheck className="text-white w-6 h-6" />
             </div>
             <div>
               <h1 className="text-xl font-bold text-gray-900 tracking-tight">LBG Scoring</h1>
               <p className="text-xs text-gray-500 hidden sm:block">Công cụ đánh giá khả thi dự án</p>
             </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {!result && (
              <div className="flex items-center space-x-2">
                 <div className="w-20 sm:w-32 bg-gray-200 rounded-full h-2.5 hidden xs:block">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                 </div>
                 <span className="text-xs font-semibold text-gray-600 hidden xs:block">{completionPercentage}%</span>
              </div>
            )}
            
            <button 
              onClick={() => setIsEmbedOpen(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-50 text-gray-700 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 rounded-md transition-colors shadow-sm"
              title="Lấy mã nhúng cho WordPress"
            >
              <CodeXml className="w-5 h-5" />
              <span className="hidden sm:inline font-medium text-sm">Nhúng Web</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {!result ? (
          <>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Kiểm tra sức khỏe dự án
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Hoàn thành 10 câu hỏi then chốt bên dưới để nhận đánh giá rủi ro và khuyến nghị hành động từ LBG Team.
              </p>
            </div>

            <div className="space-y-6">
              {QUESTIONS.map((q) => (
                <QuestionField
                  key={q.id}
                  question={q}
                  value={answers[q.id]}
                  onChange={(val) => handleAnswerChange(q.id, val)}
                />
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <button
                onClick={handleCalculate}
                disabled={isCalculating}
                className={`
                  relative inline-flex items-center justify-center px-8 py-4 border border-transparent 
                  text-lg font-medium rounded-full text-white shadow-lg transition-all duration-200
                  ${isFormValid() 
                    ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5' 
                    : 'bg-gray-400 cursor-not-allowed'}
                `}
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Đang phân tích...
                  </>
                ) : (
                  <>
                    Chấm điểm ngay
                    <ChevronRight className="ml-2 -mr-1 h-5 w-5" />
                  </>
                )}
              </button>
            </div>
            
            {!isFormValid() && (
               <p className="text-center text-sm text-gray-500 mt-4 italic">
                 * Vui lòng hoàn tất tất cả câu hỏi để chấm điểm
               </p>
            )}
          </>
        ) : (
          <Results 
            result={result} 
            onReset={handleReset} 
            onEmbed={() => setIsEmbedOpen(true)}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} LBG Team. All rights reserved.</p>
        <p className="mt-1">Hệ thống chấm điểm tự động phiên bản 1.0</p>
      </footer>

      <EmbedModal isOpen={isEmbedOpen} onClose={() => setIsEmbedOpen(false)} />
    </div>
  );
};

export default App;