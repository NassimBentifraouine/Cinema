import React from 'react';

export default function Input({
    id,
    label,
    icon: Icon = null,
    error,
    children,
    marginBottom = '1.25rem',
    containerStyle = {},
    ...props
}) {
    return (
        <div style={{ width: '100%', marginBottom, ...containerStyle }}>
            {label && (
                <label
                    htmlFor={id}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: 'var(--color-neutral-500)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        marginBottom: '0.6rem'
                    }}
                >
                    {Icon && <Icon size={14} />} {label}
                </label>
            )}

            <div style={{ position: 'relative' }}>
                {children ? (
                    children
                ) : (
                    <input
                        id={id}
                        {...props}
                        style={{
                            width: '100%',
                            padding: '0.85rem 1rem',
                            fontSize: '1rem',
                            backgroundColor: 'var(--color-bg-dark)',
                            border: `1px solid ${error ? '#ff4d4d' : 'rgba(255,255,255,0.1)'}`,
                            color: 'white',
                            borderRadius: 'var(--radius-sm)',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            ...props.style
                        }}
                        onFocus={(e) => {
                            if (!error) e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                            if (props.onFocus) props.onFocus(e);
                        }}
                        onBlur={(e) => {
                            if (!error) e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                            if (props.onBlur) props.onBlur(e);
                        }}
                    />
                )}
            </div>

            {error && (
                <p style={{ margin: '0.4rem 0 0', fontSize: '0.8rem', color: '#ff4d4d', fontWeight: 600 }}>
                    {error}
                </p>
            )}
        </div>
    );
}
