import React from 'react';

const FranceFlag = () => (
    <svg viewBox="0 0 512 512" style={{ width: '20px', height: '20px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
        <path fill="#ED2939" d="M341.3 0H512v512H341.3z" />
        <path fill="#F4F4F4" d="M170.7 0h170.6v512H170.7z" />
        <path fill="#002395" d="M0 0h170.7v512H0z" />
    </svg>
);

const UKFlag = () => (
    <svg viewBox="0 0 512 512" style={{ width: '20px', height: '20px', borderRadius: '50%', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}>
        <path fill="#012169" d="M0 0h512v512H0z" />
        <path fill="#FFF" d="M512 0v64H322L512 212v68H295l217 127v105h-64L256 319l-192 193H0V407l217-127H0v-68l190-148H0V0h64l192 193L448 0z" />
        <path fill="#C8102E" d="M512 0L256 256 0 0h64l192 192L448 0zM0 512l256-256 256 256h-64L256 320 64 512zM512 212v88H0v-88zM212 512V0h88v512z" />
    </svg>
);

export default function LangButton({ lang, current, onClick, title }) {
    const active = current === lang;
    return (
        <button
            onClick={onClick}
            title={title}
            style={{
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: active ? 1 : 0.6,
                transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                padding: '6px',
                borderRadius: '50%',
                transform: active ? 'scale(1.05)' : 'scale(0.95)',
                filter: active ? 'none' : 'grayscale(50%) brightness(0.8)',
                boxShadow: active ? '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)' : 'none',
                outline: 'none'
            }}
            onMouseEnter={e => {
                if (!active) {
                    e.currentTarget.style.opacity = 0.8;
                    e.currentTarget.style.filter = 'grayscale(20%) brightness(0.9)';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }
            }}
            onMouseLeave={e => {
                if (!active) {
                    e.currentTarget.style.opacity = 0.6;
                    e.currentTarget.style.filter = 'grayscale(50%) brightness(0.8)';
                    e.currentTarget.style.background = 'transparent';
                }
            }}
        >
            {lang === 'fr' ? <FranceFlag /> : <UKFlag />}
        </button>
    );
}
