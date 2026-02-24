import { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ value = 0, onChange, max = 10, readOnly = false, size = 20 }) {
    const [hovered, setHovered] = useState(0);

    return (
        <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}
            role={readOnly ? 'img' : 'group'}
            aria-label={readOnly ? `Note: ${value}/10` : 'Choisissez une note'}
        >
            {Array.from({ length: max }).map((_, i) => {
                const val = i + 1;
                const filled = readOnly ? val <= value : val <= (hovered || value);
                return (
                    <button
                        key={val}
                        type="button"
                        disabled={readOnly}
                        onClick={() => !readOnly && onChange && onChange(val)}
                        onMouseEnter={() => !readOnly && setHovered(val)}
                        onMouseLeave={() => !readOnly && setHovered(0)}
                        aria-label={`${val} étoile${val > 1 ? 's' : ''}`}
                        style={{
                            background: 'none', border: 'none', padding: '0.1rem',
                            cursor: readOnly ? 'default' : 'pointer',
                            transition: 'transform 0.15s',
                        }}
                        onFocus={e => { if (!readOnly) e.currentTarget.style.transform = 'scale(1.2)'; }}
                        onBlur={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                        <Star
                            size={size}
                            fill={filled ? 'var(--color-gold)' : 'transparent'}
                            color={filled ? 'var(--color-gold)' : 'var(--color-neutral-700)'}
                            style={{ transition: 'fill 0.15s, color 0.15s' }}
                        />
                    </button>
                );
            })}
            {!readOnly && (hovered || value) > 0 && (
                <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-gold)' }}>
                    {hovered || value}/10
                </span>
            )}
        </div>
    );
}
