import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useFiltersStore } from '../store/filters.store';

const GENRES = [
    'Action', 'Adventure', 'Animation', 'Biography', 'Comedy',
    'Crime', 'Documentary', 'Drama', 'Fantasy', 'Horror',
    'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Western',
];

const LIMITS = [10, 20, 40];

export default function FilterPanel() {
    const { t } = useTranslation();
    const { search, genre, minRating, sort, limit, setSearch, setGenre, setMinRating, setSort, setLimit, resetFilters } = useFiltersStore();

    const hasFilters = search || genre || minRating || sort;

    return (
        <div
            style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-neutral-800)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                alignItems: 'center',
            }}
        >
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '200px' }}>
                <Search
                    size={15}
                    style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)', pointerEvents: 'none' }}
                />
                <input
                    type="text"
                    id="search-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t('catalog.search_placeholder')}
                    aria-label={t('catalog.search_placeholder')}
                    style={{
                        width: '100%', paddingLeft: '2.25rem', paddingRight: search ? '2rem' : '0.75rem',
                        paddingTop: '0.5rem', paddingBottom: '0.5rem',
                        background: 'var(--color-neutral-900)',
                        border: '1px solid var(--color-neutral-700)',
                        borderRadius: 'var(--radius-pill)', color: 'var(--color-neutral-100)',
                        fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--color-neutral-700)'}
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        aria-label="Effacer la recherche"
                        style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-400)', display: 'flex' }}
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Genre */}
            <FilterSelect
                id="genre-filter"
                label={t('catalog.filter_genre')}
                value={genre}
                onChange={setGenre}
            >
                <option value="">{t('catalog.all_genres')}</option>
                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
            </FilterSelect>

            {/* Min Rating */}
            <FilterSelect
                id="rating-filter"
                label={t('catalog.filter_rating')}
                value={minRating}
                onChange={setMinRating}
            >
                <option value="">Tous</option>
                {[6, 7, 8, 9].map(r => <option key={r} value={r}>≥ {r}</option>)}
            </FilterSelect>

            {/* Sort */}
            <FilterSelect
                id="sort-filter"
                label={t('catalog.filter_sort')}
                value={sort}
                onChange={setSort}
            >
                <option value="">Par défaut</option>
                <option value="rating">{t('catalog.sort_rating')}</option>
                <option value="date">{t('catalog.sort_date')}</option>
                <option value="title">{t('catalog.sort_title')}</option>
            </FilterSelect>

            {/* Limit */}
            <FilterSelect
                id="limit-filter"
                label={t('catalog.limit')}
                value={limit}
                onChange={v => setLimit(Number(v))}
            >
                {LIMITS.map(l => <option key={l} value={l}>{l}</option>)}
            </FilterSelect>

            {/* Reset button */}
            {hasFilters && (
                <button
                    onClick={resetFilters}
                    aria-label="Réinitialiser les filtres"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                        padding: '0.5rem 0.9rem', borderRadius: 'var(--radius-pill)',
                        border: '1px solid var(--color-accent)',
                        background: 'var(--color-accent-muted)', color: 'var(--color-accent)',
                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                        transition: 'all 0.2s', whiteSpace: 'nowrap',
                    }}
                >
                    <SlidersHorizontal size={13} />
                    Réinitialiser
                </button>
            )}
        </div>
    );
}

function FilterSelect({ id, label, value, onChange, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <label htmlFor={id} style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {label}
            </label>
            <select
                id={id}
                value={value}
                onChange={e => onChange(e.target.value)}
                style={{
                    padding: '0.45rem 0.75rem',
                    background: 'var(--color-neutral-900)',
                    border: '1px solid var(--color-neutral-700)',
                    borderRadius: 'var(--radius-md)', color: 'var(--color-neutral-100)',
                    fontSize: '0.875rem', cursor: 'pointer', outline: 'none',
                    transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                onBlur={e => e.target.style.borderColor = 'var(--color-neutral-700)'}
            >
                {children}
            </select>
        </div>
    );
}
