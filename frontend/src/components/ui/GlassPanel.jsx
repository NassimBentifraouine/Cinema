import React from 'react';

export default function GlassPanel({
    children,
    className = '',
    style = {},
    padding = '2rem',
    blur = '24px',
    borderRadius = '1.25rem',
    border = '1px solid rgba(255, 255, 255, 0.12)',
    background = 'rgba(18, 18, 18, 0.98)'
}) {
    return (
        <div
            className={className}
            style={{
                backgroundColor: background,
                backdropFilter: `blur(${blur})`,
                border: border,
                borderRadius: borderRadius,
                padding: padding,
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                ...style
            }}
        >
            {children}
        </div>
    );
}
