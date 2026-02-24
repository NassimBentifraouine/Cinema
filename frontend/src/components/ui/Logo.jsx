import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ height = '32px', className = '' }) {
    return (
        <Link
            to="/"
            className={`logo-container ${className}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                outline: 'none',
                height: height,
                transition: 'transform 0.3s ease',
                textDecoration: 'none'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
            <svg viewBox="0 0 800 400" style={{ height: '100%', width: 'auto' }}>
                <defs>
                    <filter id="netflix-shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.8" />
                    </filter>
                </defs>
                <path id="curve" d="M 50 280 Q 400 330 750 280" fill="transparent" />
                <text
                    fontFamily="'Arial Black', Impact, 'Helvetica Neue', sans-serif"
                    fontSize="160"
                    fontWeight="900"
                    letterSpacing="15"
                    fill="#FFFFFF"
                    textAnchor="middle"
                    filter="url(#netflix-shadow)"
                >
                    <textPath href="#curve" startOffset="50%">CINÉMA</textPath>
                </text>
            </svg>
        </Link>
    );
}
