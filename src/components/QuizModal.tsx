import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Award, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  domainData: any;
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, domain, domainData }) => {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchQuiz();
    } else {
      // Reset state when closed
      setLoading(true);
      setQuestions([]);
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setScore(0);
      setQuizFinished(false);
      setError(null);
    }
  }, [isOpen, domain]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fnError } = await supabase.functions.invoke("generate-quiz", {
        body: { domain, domainData },
      });

      if (fnError) throw fnError;
      
      if (data && data.questions) {
         setQuestions(data.questions);
      } else {
         throw new Error("Invalid format received from server.");
      }
    } catch (err: any) {
      console.error("Error fetching quiz:", err);
      setError(err.message || "Failed to load quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (index: number) => {
    if (showExplanation) return; // Prevent changing answer after submission
    setSelectedAnswer(index);
    setShowExplanation(true);
    
    if (index === questions[currentIndex].correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizFinished(true);
    }
  };

  const getOptionStyle = (index: number) => {
    if (!showExplanation) {
      return selectedAnswer === index 
        ? "border-primary bg-primary/10" 
        : "border-border hover:border-primary/50 hover:bg-muted/50";
    }

    const currentQ = questions[currentIndex];
    
    if (index === currentQ.correctAnswerIndex) {
      return "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
    }
    
    if (index === selectedAnswer && selectedAnswer !== currentQ.correctAnswerIndex) {
      return "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
    }
    
    return "border-border opacity-50";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Award className="h-6 w-6 text-primary" />
            {domain} Mock Quiz
          </DialogTitle>
          <DialogDescription>
            Test your knowledge before the real interview.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Generating your custom {domain} quiz...</p>
            </div>
          ) : error ? (
             <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-destructive font-semibold">Oops! Something went wrong.</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={fetchQuiz}>Try Again</Button>
            </div>
          ) : quizFinished ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-6 text-center animate-in fade-in zoom-in duration-500">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Award className="h-12 w-12 text-primary" />
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-2">Quiz Complete!</h3>
                <p className="text-xl text-muted-foreground">
                  You scored <span className="font-bold text-primary">{score}</span> out of {questions.length}
                </p>
              </div>
              
              <div className="w-full bg-muted/30 p-4 rounded-xl border mt-4">
                <p className="text-sm">
                  {score >= 8 ? "Excellent work! You are well-prepared." : 
                   score >= 5 ? "Good effort! Review the roadmap to brush up on a few topics." : 
                   "Keep studying! Focus on the core concepts in the roadmap."}
                </p>
              </div>

              <div className="flex gap-4 w-full mt-6">
                <Button onClick={onClose} variant="outline" className="w-full">Close</Button>
                <Button onClick={fetchQuiz} className="w-full">Retake Quiz</Button>
              </div>
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center text-sm font-medium text-muted-foreground mb-2">
                <span>Question {currentIndex + 1} of {questions.length}</span>
                <span>Score: {score}</span>
              </div>
              
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              <h3 className="text-xl font-semibold leading-relaxed mt-6">
                {questions[currentIndex].question}
              </h3>

              <div className="grid gap-3 mt-6">
                {questions[currentIndex].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(idx)}
                    disabled={showExplanation}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-start gap-3 ${getOptionStyle(idx)}`}
                  >
                    <div className="mt-0.5 mt-0 flex-shrink-0">
                       {showExplanation && idx === questions[currentIndex].correctAnswerIndex ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                       ) : showExplanation && idx === selectedAnswer ? (
                          <XCircle className="h-5 w-5 text-red-500" />
                       ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-current opacity-50" />
                       )}
                    </div>
                    <span>{option}</span>
                  </button>
                ))}
              </div>

              {showExplanation && (
                <Card className="mt-6 border-primary/20 bg-primary/5 animate-in slide-in-from-bottom-2 fade-in">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-primary mb-1">Explanation</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {questions[currentIndex].explanation}
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleNextQuestion} 
                  disabled={!showExplanation}
                  className="gap-2"
                >
                  {currentIndex < questions.length - 1 ? "Next Question" : "See Results"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
