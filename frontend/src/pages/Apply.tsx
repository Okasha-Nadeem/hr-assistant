import React, { useEffect, useState } from "react";
import { getQuestions, applyToJob } from "../api";
import { useSearchParams } from "react-router-dom";

export default function Apply() {
  const [searchParams] = useSearchParams();
  const jobId = Number(searchParams.get("job") || 0);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<{question:string, answer:string}[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    setIsLoading(true);
    getQuestions(jobId).then((qs) => {
      setQuestions(qs);
      setAnswers(qs.map((q: string) => ({question: q, answer: ""})));
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });
  }, [jobId]);

  // Security: Prevent tab switching and copy/paste
  useEffect(() => {
    if (!isSubmitted) {
      // Prevent tab switching
      const handleVisibilityChange = () => {
        if (document.hidden) {
          alert("Please stay on this page during the application process. Tab switching is not allowed.");
          document.title = "⚠️ APPLICATION IN PROGRESS - Please return to this tab";
        } else {
          document.title = "Job Application";
        }
      };

      // Prevent copy/paste
      const handleCopyPaste = (e: ClipboardEvent) => {
        e.preventDefault();
        alert("Copy and paste is not allowed during the application process.");
        return false;
      };

      // Prevent keyboard shortcuts
      const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent Alt+Tab, Ctrl+Tab, Ctrl+W, Ctrl+N, F5, etc.
        if (
          (e.altKey && e.key === 'Tab') ||
          (e.ctrlKey && (e.key === 'Tab' || e.key === 'w' || e.key === 'n' || e.key === 't')) ||
          e.key === 'F5' ||
          (e.ctrlKey && e.key === 'r')
        ) {
          e.preventDefault();
          alert("This action is not allowed during the application process.");
          return false;
        }
      };

      // Prevent right-click context menu
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        alert("Right-click is disabled during the application process.");
        return false;
      };

      // Add event listeners
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('copy', handleCopyPaste);
      document.addEventListener('paste', handleCopyPaste);
      document.addEventListener('cut', handleCopyPaste);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('contextmenu', handleContextMenu);

      // Set initial title
      document.title = "Job Application - Do not switch tabs";

      // Cleanup function
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('copy', handleCopyPaste);
        document.removeEventListener('paste', handleCopyPaste);
        document.removeEventListener('cut', handleCopyPaste);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('contextmenu', handleContextMenu);
        document.title = "Job Application";
      };
    }
  }, [isSubmitted]);

  function setAns(i:number, val:string){
    const arr = [...answers];
    arr[i].answer = val;
    setAnswers(arr);
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  async function submit(e:React.FormEvent){
    e.preventDefault();
    if(!file) {
      alert("Please upload your CV");
      return;
    }
    if(!name.trim() || !email.trim()) {
      alert("Please fill in your name and email");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("job_id", String(jobId));
      fd.append("applicant_name", name);
      fd.append("applicant_email", email);
      fd.append("answers_json", JSON.stringify(answers));
      fd.append("resume", file);
      const res = await applyToJob(fd);
      setResult(res);
      setIsSubmitted(true);
      // Reset security restrictions
      document.title = "Application Submitted";
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!jobId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Job</h2>
            <p className="text-gray-600">No job ID provided. Please select a job to apply for.</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Application Form</h2>
            <p className="text-gray-600">Please wait while we prepare your application...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show success message after submission
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your application. We have received your submission and will review it carefully.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Our AI system will evaluate your application</li>
                <li>• HR team will review your profile</li>
                <li>• We'll contact you if you're selected for the next round</li>
              </ul>
            </div>
            <button
              onClick={() => window.close()}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Close Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      {/* Security Warning Banner */}
      <div className="fixed top-0 left-0 right-0 bg-red-600 text-white px-4 py-2 text-center z-50">
        <div className="flex items-center justify-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <span className="font-medium">SECURITY MODE: Do not switch tabs or use copy/paste during this application process</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Job Application</h1>
          <p className="text-lg text-gray-600">Complete your application for Job #{jobId}</p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Please complete this application in one session. Do not switch tabs or use copy/paste functions.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">Application Form</h2>
            <p className="text-blue-100 text-sm">Please fill out all required fields</p>
          </div>

          <form onSubmit={submit} className="p-6 space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your full name"
                  required
                  onCopy={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email address"
                  required
                  onCopy={(e) => e.preventDefault()}
                  onPaste={(e) => e.preventDefault()}
                  onCut={(e) => e.preventDefault()}
                />
              </div>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume/CV <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : file
                    ? "border-green-500 bg-green-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  {file ? (
                    <>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-green-800">{file.name}</p>
                      <p className="text-xs text-green-600">File uploaded successfully</p>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-700">
                        Drop your resume here, or <span className="text-blue-600">browse</span>
                      </p>
                      <p className="text-xs text-gray-500">PDF or DOCX files only</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Application Questions
              </h3>
              {questions.map((question, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {i + 1}. {question}
                  </label>
                  <textarea
                    value={answers[i]?.answer ?? ""}
                    onChange={(e) => setAns(i, e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Type your answer here..."
                    onCopy={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                  />
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
