import React from 'react';
import { Link } from 'react-router-dom';

export default function NavLink({ to, children, color = 'white', active = false }) {
    const isRedAccent = color === 'var(--color-accent)';

    return (
        <Link
            to={to}
            style={{
                position: 'relative',
                fontSize: '0.9rem',
                fontWeight: 800,
                color: color,
                padding: '0.5rem 1rem',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: active ? 1 : 0.7,
                textDecoration: 'none',
                letterSpacing: '0.02em',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}
            onMouseEnter={e => {
                e.currentTarget.style.opacity = 1;
                e.currentTarget.querySelector('.nav-indicator').style.transform = 'translateX(-50%) scale(1)';
                e.currentTarget.querySelector('.nav-indicator').style.opacity = '1';
                if (!isRedAccent) e.currentTarget.style.textShadow = '0 0 15px rgba(255,255,255,0.4)';
            }}
            onMouseLeave={e => {
                if (!active) {
                    e.currentTarget.style.opacity = 0.7;
                    e.currentTarget.querySelector('.nav-indicator').style.transform = 'translateX(-50%) scale(0)';
                    e.currentTarget.querySelector('.nav-indicator').style.opacity = '0';
                    e.currentTarget.style.textShadow = 'none';
                }
            }}
        >
            <span style={{ position: 'relative', zIndex: 2 }}>{children}</span>
            <div
                className="nav-indicator"
                style={{
                    position: 'absolute',
                    bottom: '2px',
                    left: '50%',
                    transform: `translateX(-50%) scale(${active ? 1 : 0})`,
                    opacity: active ? 1 : 0,
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: isRedAccent ? color : 'white',
                    boxShadow: `0 0 10px 2px ${isRedAccent ? color : 'rgba(255,255,255,0.6)'}`,
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    zIndex: 1
                }}
            />
        </Link>
    );
}
