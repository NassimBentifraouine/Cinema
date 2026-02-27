import React from 'react';
import { Link } from 'react-router-dom';

export default function Button({
    children,
    onClick,
    to,
    variant = 'primary',
    size = 'md',
    pill = false,
    className = '',
    style = {},
    disabled = false,
    type = 'button',
    icon: Icon = null
}) {
    const isLink = Boolean(to);
    const Component = isLink ? Link : 'button';

    const getBaseStyles = () => {
        const variants = {
            primary: {
                background: 'var(--color-accent)',
                color: 'white',
                border: 'none',
            },
            secondary: {
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                border: 'none',
            },
            outline: {
                background: 'transparent',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.2)',
            },
            ghost: {
                background: 'transparent',
                color: 'var(--color-neutral-400)',
                border: 'none',
            }
        };

        const sizes = {
            sm: { padding: '0.4rem 1rem', fontSize: '0.85rem' },
            md: { padding: '0.6rem 1.5rem', fontSize: '0.95rem' },
            lg: { padding: '0.8rem 2rem', fontSize: '1.05rem' }
        };

        const variantStyle = variants[variant] || variants.primary;
        const sizeStyle = sizes[size] || sizes.md;

        return {
            ...variantStyle,
            ...sizeStyle,
            borderRadius: pill ? '100px' : 'var(--radius-sm)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.6rem',
            transition: 'all 0.3s cubic-bezier(0.19, 1, 0.22, 1)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            textDecoration: 'none',
            ...style
        };
    };

    const handleMouseEnter = (e) => {
        if (disabled) return;
        if (variant === 'primary') e.currentTarget.style.background = 'var(--color-accent-hover)';
        else if (variant === 'secondary') e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
        else if (variant === 'outline') e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        else if (variant === 'ghost') {
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
        }
    };

    const handleMouseLeave = (e) => {
        if (disabled) return;
        const s = getBaseStyles();
        e.currentTarget.style.background = s.background;
        e.currentTarget.style.color = s.color;
    };

    return (
        <Component
            to={to}
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={className}
            style={getBaseStyles()}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {Icon && <Icon size={size === 'sm' ? 16 : 18} />}
            {children}
        </Component>
    );
}
