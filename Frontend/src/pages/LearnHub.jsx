import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import SubtopicListItem from '../components/SubtopicListItem';

const API_BASE = 'http://localhost:3000';

// ─── Quiz Modal Component ───
function QuizModal({ questions, onSubmit, onClose }) {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = (qIdx, option) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[qIdx] = option;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.some(a => a === null) || submitting) return;
    setSubmitting(true);
    const data = await onSubmit(answers);
    setResults(data);
    setSubmitted(true);
    setSubmitting(false);
  };

  const answeredCount = answers.filter(a => a !== null).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && !submitting) onClose(); }}>

      <div className="liquid-glass rounded-2xl w-full max-w-2xl flex flex-col"
        style={{ maxHeight: 'calc(100vh - 48px)', border: '1px solid var(--theme-border-strong)' }}>

        {/* ── Sticky Header ── */}
        <div className="shrink-0 p-6 pb-4" style={{ borderBottom: '1px solid var(--theme-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-headline text-2xl font-bold italic" style={{ color: 'var(--theme-text-heading)' }}>
              {submitted ? (results?.passed ? '🎉 Module Complete!' : '📚 Keep Learning') : '🧠 Module Quiz'}
            </h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-110"
              style={{ background: 'var(--theme-glass-bg)', border: '1px solid var(--theme-border)' }}>
              <span className="material-symbols-outlined text-sm" style={{ color: 'var(--theme-text-muted)' }}>close</span>
            </button>
          </div>

          {submitted && results ? (
            <div className="p-3 rounded-xl" style={{ background: results.passed ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${results.passed ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-body text-sm" style={{ color: 'var(--theme-text-body)' }}>{results.message}</span>
                <span className={`font-label text-lg font-bold ${results.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                  {results.score}%
                </span>
              </div>
              <p className="font-label text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                {results.correctCount} / {results.totalQuestions} correct
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              {questions.map((_, i) => (
                <div key={i} className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-label font-bold transition-all"
                  style={{
                    background: answers[i] !== null ? 'rgba(139,92,246,0.15)' : 'var(--theme-glass-bg)',
                    border: `1px solid ${answers[i] !== null ? 'rgba(139,92,246,0.4)' : 'var(--theme-border)'}`,
                    color: answers[i] !== null ? '#8b5cf6' : 'var(--theme-text-faint)'
                  }}>
                  {i + 1}
                </div>
              ))}
              <span className="ml-2 text-xs font-label" style={{ color: 'var(--theme-text-muted)' }}>
                {answeredCount}/{questions.length} answered
              </span>
            </div>
          )}
        </div>

        {/* ── Scrollable Questions ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5" style={{ minHeight: 0 }}>
          {questions.map((q, qIdx) => {
            const result = submitted ? results?.results?.[qIdx] : null;
            return (
              <div key={qIdx} className="p-5 rounded-xl" style={{ background: 'var(--theme-glass-bg)', border: '1px solid var(--theme-border)' }}>
                <div className="flex items-start gap-3 mb-4">
                  <span className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center font-label text-xs font-bold"
                    style={{
                      background: submitted ? (result?.correct ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)') : (answers[qIdx] !== null ? 'rgba(139,92,246,0.15)' : 'var(--theme-glass-bg)'),
                      border: `1px solid ${submitted ? (result?.correct ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)') : (answers[qIdx] !== null ? 'rgba(139,92,246,0.4)' : 'var(--theme-border)')}`,
                      color: submitted ? (result?.correct ? '#22c55e' : '#ef4444') : (answers[qIdx] !== null ? '#8b5cf6' : 'var(--theme-text-faint)')
                    }}>
                    {submitted ? (result?.correct ? '✓' : '✗') : qIdx + 1}
                  </span>
                  <p className="font-body text-sm font-semibold leading-relaxed" style={{ color: 'var(--theme-text-heading)' }}>
                    {q.question}
                  </p>
                </div>
                <div className="space-y-2 ml-10">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = answers[qIdx] === opt;
                    let optBg = 'transparent';
                    let optBorder = 'var(--theme-border)';
                    let optColor = 'var(--theme-text-body)';
                    let optIcon = '';

                    if (submitted && result) {
                      if (opt === result.correctAnswer) { optBg = 'rgba(34,197,94,0.08)'; optBorder = 'rgba(34,197,94,0.4)'; optColor = '#22c55e'; optIcon = 'check_circle'; }
                      else if (isSelected && !result.correct) { optBg = 'rgba(239,68,68,0.08)'; optBorder = 'rgba(239,68,68,0.4)'; optColor = '#ef4444'; optIcon = 'cancel'; }
                    } else if (isSelected) { optBg = 'rgba(139,92,246,0.08)'; optBorder = 'rgba(139,92,246,0.4)'; optColor = '#8b5cf6'; }

                    return (
                      <button key={oIdx} onClick={() => handleSelect(qIdx, opt)} disabled={submitted}
                        className="w-full text-left px-4 py-3 rounded-xl text-sm font-body transition-all cursor-pointer disabled:cursor-default flex items-center gap-3"
                        style={{ background: optBg, border: `1px solid ${optBorder}`, color: optColor }}>
                        <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                          style={{ border: `1.5px solid ${isSelected || (submitted && opt === result?.correctAnswer) ? optColor : 'var(--theme-border)'}`, background: isSelected ? optColor : 'transparent', color: isSelected ? 'white' : 'transparent' }}>
                          {isSelected && !submitted && '•'}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {optIcon && <span className="material-symbols-outlined text-base" style={{ color: optColor }}>{optIcon}</span>}
                      </button>
                    );
                  })}
                </div>
                {submitted && result && (
                  <div className="mt-3 ml-10 px-3 py-2 rounded-lg text-xs font-body" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)', color: 'var(--theme-text-muted)' }}>
                    💡 {result.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Sticky Footer ── */}
        <div className="shrink-0 p-6 pt-4 flex gap-3" style={{ borderTop: '1px solid var(--theme-border)' }}>
          {!submitted ? (
            <>
              <button onClick={onClose} className="flex-1 py-3.5 rounded-xl font-label text-sm font-bold transition-all cursor-pointer hover:opacity-80"
                style={{ background: 'var(--theme-glass-bg)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-body)' }}>Cancel</button>
              <button onClick={handleSubmit} disabled={!allAnswered || submitting}
                className="flex-1 py-3.5 rounded-xl font-label text-sm font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed forge-btn-primary text-on-primary flex items-center justify-center gap-2">
                {submitting ? (<><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div> Grading...</>) : (<>Submit ({answeredCount}/{questions.length})</>)}
              </button>
            </>
          ) : (
            <button onClick={onClose} className="w-full py-3.5 rounded-xl font-label text-sm font-bold transition-all cursor-pointer forge-btn-primary text-on-primary">
              {results?.passed ? 'Continue to Next Module →' : 'Close & Review'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Confirmation Modal ───
function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}>
      <div className="liquid-glass rounded-2xl p-8 max-w-md w-full text-center">
        <span className="material-symbols-outlined text-5xl mb-4 block" style={{ color: '#f59e0b' }}>warning</span>
        <h3 className="font-headline text-xl font-bold italic mb-2" style={{ color: 'var(--theme-text-heading)' }}>
          Not all lectures watched
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--theme-text-body)' }}>
          You haven't completed all the video lectures in this module. Taking the quiz now may be harder. Do you still want to proceed?
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-label text-sm font-bold cursor-pointer transition-all"
            style={{ background: 'var(--theme-glass-bg)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-body)' }}
          >Go Back</button>
          <button onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-label text-sm font-bold cursor-pointer transition-all forge-btn-primary text-on-primary"
          >Take Quiz Anyway</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───
export default function LearnHub() {
  const { courseId, moduleIndex: modIdxStr } = useParams();
  const moduleIndex = parseInt(modIdxStr, 10);
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubIdx, setActiveSubIdx] = useState(0);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [prepStatus, setPrepStatus] = useState(null); // null = unknown until first fetch
  const prepTriggered = React.useRef(false);
  const fetchDone = React.useRef(false);

  const fetchCourse = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/course/${courseId}`);
      const data = await res.json();
      if (data.success) {
        setCourse(data.course);
        const mod = data.course.modules[moduleIndex];
        if (mod) {
          const status = mod.prepStatus || 'pending';
          setPrepStatus(status);
          if (status === 'ready' || status === 'preparing' || status === 'failed') {
            prepTriggered.current = true;
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch course:', err);
    } finally {
      setLoading(false);
      fetchDone.current = true;
    }
  }, [courseId, moduleIndex]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  // Auto-trigger preparation ONLY after initial fetch confirms it's pending (once only)
  useEffect(() => {
    if (!fetchDone.current) return; // Wait for fetch to complete first
    if (prepTriggered.current) return;
    if (prepStatus !== 'pending') return;
    prepTriggered.current = true;

    fetch(`${API_BASE}/api/course/${courseId}/module/${moduleIndex}/prepare`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPrepStatus('preparing');
          console.log('Triggered module preparation');
        }
      })
      .catch(err => console.error('Failed to trigger preparation:', err));
  }, [prepStatus, courseId, moduleIndex]);

  // Poll prep status while preparing
  useEffect(() => {
    if (prepStatus !== 'preparing') return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/course/${courseId}/module/${moduleIndex}/prep-status`);
        const data = await res.json();
        if (data.success) {
          setPrepStatus(data.prepStatus);
          if (data.prepStatus === 'ready' || data.prepStatus === 'failed') {
            clearInterval(interval);
            fetchCourse(); // Refresh full data
          }
        }
      } catch (e) { /* ignore */ }
    }, 3000);
    return () => clearInterval(interval);
  }, [prepStatus, courseId, moduleIndex, fetchCourse]);

  const currentModule = course?.modules?.[moduleIndex];
  const subtopics = currentModule?.subtopics || [];
  const activeSubtopic = subtopics[activeSubIdx];
  const watchedCount = subtopics.filter(s => s.status === 'completed').length;
  const allWatched = watchedCount === subtopics.length;

  // Collect all quiz questions from the module
  const allQuizQuestions = subtopics.flatMap(s => s.quiz || []);

  const handleMarkWatched = async () => {
    if (markingComplete || !activeSubtopic || activeSubtopic.status === 'completed') return;
    try {
      setMarkingComplete(true);
      await fetch(`${API_BASE}/api/course/${courseId}/module/${moduleIndex}/subtopic/${activeSubIdx}/watched`, { method: 'POST' });
      await fetchCourse();
    } catch (err) {
      console.error('Mark watched failed:', err);
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleQuizClick = () => {
    if (allWatched) {
      setShowQuiz(true);
    } else {
      setShowConfirm(true);
    }
  };

  const handleQuizSubmit = async (userAnswers) => {
    const res = await fetch(`${API_BASE}/api/course/${courseId}/module/${moduleIndex}/grade-module`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userAnswers })
    });
    const data = await res.json();
    if (data.passed) {
      // Refresh course so UI updates
      setTimeout(() => fetchCourse(), 500);
    }
    return data;
  };

  const handleQuizClose = () => {
    setShowQuiz(false);
    fetchCourse();
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="fixed inset-0 z-0" style={{ background: 'var(--color-background)' }}></div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#8b5cf6', borderTopColor: 'transparent' }}></div>
        </div>
      </>
    );
  }

  if (!currentModule) {
    return (
      <>
        <Navbar />
        <div className="fixed inset-0 z-0" style={{ background: 'var(--color-background)' }}></div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <p className="font-body" style={{ color: 'var(--theme-text-body)' }}>Module not found.</p>
        </div>
      </>
    );
  }

  const isPreparing = prepStatus === 'preparing' || prepStatus === 'pending';

  return (
    <>
      <Navbar />
      <div className="fixed inset-0 z-0" style={{ background: 'var(--color-background)' }}></div>

      {/* Modals */}
      {showConfirm && (
        <ConfirmModal
          onConfirm={() => { setShowConfirm(false); setShowQuiz(true); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
      {showQuiz && allQuizQuestions.length > 0 && (
        <QuizModal
          questions={allQuizQuestions}
          onSubmit={handleQuizSubmit}
          onClose={handleQuizClose}
        />
      )}

      <div className="relative z-10 min-h-screen pt-28 pb-12 px-4 md:px-6 max-w-7xl mx-auto font-body flex flex-col md:flex-row gap-6">

        {/* ═══ Sidebar ═══ */}
        <aside className="w-full md:w-[32%] shrink-0">
          <div className="neon-node neon-node-active p-5 md:sticky md:top-28" style={{ animation: 'none' }}>
            <Link to={`/course/${courseId}`}
              className="inline-flex items-center gap-1 text-xs font-label uppercase tracking-widest mb-4 hover:opacity-80 transition-opacity"
              style={{ color: 'var(--theme-text-muted)' }}>
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Course Map
            </Link>

            <h2 className="font-headline text-xl font-bold italic mb-1" style={{ color: 'var(--theme-text-heading)' }}>
              {currentModule.module_title}
            </h2>
            <p className="text-xs font-label mb-1" style={{ color: 'var(--theme-text-muted)' }}>
              Module {moduleIndex + 1} • {subtopics.length} subtopics
            </p>

            {/* Prep status indicator */}
            {isPreparing && (
              <div className="flex items-center gap-2 text-xs font-label mb-4 px-3 py-2 rounded-lg" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <div className="w-3 h-3 rounded-full border-2 border-violet-500 border-t-transparent animate-spin"></div>
                <span style={{ color: '#8b5cf6' }}>AI is preparing videos & quizzes...</span>
              </div>
            )}

            {/* Progress */}
            <div className="flex items-center gap-2 text-xs font-label mb-4" style={{ color: 'var(--theme-text-muted)' }}>
              <span style={{ color: '#22c55e' }}>{watchedCount}/{subtopics.length}</span> lectures watched
            </div>

            {/* Subtopic playlist */}
            <div className="space-y-1 max-h-[40vh] overflow-y-auto pr-1">
              {subtopics.map((sub, i) => (
                <SubtopicListItem
                  key={sub._id || i}
                  subtopic={sub}
                  index={i}
                  isActive={i === activeSubIdx}
                  status={sub.status}
                  onClick={(idx) => setActiveSubIdx(idx)}
                />
              ))}
            </div>

            {/* Quiz trigger */}
            <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--theme-border)' }}>
              <button
                disabled={isPreparing || allQuizQuestions.length === 0}
                onClick={handleQuizClick}
                className={`w-full py-3.5 rounded-xl font-label text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  !isPreparing && allQuizQuestions.length > 0
                    ? 'bg-[#22c55e] text-white quiz-trigger-pulse hover:bg-[#16a34a] active:scale-[0.97]'
                    : 'opacity-30 cursor-not-allowed'
                }`}
                style={isPreparing || allQuizQuestions.length === 0 ? { background: 'var(--theme-glass-bg)', color: 'var(--theme-text-muted)' } : {}}
              >
                <span className="material-symbols-outlined text-lg">psychology</span>
                Take Module Quiz 🧠
              </button>
              {isPreparing && (
                <p className="text-center text-xs mt-2" style={{ color: 'var(--theme-text-faint)' }}>
                  Quiz will be available once preparation completes
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* ═══ Main Content ═══ */}
        <section className="flex-1 min-w-0">
          {/* Subtopic header */}
          <div className="mb-6 animate-blur-text" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]"></div>
              <span className="font-label text-xs uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>
                Subtopic {activeSubIdx + 1} of {subtopics.length}
              </span>
            </div>
            <h1 className="font-headline text-3xl md:text-4xl font-bold italic leading-snug" style={{ color: 'var(--theme-text-heading)' }}>
              {activeSubtopic?.subtopic_title}
            </h1>
          </div>

          {/* Video player */}
          <div className="mb-6 animate-blur-text" style={{ animationDelay: '0.2s' }}>
            {activeSubtopic?.videoId && activeSubtopic.videoId !== 'none' ? (
              <div className="video-glow">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${activeSubtopic.videoId}?rel=0&modestbranding=1`}
                    title={activeSubtopic?.subtopic_title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            ) : isPreparing ? (
              <div className="video-glow" style={{ background: 'var(--theme-glass-bg)' }}>
                <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
                  <div className="w-12 h-12 rounded-full border-3 border-violet-500 border-t-transparent animate-spin mb-4"></div>
                  <h3 className="font-headline text-xl italic mb-2" style={{ color: 'var(--theme-text-heading)' }}>
                    Finding the best video...
                  </h3>
                  <p className="text-sm max-w-sm" style={{ color: 'var(--theme-text-body)' }}>
                    Our AI is searching YouTube, evaluating transcripts, and selecting the highest-quality tutorial for this topic.
                  </p>
                </div>
              </div>
            ) : (
              <div className="video-glow" style={{ background: 'var(--theme-glass-bg)' }}>
                <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
                  <span className="material-symbols-outlined text-5xl mb-4" style={{ color: 'var(--theme-text-faint)' }}>videocam_off</span>
                  <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>No video found for this subtopic.</p>
                </div>
              </div>
            )}
          </div>

          {/* Video info bar */}
          {activeSubtopic?.videoId && activeSubtopic.videoId !== 'none' && (
            <div className="mb-6 flex items-center gap-3 text-xs font-label" style={{ color: 'var(--theme-text-muted)' }}>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">person</span>
                {activeSubtopic.channelTitle || 'Unknown channel'}
              </span>
              <span>•</span>
              <span className="truncate">{activeSubtopic.videoTitle}</span>
            </div>
          )}

          {/* Mark as watched button */}
          {activeSubtopic?.status !== 'completed' && activeSubtopic?.videoId && activeSubtopic.videoId !== 'none' && (
            <div className="animate-blur-text" style={{ animationDelay: '0.3s' }}>
              <button
                onClick={handleMarkWatched}
                disabled={markingComplete}
                className="w-full py-3.5 rounded-xl font-label text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1.5px solid rgba(34, 197, 94, 0.3)',
                  color: '#22c55e'
                }}
              >
                {markingComplete ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-green-500 border-t-transparent animate-spin"></div>
                    Marking...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                    Mark as Watched
                  </>
                )}
              </button>
            </div>
          )}

          {/* Completed badge */}
          {activeSubtopic?.status === 'completed' && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <span className="material-symbols-outlined text-lg" style={{ color: '#22c55e' }}>check_circle</span>
              <span className="font-label text-sm font-bold" style={{ color: '#22c55e' }}>Lecture completed!</span>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
