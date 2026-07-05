import React, { useState, useEffect, useRef } from 'react';
import { uploadCv, getLatestCv, triggerCvReview, getLatestCvReview } from '../../../api/cvService';

export default function CvReviewPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cvData, setCvData] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Tab control: 'report' or 'text'
  const [activeTab, setActiveTab] = useState('text');
  
  // AI Review states
  const [reviewData, setReviewData] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);

  const fileInputRef = useRef(null);

  // Loading steps animation texts
  const loadingSteps = [
    "Reading extracted document structures...",
    "Analyzing text blocks and format...",
    "Running ATS optimization checkers...",
    "Evaluating grammar and active phrasing...",
    "Processing projects and identifying skill markers...",
    "Generating final scores and action plan..."
  ];

  useEffect(() => {
    let timer;
    if (reviewLoading) {
      setLoadingStep(0);
      timer = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 3000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [reviewLoading]);

  // Check if the user has a previously uploaded CV on mount
  useEffect(() => {
    fetchLatestCvAndReview();
  }, []);

  const fetchLatestCvAndReview = async () => {
    try {
      const res = await getLatestCv();
      setCvData(res.data);
      
      // If a CV exists, attempt to fetch the latest review
      try {
        const reviewRes = await getLatestCvReview();
        setReviewData(reviewRes.data);
        setActiveTab('report'); // Default to report tab if it exists
      } catch (err) {
        console.log("No previous review found.");
        setActiveTab('text');
      }
    } catch (err) {
      console.log("No previous CV found or user hasn't uploaded one.");
    }
  };

  const validateAndUploadFile = async (selectedFile) => {
    setError('');
    setSuccess(false);

    if (!selectedFile) return;

    // Validate type (must be PDF)
    const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setError('Invalid file format. Only PDF files are accepted.');
      return;
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError('File is too large. Maximum file size is 5MB.');
      return;
    }

    setFile(selectedFile);
    setLoading(true);
    setReviewData(null); // Clear old review on new upload

    try {
      const res = await uploadCv(selectedFile);
      setSuccess(true);
      setCvData(res.data);
      setActiveTab('text'); // Go to raw text tab first to let them review
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to upload CV. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerReview = async () => {
    if (!cvData?.id) return;
    setReviewLoading(true);
    setReviewError('');
    try {
      const res = await triggerCvReview(cvData.id);
      setReviewData(res.data);
      setActiveTab('report');
    } catch (err) {
      console.error(err);
      setReviewError(err.response?.data?.error || 'Failed to analyze CV. Please try again.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndUploadFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const selectedFile = e.dataTransfer.files[0];
    validateAndUploadFile(selectedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Helper to color overall/ATS scores
  const getScoreColorClass = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
    if (score >= 60) return 'text-amber-400 border-amber-500/30 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/5';
  };

  const getScoreProgressColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold font-display tracking-tight text-white">
            AI CV Review & Analysis
          </h1>
          <p className="text-slate-400">
            Upload your resume to get instant, deep AI reviews on scores, grammar alignment, ATS friendliness, project descriptions, and missing blocks.
          </p>
        </div>
        {cvData && !reviewLoading && !reviewData && (
          <button
            onClick={handleTriggerReview}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-500/20"
          >
            ✨ Run AI Analysis
          </button>
        )}
        {cvData && reviewData && !reviewLoading && (
          <button
            onClick={handleTriggerReview}
            className="px-6 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 hover:text-white transition-all duration-200 cursor-pointer border border-slate-700"
          >
            🔄 Re-run Analysis
          </button>
        )}
      </div>

      {/* Main Grid: Upload and Preview/Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Upload Zone Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`p-6 border-2 border-dashed rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-4 text-center transition-all duration-300 ${
              isDragOver 
                ? 'border-indigo-500 bg-indigo-500/10 scale-102 shadow-lg shadow-indigo-500/5' 
                : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 hover:border-slate-700'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="application/pdf"
              className="hidden" 
            />
            
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-semibold text-slate-300 mt-2">Processing PDF...</p>
              </div>
            ) : (
              <>
                <span className="text-4xl transition-transform duration-300 hover:scale-110">📄</span>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    {cvData ? 'Replace CV Document' : 'Upload CV Document'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Drag & drop or browse</p>
                  <p className="text-[10px] text-slate-600 mt-2">Supports PDF format up to 5MB</p>
                </div>
              </>
            )}
          </div>

          {/* Success / Error Alerts */}
          {error && (
            <div className="p-3 border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <p className="leading-relaxed">{error}</p>
            </div>
          )}

          {reviewError && (
            <div className="p-3 border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-semibold rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <p className="leading-relaxed">{reviewError}</p>
            </div>
          )}

          {success && (
            <div className="p-3 border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-xl flex items-center gap-2">
              <span>✅</span>
              <p>CV uploaded and parsed successfully!</p>
            </div>
          )}

          {/* Metadata info */}
          {cvData && (
            <div className="glass-panel p-4 rounded-2xl space-y-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Document Info</h4>
              <div className="space-y-1.5 text-xs text-slate-400">
                <p className="truncate"><span className="text-slate-500 font-medium">File:</span> {cvData.fileName}</p>
                <p><span className="text-slate-500 font-medium">Size:</span> {formatBytes(cvData.fileSize)}</p>
                <p><span className="text-slate-500 font-medium">Uploaded:</span> {new Date(cvData.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Details Area */}
        <div className="lg:col-span-3 flex flex-col h-full space-y-4">
          
          {/* Navigation Tabs */}
          {cvData && (
            <div className="flex border-b border-slate-800">
              {reviewData && (
                <button
                  onClick={() => setActiveTab('report')}
                  className={`px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                    activeTab === 'report'
                      ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ✨ AI Review Report
                </button>
              )}
              <button
                onClick={() => setActiveTab('text')}
                className={`px-5 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'text'
                    ? 'text-indigo-400 border-b-2 border-indigo-500 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📝 Raw Extracted Text
              </button>
            </div>
          )}

          {/* Tab Contents */}
          <div className="flex-1">
            {reviewLoading ? (
              // Stunning, structured AI Review Loading state
              <div className="glass-panel rounded-2xl p-10 flex flex-col items-center justify-center min-h-[400px] text-center space-y-6">
                <div className="relative flex items-center justify-center">
                  <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                  <span className="absolute text-2xl">🤖</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">AI Career Coach is analyzing your resume</h3>
                  <p className="text-sm text-indigo-400 animate-pulse font-medium">
                    {loadingSteps[loadingStep]}
                  </p>
                </div>
                <p className="text-xs text-slate-500 max-w-sm">
                  This takes roughly 15-20 seconds. We are scanning your skills, calculating parser compatibility scores, and compiling formatting critiques.
                </p>
              </div>
            ) : activeTab === 'report' && reviewData ? (
              
              // Full AI Review Dashboard
              <div className="space-y-6">
                
                {/* Score Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Overall Score */}
                  <div className={`p-6 border rounded-2xl flex items-center justify-between transition-all duration-300 ${getScoreColorClass(reviewData.overallScore)}`}>
                    <div className="space-y-1">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Overall Resume Rating</span>
                      <h4 className="text-3xl font-extrabold text-white">{reviewData.overallScore} / 100</h4>
                      <p className="text-xs text-slate-400">
                        {reviewData.overallScore >= 80 ? 'Excellent formatting & content density.' :
                         reviewData.overallScore >= 60 ? 'Decent foundation, but notable gaps remain.' :
                         'Critical adjustments needed to stand out.'}
                      </p>
                    </div>
                    <div className="relative w-16 h-16 flex items-center justify-center rounded-full bg-slate-950/40 border border-white/5">
                      <span className="text-2xl">🏆</span>
                    </div>
                  </div>

                  {/* ATS Score */}
                  <div className={`p-6 border rounded-2xl flex items-center justify-between transition-all duration-300 ${getScoreColorClass(reviewData.atsScore)}`}>
                    <div className="space-y-2 w-full pr-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">ATS Parsing Score</span>
                        <span className="text-sm font-bold text-white">{reviewData.atsScore}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${getScoreProgressColor(reviewData.atsScore)}`}
                          style={{ width: `${reviewData.atsScore}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-400">
                        {reviewData.atsScore >= 80 ? 'Highly compatible with major ATS algorithms.' :
                         reviewData.atsScore >= 60 ? 'Suboptimal headings or section structures detected.' :
                         'Strong risk of parsing failures in recruiter systems.'}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Grammar Analysis */}
                <div className="glass-panel p-6 rounded-2xl space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>✍️</span> Grammar & Phrasing Critique
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/20 p-4 rounded-xl border border-slate-900">
                    {reviewData.grammar}
                  </p>
                </div>

                {/* Skills & Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Skills Extracted */}
                  <div className="glass-panel p-6 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>🛠️</span> Extracted Key Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {reviewData.skills && reviewData.skills.length > 0 ? (
                        reviewData.skills.map((skill, idx) => (
                          <span 
                            key={idx}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700/50"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">No skills parsed.</p>
                      )}
                    </div>
                  </div>

                  {/* Missing Sections */}
                  <div className="glass-panel p-6 rounded-2xl space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>⚠️</span> Missing Core Sections
                    </h3>
                    <div className="space-y-2">
                      {reviewData.missingSections && reviewData.missingSections.length > 0 ? (
                        reviewData.missingSections.map((sec, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 text-xs text-rose-300 bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-xl">
                            <span className="text-rose-400">❌</span>
                            <span className="font-medium">{sec}</span>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center gap-2.5 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
                          <span>✅</span>
                          <span className="font-semibold">All standard CV sections are present!</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Project Presentations */}
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>🚀</span> Projects Critique
                  </h3>
                  <div className="space-y-3">
                    {reviewData.projects && reviewData.projects.length > 0 ? (
                      reviewData.projects.map((proj, idx) => (
                        <div key={idx} className="p-4 bg-slate-950/30 border border-slate-900 rounded-xl space-y-1.5 hover:border-slate-800 transition-colors">
                          <p className="text-xs text-slate-300 leading-relaxed font-medium">
                            {proj}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">No projects specified or parsed in review.</p>
                    )}
                  </div>
                </div>

                {/* Suggestions List */}
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>💡</span> Actionable Recommendations to Optimize
                  </h3>
                  <div className="space-y-2.5">
                    {reviewData.suggestions && reviewData.suggestions.length > 0 ? (
                      reviewData.suggestions.map((sug, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-xs text-slate-300 p-3 bg-slate-900/20 border border-slate-900 rounded-xl hover:bg-slate-900/40 transition-colors">
                          <span className="text-indigo-400 mt-0.5">⚡</span>
                          <p className="leading-relaxed">{sug}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500">No suggestions needed, your CV is optimized!</p>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              // Raw Text Preview Tab OR fallback when no review is done yet
              <div className="glass-panel rounded-2xl flex flex-col overflow-hidden h-[500px]">
                <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                    Extracted Text Preview
                  </h3>
                  {cvData && !reviewData && !reviewLoading && (
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      Ready for AI review
                    </span>
                  )}
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto bg-slate-950/40">
                  {cvData ? (
                    <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {cvData.extractedText}
                    </pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                      <span className="text-3xl">🔍</span>
                      <p className="text-xs font-semibold">No CV uploaded yet</p>
                      <p className="text-[10px] max-w-xs text-center">Once a PDF resume is uploaded, the parsed text representation will display here, allowing you to trigger the AI rating system.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
