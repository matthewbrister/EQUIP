import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/*
  Animated replacement for <select>.

  <Dropdown
    value={status}
    onChange={setStatus}            // receives the new value (not an event)
    options={[{ value: 'a', label: 'Option A' }, ...]}
  />

  The menu renders in a portal so it is never clipped by modals or scroll areas.
  Animation styles (.dropdown-menu) live in index.css.
*/
export default function Dropdown({
    value,
    onChange,
    options,
    placeholder = 'Select…',
    style,
    className = '',
    disabled = false,
    ariaLabel
}) {
    const [mounted, setMounted] = useState(false);
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState(null);
    const [active, setActive] = useState(-1);

    const btnRef = useRef(null);
    const menuRef = useRef(null);
    const closeTimer = useRef(null);

    const selected = options.find(o => o.value === value);

    const openMenu = () => {
        if (disabled) return;
        clearTimeout(closeTimer.current);
        setPos(null);
        setMounted(true);
        setOpen(true);
        setActive(Math.max(0, options.findIndex(o => o.value === value)));
    };

    const closeMenu = useCallback(() => {
        setOpen(false);
        clearTimeout(closeTimer.current);
        closeTimer.current = setTimeout(() => setMounted(false), 140);
    }, []);

    const choose = (opt) => {
        onChange?.(opt.value);
        closeMenu();
        btnRef.current?.focus();
    };

    // Position the menu under (or above) the trigger
    useLayoutEffect(() => {
        if (!mounted || !btnRef.current || !menuRef.current) return;
        const r = btnRef.current.getBoundingClientRect();
        const h = Math.min(menuRef.current.scrollHeight, 260);
        const below = window.innerHeight - r.bottom - 8;
        const above = r.top - 8;
        const up = below < h && above > below;
        setPos({
            top: up ? r.top - 4 - h : r.bottom + 4,
            left: r.left,
            width: r.width,
            up
        });
    }, [mounted]);

    // Close on outside click, Escape, resize, or scrolling something else
    useEffect(() => {
        if (!open) return;
        const onDown = (e) => {
            if (btnRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
            closeMenu();
        };
        const onScroll = (e) => {
            if (menuRef.current?.contains(e.target)) return;
            closeMenu();
        };
        document.addEventListener('mousedown', onDown);
        window.addEventListener('resize', closeMenu);
        window.addEventListener('scroll', onScroll, true);
        return () => {
            document.removeEventListener('mousedown', onDown);
            window.removeEventListener('resize', closeMenu);
            window.removeEventListener('scroll', onScroll, true);
        };
    }, [open, closeMenu]);

    useEffect(() => () => clearTimeout(closeTimer.current), []);

    // Keep the highlighted option in view while using the keyboard
    useEffect(() => {
        if (!open || active < 0) return;
        menuRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
    }, [active, open]);

    const onKeyDown = (e) => {
        if (disabled) return;
        if (!open) {
            if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
                e.preventDefault();
                openMenu();
            }
            return;
        }
        switch (e.key) {
            case 'ArrowDown': e.preventDefault(); setActive(i => Math.min(options.length - 1, i + 1)); break;
            case 'ArrowUp': e.preventDefault(); setActive(i => Math.max(0, i - 1)); break;
            case 'Home': e.preventDefault(); setActive(0); break;
            case 'End': e.preventDefault(); setActive(options.length - 1); break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                if (options[active]) choose(options[active]);
                break;
            case 'Escape': e.preventDefault(); e.stopPropagation(); closeMenu(); break;
            case 'Tab': closeMenu(); break;
            default: break;
        }
    };

    return (
        <>
            <button
                ref={btnRef}
                type="button"
                className={`form-select dropdown-trigger ${className}`}
                style={style}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={ariaLabel}
                onClick={() => (open ? closeMenu() : openMenu())}
                onKeyDown={onKeyDown}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: selected ? 'inherit' : 'var(--text-muted)' }}>
                    {selected ? selected.label : placeholder}
                </span>
                <i className={`bx bx-chevron-down dropdown-caret ${open ? 'is-open' : ''}`}></i>
            </button>

            {mounted && createPortal(
                <div
                    ref={menuRef}
                    role="listbox"
                    className="dropdown-menu"
                    data-state={open ? 'open' : 'closed'}
                    data-up={pos?.up ? 'true' : 'false'}
                    style={{
                        top: pos ? pos.top : 0,
                        left: pos ? pos.left : 0,
                        minWidth: pos ? pos.width : undefined,
                        visibility: pos ? 'visible' : 'hidden'
                    }}
                >
                    {options.map((opt, i) => (
                        <button
                            key={opt.value}
                            type="button"
                            role="option"
                            data-index={i}
                            aria-selected={opt.value === value}
                            className={`dropdown-item ${i === active ? 'is-active' : ''} ${opt.value === value ? 'is-selected' : ''}`}
                            onMouseEnter={() => setActive(i)}
                            onClick={() => choose(opt)}
                        >
                            <span>{opt.label}</span>
                            {opt.value === value && <i className='bx bx-check'></i>}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </>
    );
}