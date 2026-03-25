import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TopicNode from '../components/TopicNode';

const API_BASE = 'http://localhost:3000';

export default function CourseMap() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/course/${courseId}`);
      const data = await res.json();
      if (data.success) setCourse(data.course);
    } catch (err) {
      console.error('Failed to fetch course:', err);
    } finally {
      setLoading(false);
    }
  };

  // Derive module status from subtopics
  const getModuleStatus = (module, moduleIndex) => {
    if (!module.subtopics || module.subtopics.length === 0) return 'locked';
    const allCompleted = module.subtopics.every(s => s.status === 'completed');
    const hasActive = module.subtopics.some(s => s.status === 'active');
    if (allCompleted) return 'completed';
    if (hasActive) return 'active';
    return 'locked';
  };

  // Connector status: completed → green, to-active → violet, else → locked
  const getConnectorStatus = (currentModuleStatus, nextModuleStatus) => {
    if (currentModuleStatus === 'completed' && nextModuleStatus === 'completed') return 'completed';
    if (currentModuleStatus === 'completed' && nextModuleStatus === 'active') return 'active';
    return 'locked';
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="fixed inset-0 z-0" style={{ background: 'var(--color-background)' }}></div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#8b5cf6', borderTopColor: 'transparent' }}></div>
            <p className="font-body text-sm" style={{ color: 'var(--theme-text-body)' }}>Loading course map...</p>
          </div>
        </div>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <div className="fixed inset-0 z-0" style={{ background: 'var(--color-background)' }}></div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <p className="font-body text-lg" style={{ color: 'var(--theme-text-body)' }}>Course not found.</p>
        </div>
      </>
    );
  }

  const modules = course.modules || [];

  return (
    <>
      <Navbar />
      <div className="fixed inset-0 z-0 grid-bg" style={{ background: 'var(--color-background)' }}></div>

      <main className="relative z-10 min-h-screen pt-28 pb-20 px-6 max-w-3xl mx-auto font-body">
        {/* Header */}
        <div className="mb-4 animate-blur-text" style={{ animationDelay: '0.1s' }}>
          <Link to="/dashboard" className="inline-flex items-center gap-1 text-xs font-label uppercase tracking-widest mb-4 hover:opacity-80 transition-opacity" style={{ color: 'var(--theme-text-muted)' }}>
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Dashboard
          </Link>
          <h1 className="font-headline text-4xl md:text-5xl font-bold italic forge-gradient-text leading-tight">
            {course.course_title}
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--theme-text-body)' }}>
            {modules.length} modules • {course.progress}% complete
          </p>
        </div>

        {/* World Map – Vertical node chain */}
        <div className="mt-12 animate-blur-text" style={{ animationDelay: '0.2s' }}>
          {modules.map((mod, i) => {
            const status = getModuleStatus(mod, i);
            const nextStatus = i < modules.length - 1 ? getModuleStatus(modules[i + 1], i + 1) : null;
            const connectorStatus = nextStatus ? getConnectorStatus(status, nextStatus) : null;

            return (
              <div key={mod._id || i}>
                {/* Node */}
                <TopicNode
                  module={mod}
                  moduleIndex={i}
                  courseId={courseId}
                  status={status}
                />

                {/* Connector line */}
                {i < modules.length - 1 && (
                  <div className={`node-connector h-12 node-connector-${connectorStatus}`}></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Course complete badge */}
        {course.progress === 100 && (
          <div className="mt-12 text-center animate-blur-text" style={{ animationDelay: '0.4s' }}>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <span className="material-symbols-outlined text-2xl" style={{ color: '#22c55e' }}>emoji_events</span>
              <span className="font-label text-sm font-bold" style={{ color: '#22c55e' }}>COURSE COMPLETED</span>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
