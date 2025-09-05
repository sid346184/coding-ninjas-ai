import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

// Configure axios defaults
axios.defaults.baseURL = 'http://192.168.29.192:8000';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

// Import questions
import questions from "../../../backend/questions.json";

interface Evaluation {
  score: number;
  feedback: string;
}

interface Report {
  final_score: number;
  answers: string[];
  evaluations: Evaluation[];
  overall_feedback?: string;
}

interface RouteParams {
  sessionId: string;
  [key: string]: string | undefined;
}

export default function Report() {
  const { sessionId } = useParams<RouteParams>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await axios.get<Report>(`/summary/${sessionId}`);
        setReport(res.data);
      } catch (error) {
        console.error('Error fetching report:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (sessionId) {
      fetchReport();
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <p>Loading report...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <p>No report found for this session.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-[rgb(245,108,59)] text-white rounded"
        >
          Start New Interview
        </button>
      </div>
    );
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-blue-100 text-blue-800';
    if (score >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Excel Skills Assessment Report</h1>
            
            {report.final_score && (
              <div className="mb-8 text-center">
                <div className={`inline-block px-6 py-4 rounded-lg ${getScoreColor(report.final_score)}`}>
                  <h2 className="text-2xl font-bold">Final Score: {report.final_score}/100</h2>
                  <p className="text-lg mt-1">{getScoreLabel(report.final_score)}</p>
                </div>
              </div>
            )}

            <div className="space-y-8">
              {report.answers.map((answer, index) => {
                const evaluation = report.evaluations[index] || { score: 'N/A', feedback: 'No evaluation available' };
                
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Question {index + 1}</h3>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getScoreColor(evaluation.score)}`}>
                        {evaluation.score}/100
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold text-gray-700 mb-2">Question:</p>
                        <p className="text-gray-600">{questions[index].question}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-2">Your Answer:</p>
                        <p className="text-gray-600 bg-white rounded-lg p-3 border border-gray-200">{answer}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-2">Feedback:</p>
                        <p className="text-gray-600 bg-white rounded-lg p-3 border border-gray-200">{evaluation.feedback}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {report.overall_feedback && (
              <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h2 className="text-xl font-bold text-blue-900 mb-4">Overall Feedback</h2>
                <p className="text-blue-800 whitespace-pre-line">{report.overall_feedback}</p>
              </div>
            )}

            <div className="mt-8 text-center">
              <button
                onClick={() => navigate('/')}
                className="cursor-pointer px-8 py-3 bg-[rgb(245,108,59)] text-white rounded-lg font-semibold hover:bg-[rgb(246,141,103)] transition-colors duration-200 shadow-md"
              >
                Start New Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
