import React, { useEffect, useState } from "react";
import { getApplicationsForJob } from "../api";

interface Application {
  id: number;
  applicant_name: string;
  applicant_email: string;
  ai_evaluation: string;
  ai_score: number | null;
  created_at: string;
  answers_json: string;
}

interface ApplicationsModalProps {
  jobId: number;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicationsModal({ jobId, jobTitle, isOpen, onClose }: ApplicationsModalProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  useEffect(() => {
    if (isOpen && jobId) {
      loadApplications();
    }
  }, [isOpen, jobId]);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const data = await getApplicationsForJob(jobId);
      setApplications(data);
    } catch (error) {
      console.error("Error loading applications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return "bg-gray-100 text-gray-600";
    if (score >= 8) return "bg-green-100 text-green-800";
    if (score >= 6) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getScoreText = (score: number | null) => {
    if (score === null) return "No Score";
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    return "Needs Improvement";
  };

  const parseAnswers = (answersJson: string) => {
    try {
      return JSON.parse(answersJson);
    } catch {
      return [];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Applications for {jobTitle}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {applications.length} application{applications.length !== 1 ? 's' : ''} received
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
              <p className="text-gray-500">Applications will appear here once candidates apply to this job.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Applications List */}
              <div className="lg:col-span-1">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Applicants</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApplication(app)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedApplication?.id === app.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-gray-900 truncate">
                          {app.applicant_name || 'Anonymous'}
                        </h5>
                        {app.ai_score !== null && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(app.ai_score)}`}>
                            {app.ai_score}/10
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 truncate">{app.applicant_email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Applied {formatDate(app.created_at)}
                      </p>
                      {app.ai_score !== null && (
                        <p className="text-xs text-gray-600 mt-1">
                          {getScoreText(app.ai_score)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Application Details */}
              <div className="lg:col-span-2">
                {selectedApplication ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {selectedApplication.applicant_name || 'Anonymous'}
                      </h4>
                      <button
                        onClick={() => setSelectedApplication(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Applicant Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3">Contact Information</h5>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">Email:</span> {selectedApplication.applicant_email}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium text-gray-700">Applied:</span> {formatDate(selectedApplication.created_at)}
                        </p>
                        {selectedApplication.ai_score !== null && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-700">AI Score:</span>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getScoreColor(selectedApplication.ai_score)}`}>
                              {selectedApplication.ai_score}/10 - {getScoreText(selectedApplication.ai_score)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Evaluation */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        AI Evaluation
                      </h5>
                      <div className="bg-white rounded border p-4">
                        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                          {selectedApplication.ai_evaluation || 'No evaluation available'}
                        </pre>
                      </div>
                    </div>

                    {/* Application Answers */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3">Application Answers</h5>
                      <div className="space-y-4">
                        {parseAnswers(selectedApplication.answers_json).map((answer: any, index: number) => (
                          <div key={index} className="bg-white rounded border p-3">
                            <p className="font-medium text-gray-700 mb-2">{answer.question}</p>
                            <p className="text-sm text-gray-600">{answer.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select an applicant</h3>
                    <p className="text-gray-500">Choose an applicant from the list to view their details and AI evaluation.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
