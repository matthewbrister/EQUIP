import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';

/*
  Three walkthroughs, one per role. A step can switch the view and the demo
  role, optionally click something first (`click`, e.g. a tab), then
  highlights the element matching `selector` (no selector = centered card).
  `role: 'guest'` signs out so the step shows what a visitor sees.
*/
const TOURS = {
  facilitator: {
    label: 'Facilitator tour',
    steps: [
      { view: 'landing', role: 'guest', selector: null, title: 'Facilitator walkthrough', body: "This tour follows what a facilitator sees, from logging in to managing a program. Use Next to continue, or Skip to return to the role list." },
      { view: 'landing', role: 'guest', selector: '[data-tour="hero-actions"]', title: 'The landing page', body: 'Visitors can log in, browse the public directory, or read about EQUIP. Facilitators start with Log In.' },
      { view: 'auth', role: 'guest', selector: '[data-tour="auth-card"]', title: 'Signing up', body: 'Facilitators choose Sign Up, pick "Facilitator", connect Google, and confirm their details. A website manager must approve the account before a program can be created.' },
      { view: 'facilitator', role: 'facilitatorApproved', selector: '[data-tour="program-header"]', title: 'Your program hub', body: 'Each facilitator manages one program here. The badge shows whether it is live in the public directory or still a draft.' },
      { view: 'facilitator', role: 'facilitatorApproved', selector: '[data-tour="access-code"]', title: 'Student access code', body: 'Share this code with your students. Copy it, project it as a QR code, or regenerate it at any time.' },
      { view: 'facilitator', role: 'facilitatorApproved', selector: '.tabs-header', title: 'Your workspace', body: 'Technology, projects, roster and program details each have a tab. We will visit the key ones next.' },
      { view: 'facilitator', role: 'facilitatorApproved', click: '[data-tour="tab-roster"]', selector: '[data-tour="roster-periods"]', title: 'Roster and class periods', body: 'Students appear on your roster when they join with your code. Create class periods, then assign each student to one.' },
      { view: 'facilitator', role: 'facilitatorApproved', click: '[data-tour="tab-projects"]', selector: '[data-tour="period-filter"]', title: 'Project review', body: 'Review student submissions and tag each project with one or more class periods. Use these filters to view a single period.' },
      { view: 'facilitator', role: 'facilitatorApproved', click: '[data-tour="tab-settings"]', selector: '[data-tour="visibility-settings"]', title: 'What the public can see', body: 'Your technology inventory and student projects are private by default. Turn them on here if you want them in the public directory.' },
      { view: 'program-create', role: 'facilitatorApproved', selector: 'form', title: 'Creating a program', body: 'New programs start as drafts until a website manager publishes them. You choose public visibility right here as well.' },
      { view: 'facilitator', role: 'facilitatorApproved', selector: null, title: "You've finished the facilitator tour", body: 'Press Done to go back to the role list. This tour will be marked complete.' }
    ]
  },
  student: {
    label: 'Student tour',
    steps: [
      { view: 'landing', role: 'guest', selector: null, title: 'Student walkthrough', body: 'This tour follows what a student sees, from creating an account to opening the dashboard. Use Next to continue, or Skip to return to the role list.' },
      { view: 'landing', role: 'guest', selector: '[data-tour="hero-actions"]', title: 'The landing page', body: 'Students start with Log In. The public directory is open to everyone.' },
      { view: 'auth', role: 'guest', selector: '[data-tour="auth-card"]', title: 'Creating your account', body: 'Choose Sign Up, pick "Student", choose your grade (K to 12), connect Google, and confirm your details. No password to remember.' },
      { view: 'join', role: 'studentNew', selector: '[data-tour="code-card"]', title: 'Enter your access code', body: "After signing up you will see this page. There is no dashboard until you enter the code from your facilitator. The code adds you to your program's roster." },
      { view: 'student', role: 'studentJoined', selector: '.tabs-header', title: 'Your dashboard', body: 'Once you are on a roster you can check which equipment is ready, read manuals, and submit your own projects for approval.' },
      { view: 'public', role: 'studentJoined', selector: '[data-tour="public-profile"]', title: 'The public directory', body: 'Anyone can browse programs here. A program only shows its technology and projects if the facilitator makes them public.' },
      { view: 'landing', role: 'studentJoined', selector: null, title: "You've finished the student tour", body: 'Press Done to go back to the role list. This tour will be marked complete.' }
    ]
  },
  admin: {
    label: 'Website admin tour',
    steps: [
      { view: 'manager', role: 'manager', selector: null, title: 'Website admin walkthrough', body: 'This tour follows what a website admin sees: approving facilitators and publishing programs. Use Next to continue, or Skip to return to the role list.' },
      { view: 'manager', role: 'manager', selector: '.tabs-header', title: 'Two approval queues', body: 'One tab handles facilitator accounts and the other handles program sign-offs. The counts show what is waiting.' },
      { view: 'manager', role: 'manager', click: '.tabs-header .tab-btn:nth-child(1)', selector: '.main-content .card', title: 'Facilitator accounts', body: 'New facilitators wait here. Approving an account unlocks program creation and student access codes.' },
      { view: 'manager', role: 'manager', click: '.tabs-header .tab-btn:nth-child(2)', selector: '.main-content .card', title: 'Program sign-offs', body: 'Review each draft program, then publish it so it appears in the public directory.' },
      { view: 'manager', role: 'manager', selector: null, title: "You've finished the admin tour", body: 'Press Done to go back to the role list. This tour will be marked complete.' }
    ]
  }
};

const PAD = 8;       // spotlight padding around the target
const GAP = 14;      // distance between spotlight and tooltip
const MARGIN = 12;   // viewport margin

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export default function FeedbackTour({ role, currentView, setCurrentView, onSelectRole, onClose }) {
  const tour = TOURS[role] || TOURS.facilitator;
  const STEPS = tour.steps;
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

    let clicked = false;
    const locate = () => {
      if (cancelled) return;
      if (step.click && !clicked) {
        const trigger = document.querySelector(step.click);
        if (trigger) {
          clicked = true;
          trigger.click();
          timer = setTimeout(locate, 150);
          return;
        }
      }
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
    if (isLast) onClose({ completed: true });
    else setIndex(i => i + 1);
  }, [isLast, onClose]);

  const back = useCallback(() => setIndex(i => Math.max(0, i - 1)), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose({ completed: false });
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
          background: rect ? 'transparent' : 'rgba(0, 0, 0, 0.6)',
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
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 0 2px var(--color-primary)',
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
            {tour.label} · Step {index + 1} of {STEPS.length}
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
              onClick={() => onClose({ completed: false })}
              style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.3rem 0.2rem' }}
            >
              Skip tour
            </button>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {!isFirst && (
                <button type="button" className="btn btn-secondary btn-sm" onClick={back}>
                  Back
                </button>
              )}
              <button type="button" className="btn btn-primary btn-sm" onClick={next}>
                {isFirst ? 'Start tour' : isLast ? 'Done' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}