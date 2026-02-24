import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onPageChange }) {
    const { t } = useTranslation();
    if (pages <= 1) return null;

    const getPages = () => {
        const result = [];
        const delta = 2;
        const left = Math.max(1, page - delta);
        const right = Math.min(pages, page + delta);
        if (left > 1) { result.push(1); if (left > 2) result.push('...'); }
        for (let i = left; i <= right; i++) result.push(i);
        if (right < pages) { if (right < pages - 1) result.push('...'); result.push(pages); }
        return result;
    };

    return (
        <nav aria-label="Pagination" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <PageBtn
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                aria-label={t('catalog.pagination_prev')}
            >
                <ChevronLeft size={16} />
            </PageBtn>

            {getPages().map((p, i) =>
                p === '...' ? (
                    <span key={`ellipsis-${i}`} style={{ padding: '0 0.25rem', color: 'var(--color-neutral-400)' }}>…</span>
                ) : (
                    <PageBtn key={p} active={p === page} onClick={() => onPageChange(p)} aria-label={`Page ${p}`} aria-current={p === page ? 'page' : undefined}>
                        {p}
                    </PageBtn>
                )
            )}

            <PageBtn
                onClick={() => onPageChange(page + 1)}
                disabled={page === pages}
                aria-label={t('catalog.pagination_next')}
            >
                <ChevronRight size={16} />
            </PageBtn>

            <span style={{ fontSize: '0.8rem', color: 'var(--color-neutral-400)', marginLeft: '0.5rem' }}>
                {t('catalog.page_info', { current: page, total: pages })}
            </span>
        </nav>
    );
}

function PageBtn({ children, active, disabled, ...props }) {
    return (
        <button
            disabled={disabled}
            {...props}
            style={{
                minWidth: '36px', height: '36px', padding: '0 0.5rem',
                borderRadius: 'var(--radius-md)',
                border: active ? 'none' : '1px solid var(--color-neutral-700)',
                background: active ? 'var(--color-accent)' : 'var(--color-bg-card)',
                color: active ? 'white' : disabled ? 'var(--color-neutral-700)' : 'var(--color-neutral-200)',
                fontWeight: active ? 700 : 400,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!disabled && !active) e.currentTarget.style.borderColor = 'var(--color-accent)'; }}
            onMouseLeave={e => { if (!disabled && !active) e.currentTarget.style.borderColor = 'var(--color-neutral-700)'; }}
        >
            {children}
        </button>
    );
}
