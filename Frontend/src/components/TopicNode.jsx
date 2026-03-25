import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopicNode({ module, moduleIndex, courseId, status }) {
  const navigate = useNavigate();

  const stateClass = status === 'completed'
    ? 'neon-node-completed cursor-pointer'
    : status === 'active'
    ? 'neon-node-active cursor-pointer'
    : 'neon-node-locked';

  const stateIcon = status === 'completed'
    ? 'check_circle'
    : status === 'active'
    ? 'play_circle'
    : 'lock';

  const stateIconColor = status === 'completed'
    ? '#22c55e'
    : status === 'active'
    ? '#8b5cf6'
    : 'var(--theme-text-faint)';

  const subtopicCount = module.subtopics?.length || 0;
  const completedCount = module.subtopics?.filter(s => s.status === 'completed').length || 0;

  const handleClick = () => {
    if (status === 'locked') return;
    navigate(`/course/${courseId}/learn/${moduleIndex}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`neon-node ${stateClass} p-6 w-full max-w-md mx-auto relative`}
    >
      {/* Faint module number watermark */}
      <div className="absolute top-3 right-4 font-headline text-5xl italic font-bold pointer-events-none select-none"
        style={{ color: 'var(--theme-text-faint)', opacity: 0.3 }}>
        {String(moduleIndex + 1).padStart(2, '0')}
      </div>

      <div className="relative z-10 flex items-start gap-4">
        {/* Status icon */}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: `${stateIconColor}15` }}>
          <span className="material-symbols-outlined text-2xl" style={{ color: stateIconColor }}>
            {stateIcon}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-headline text-lg font-bold italic leading-snug mb-1 truncate"
            style={{ color: status === 'locked' ? 'var(--theme-text-muted)' : 'var(--theme-text-heading)' }}>
            {module.module_title}
          </h3>
          <div className="flex items-center gap-3 text-xs font-label" style={{ color: 'var(--theme-text-muted)' }}>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">topic</span>
              {subtopicCount} subtopics
            </span>
            {completedCount > 0 && (
              <span className="flex items-center gap-1" style={{ color: '#22c55e' }}>
                <span className="material-symbols-outlined text-xs">check</span>
                {completedCount}/{subtopicCount}
              </span>
            )}
          </div>

          {/* Mini progress for completed/active */}
          {status !== 'locked' && subtopicCount > 0 && (
            <div className="mt-3 progress-bar-track w-full h-1.5 rounded-full overflow-hidden">
              <div className="progress-bar-fill h-full rounded-full"
                style={{ width: `${(completedCount / subtopicCount) * 100}%` }}></div>
            </div>
          )}
        </div>
      </div>

      {/* Active label */}
      {status === 'active' && (
        <div className="mt-4 flex items-center gap-2 text-xs font-label font-bold" style={{ color: '#8b5cf6' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
          CURRENT MODULE
        </div>
      )}
    </div>
  );
}
