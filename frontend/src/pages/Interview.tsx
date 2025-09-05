import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Configure axios defaults
axios.defaults.baseURL = 'http://4.240.112.91:8000/'; 
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

interface Message {
  q: string;
  a: string;
  score: number;
  feedback: string;
  related_concepts: string[];
}

interface InterviewResponse {
  session_id: string;
  question: string;
}

interface AnswerResponse {
  evaluation: {
    score: number;
    feedback: string;
    related_concepts: string[];
  };
  done: boolean;
  next_question?: string;
}

export default function Interview() {
  const [sessionId, setSessionId] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  async function startInterview() {
    setIsLoading(true);
    try {
      const res = await axios.post<InterviewResponse>("/start-interview");
      setSessionId(res.data.session_id);
      setQuestion(res.data.question);
    } catch (error) {
      console.error("Error starting interview:", error);
      alert("Failed to start interview. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function sendAnswer() {
    if (!input.trim()) {
      alert("Please enter an answer before submitting.");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await axios.post<AnswerResponse>("/answer", {
        session_id: sessionId,
        answer: input
      });
      const evaluation = res.data.evaluation;
      setMessages([...messages, { 
        q: question, 
        a: input, 
        score: evaluation.score,
        feedback: evaluation.feedback,
        related_concepts: evaluation.related_concepts
      }]);
      if (res.data.done) {
        navigate(`/report/${sessionId}`);
      } else {
        setQuestion(res.data.next_question || "");
      }
      setInput("");
    } catch (error) {
      console.error("Error submitting answer:", error);
      alert("Failed to submit answer. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src="/68747470733a2f2f7777772e636f64696e676e696e6a61732e636f6d2f6173736574732d6c616e64696e672f696d616765732f434e4c4f474f2e737667.svg" 
                alt="Logo" 
                className="h- w-30 mr-3"
              />
            </div>
            <nav className="flex space-x-4">
              <a href="/" className="text-gray-600 hover:text-gray-900">Home</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {!sessionId ? (
              <div className="p-8 text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to the Coding Ninjas Assessment</h2>
                <p className="text-gray-600 mb-8">Ready to test your Excel knowledge? Click below to begin the interview.</p>
                <button
                  className="px-6 py-3 bg-[rgb(245,108,59)] text-white rounded-lg font-semibold hover:bg-[rgb(246,148,112)] transition-colors duration-200 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
                  onClick={startInterview}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Starting...
                    </div>
                  ) : (
                    'Start Interview'
                  )}
                </button>
              </div>
            ) : (
              <div className="p-6">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Question:</h2>
                  <p className="text-lg text-gray-700 mb-6">{question}</p>
                  <div className="space-y-4">
                    <textarea
                      className="w-full border-2 border-gray-300 rounded-lg p-4 min-h-[120px] focus:border-[rgb(245,108,59)] focus:ring-2 focus:ring-blue-200 outline-none transition-colors duration-200"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type your answer here..."
                    />
                    <button
                      onClick={sendAnswer}
                      className="w-full px-6 py-3 bg-[rgb(245,108,59)] text-white rounded-lg font-semibold hover:bg-[rgb(246,148,112)] transition-colors duration-200 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </div>
                      ) : (
                        'Submit Answer'
                      )}
                    </button>
                  </div>
                </div>

                {messages.length > 0 && (
                  <div className="border-t-2 border-gray-100 pt-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Previous Answers:</h3>
                    <div className="space-y-4">
                      {messages.map((m, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="mb-3">
                            <p className="font-semibold text-gray-700">Question {idx + 1}:</p>
                            <p className="text-gray-600">{m.q}</p>
                          </div>
                          <div className="mb-3">
                            <p className="font-semibold text-gray-700">Your Answer:</p>
                            <p className="text-gray-600">{m.a}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-700">Score:</p>
                            <p className="text-gray-600">{m.score}/100</p>
                            <p className="font-semibold text-gray-700 mt-2">Feedback:</p>
                            <p className="text-gray-600">{m.feedback}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[rgb(41,31,22)] text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">About Us</h3>
              <p className="text-gray-300">
                Get the tech career you deserve. Faster.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="/" className="text-gray-300 hover:text-white">Home</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Assessments</a></li>
                <li><a href="#" className="text-gray-300 hover:text-white">Resources</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <p className="text-gray-300">
                Email: contact@codingninjas.com<br />
                Phone: 1800-123-3598
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Excel Skills Assessment. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
