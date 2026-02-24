import React from 'react';
import { Link } from 'react-router-dom';

export default function NavLink({ to, children, color = 'white', active = false }) {
    return (
        <Link
            to={to}
            style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: color,
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                transition: 'all 0.3s ease',
                opacity: active ? 1 : 0.8,
                background: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                textDecoration: 'none'
            }}
            onMouseEnter={e => {
                e.currentTarget.style.opacity = 1;
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            }}
            onMouseLeave={e => {
                if (!active) {
                    e.currentTarget.style.opacity = 0.8;
                    e.currentTarget.style.background = 'transparent';
                }
            }}
        >
            {children}
        </Link>
    );
}
