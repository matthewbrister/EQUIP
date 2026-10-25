import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';

/*
  Walkthrough steps. Each step can switch the view and/or the demo role, then
  highlights an element found with `selector`. No selector = centered card.
*/
const FAC = 'Facilitator view';
const MGR = 'Site manager view';

const STEPS = [
  {
    section: FAC,
    view: 'facilitator',
    role: 'facilitatorApproved',
    selector: null,
    title: 'Welcome, and thank you!',
    body: "We'll start with what a facilitator sees, then finish with what the site manager sees. Afterwards, explore freely and note anything confusing or missing."
  },
  {
    section: FAC,
    view: 'facilitator',
    role: 'facilitatorApproved',
    selector: '[data-tour="program-header"]',
    title: 'Your program hub',
    body: 'Each facilitator manages one program here. The badge shows whether it is live in the public directory or still a draft awaiting approval.'
  },
  {
    section: FAC,
    view: 'facilitator',
    role: 'facilitatorApproved',
    selector: '[data-tour="access-code"]',
    title: 'Student access code',
    body: 'Share this code with your students. Copy it, project it as a QR code, or regenerate it at any time.'
  },
  {
    section: FAC,
    view: 'facilitator',
    role: 'facilitatorApproved',
    selector: '.tabs-header',
    title: 'Technology, projects and details',
    body: 'Catalog equipment, review student project submissions, and edit your program profile. Program Details also controls what the public can see.'
  },
  {
    section: FAC,
    view: 'program-create',
    role: 'facilitatorApproved',
    selector: 'form',
    title: 'Creating a program',
    body: 'New programs start as drafts. You choose here whether your technology inventory and student projects are public. Both are private by default.'
  },
  {
    section: MGR,
    view: 'manager',
    role: 'manager',
    selector: '.tabs-header',
    title: 'Site manager portal',
    body: 'Managers switch between facilitator account approvals and program sign-offs using these tabs.'
  },
  {
    section: MGR,
    view: 'manager',
    role: 'manager',
    selector: '.main-content .card',
    title: 'Approval queue',
    body: 'New facilitators and draft programs wait here. Approving an account unlocks program creation, and publishing a program lists it in the directory.'
  },
  {
    section: MGR,
    view: 'manager',
    role: 'manager',
    selector: null,
    title: "That's the tour!",
    body: 'Explore however you like. The Feedback Mode button in the corner lets you restart this tour anytime.'
  }
];

const PAD = 8;       // spotlight padding around the target
const GAP = 14;      // distance between spotlight and tooltip
const MARGIN = 12;   // viewport margin

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export default function FeedbackTour({ currentView, setCurrentView, onSelectRole, onClose }) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const [ready, setReady] = useState(false);
  const [tipHeight, setTipHeight] = useState(220);
  const [vp, setVp] = useState({ w: window.innerWidth, h: window.innerHeight });

  const elRef = useRef(null);
  const tipRef = useRef(null);
  const viewRef = useRef(currentView);
  viewRef.current = currentView;

  const step = STEPS[index];
  const isFirst = index === 0;
  const isLast = index === STEPS.length - 1;

  const measure = useCallback(() => {
    setVp({ w: window.innerWidth, h: window.innerHeight });
    if (elRef.current && document.contains(elRef.current)) {
      setRect(elRef.current.getBoundingClientRect());
    }
  }, []);

  // Move to a step: switch view/role, wait for the target, scroll to it, measure it.
  useEffect(() => {
    let cancelled = false;
    let timer;
    let tries = 0;

    setReady(false);
    elRef.current = null;

    if (step.role) onSelectRole(step.role);
    const needsViewChange = step.view !== viewRef.current;
    if (needsViewChange) setCurrentView(step.view);

    const locate = () => {
      if (cancelled) return;
      if (!step.selector) {
        setRect(null);
        setReady(true);
        return;
      }
      const el = document.querySelector(step.selector);
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'auto' });
        requestAnimationFrame(() => {
          if (cancelled) return;
          elRef.current = el;
          setRect(el.getBoundingClientRect());
          setReady(true);
        });
      } else if (tries++ < 20) {
        timer = setTimeout(locate, 100);
      } else {
        setRect(null);
        setReady(true);
      }
    };

    // Give the app's scroll-to-top and the new view a moment to render
    timer = setTimeout(locate, needsViewChange ? 450 : 60);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Keep the spotlight aligned on scroll/resize
  useEffect(() => {
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure]);

  // Measure the tooltip so it can be placed above or below correctly
  useLayoutEffect(() => {
    if (tipRef.current) setTipHeight(tipRef.current.offsetHeight);
  }, [index, ready, vp.w]);

  const next = useCallback(() => {
    if (isLast) onClose();
    else setIndex(i => i + 1);
  }, [isLast, onClose]);

  const back = useCallback(() => setIndex(i => Math.max(0, i - 1)), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') back();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, back, onClose]);

  // ---- Tooltip placement ----
  const W = Math.min(340, vp.w - MARGIN * 2);
  let top, left, arrow = null;

  if (!rect) {
    top = Math.max(MARGIN, (vp.h - tipHeight) / 2);
    left = (vp.w - W) / 2;
  } else {
    const spaceBelow = vp.h - (rect.bottom + PAD);
    const spaceAbove = rect.top - PAD;
    const need = tipHeight + GAP + MARGIN;
    const centerX = rect.left + rect.width / 2;
    left = clamp(centerX - W / 2, MARGIN, vp.w - W - MARGIN);

    if (spaceBelow >= need || (spaceBelow >= spaceAbove && spaceBelow >= need * 0.7)) {
      top = rect.bottom + PAD + GAP;
      arrow = 'up';
    } else if (spaceAbove >= need) {
      top = rect.top - PAD - GAP - tipHeight;
      arrow = 'down';
    } else {
      // Target is too large to sit beside: dock the tooltip at the bottom, no arrow
      top = vp.h - tipHeight - MARGIN;
    }
    top = clamp(top, MARGIN, Math.max(MARGIN, vp.h - tipHeight - MARGIN));
    var arrowLeft = clamp(centerX - left, 22, W - 22);
  }

  const arrowStyle = arrow && {
    position: 'absolute',
    left: arrowLeft - 7,
    width: 14,
    height: 14,
    background: 'var(--bg-surface)',
    transform: 'rotate(45deg)',
    ...(arrow === 'up'
      ? { top: -8, borderLeft: '1px solid var(--border-strong)', borderTop: '1px solid var(--border-strong)' }
      : { bottom: -8, borderRight: '1px solid var(--border-strong)', borderBottom: '1px solid var(--border-strong)' })
  };

  return (
    <>
      {/* Click blocker (dims the page fully when there is no spotlight) */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          background: rect ? 'transparent' : 'rgba(15, 23, 42, 0.55)',
          transition: 'background-color 200ms ease'
        }}
      />

      {/* Spotlight cutout */}
      {rect && (
        <div
          style={{
            position: 'fixed',
            zIndex: 201,
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.55), 0 0 0 2px var(--color-primary)',
            pointerEvents: 'none',
            opacity: ready ? 1 : 0,
            transition: 'top 250ms ease, left 250ms ease, width 250ms ease, height 250ms ease, opacity 200ms ease'
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tipRef}
        role="dialog"
        aria-label="Site walkthrough"
        style={{
          position: 'fixed',
          zIndex: 210,
          top,
          left,
          width: W,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          padding: '1.1rem 1.1rem 0.9rem',
          opacity: ready ? 1 : 0,
          pointerEvents: ready ? 'auto' : 'none',
          transition: 'opacity 200ms ease, top 250ms ease, left 250ms ease'
        }}
      >
        {arrow && <div style={arrowStyle} />}

        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>
            {step.section} · Step {index + 1} of {STEPS.length}
          </div>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '0.35rem' }}>{step.title}</h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step.body}</p>

          {/* Progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', margin: '1rem 0 0.85rem' }}>
            {STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to step ${i + 1}`}
                onClick={() => setIndex(i)}
                style={{
                  width: i === index ? 18 : 7,
                  height: 7,
                  borderRadius: 999,
                  background: i === index ? 'var(--color-primary)' : i < index ? 'var(--color-primary-border)' : 'var(--border-strong)',
                  transition: 'width 200ms ease, background-color 200ms ease'
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.3rem 0.2rem' }}
            >
              {isLast ? 'Close' : 'Skip tour'}
            </button>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {!isFirst && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={back}>
                  Back
                </button>
              )}
              <button type="button" className="btn btn-primary btn-sm" onClick={next}>
                {isFirst ? 'Start tour' : isLast ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* Small floating control shown in feedback mode once the tour is closed */
export function FeedbackPill({ onRestart, onSwitchMode }) {
  return (
    <div
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 120,
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.3rem',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-full)',
        boxShadow: 'var(--shadow-lg)'
      }}
    >
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary)', padding: '0 0.5rem' }}>
        <i className='bx bx-message-square-detail' style={{ marginRight: 4 }}></i>Feedback Mode
      </span>
      <button type="button" className="btn btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)' }} onClick={onRestart}>
        Restart tour
      </button>
      <button type="button" className="btn btn-secondary btn-sm" style={{ borderRadius: 'var(--radius-full)' }} onClick={onSwitchMode}>
        Exit
      </button>
    </div>
  );
}