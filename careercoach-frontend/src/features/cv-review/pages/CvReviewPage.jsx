import React, { useState, useEffect, useRef } from 'react';
import { uploadCv, getLatestCv } from '../../../api/cvService';

export default function CvReviewPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [cvData, setCvData] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef(null);

  // Check if the user has a previously uploaded CV on mount
  useEffect(() => {
    fetchLatestCv();
  }, []);

  const fetchLatestCv = async () => {
    try {
      const res = await getLatestCv();
      setCvData(res.data);
    } catch (err) {
      // 404 means no CV uploaded yet, ignore
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

    try {
      const res = await uploadCv(selectedFile);
      setSuccess(true);
      setCvData(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to upload CV. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold font-display tracking-tight text-white">
          AI CV Upload & parsing
        </h1>
        <p className="text-slate-400">
          Upload your resume in PDF format. We will extract its text structure and prepare it for instant AI evaluations and reviews.
        </p>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Upload Zone Panel */}
        <div className="md:col-span-1 space-y-4">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`p-8 border-2 border-dashed rounded-2xl cursor-pointer flex flex-col items-center justify-center gap-4 text-center transition-all duration-300 ${
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
                    {file ? 'Replace CV Document' : 'Upload CV Document'}
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
                <p className="truncate"><span className="text-slate-500">File:</span> {cvData.fileName}</p>
                <p><span className="text-slate-500">Size:</span> {formatBytes(cvData.fileSize)}</p>
                <p><span className="text-slate-500">Uploaded:</span> {new Date(cvData.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>

        {/* Text Preview / AI Preparation Panel */}
        <div className="md:col-span-2 flex flex-col h-full">
          <div className="glass-panel rounded-2xl flex flex-col overflow-hidden h-[400px]">
            <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                Extracted Text Preview (Ready for AI Review)
              </h3>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto bg-slate-950/40">
              {cvData ? (
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {cvData.extractedText}
                </pre>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                  <span className="text-3xl">🔍</span>
                  <p className="text-xs font-semibold">No CV parsed yet</p>
                  <p className="text-[10px] max-w-xs text-center">Once a PDF resume is uploaded, the parsed text representation will display here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
