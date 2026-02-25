import { useTranslation } from 'react-i18next';
import { SlidersHorizontal, Search } from 'lucide-react';
import { useFiltersStore } from '../store/filters.store';


import GlassPanel from './ui/GlassPanel';
import Input from './ui/Input';
import Button from './ui/Button';

const GENRES = [
    'Action', 'Adventure', 'Animation', 'Biography', 'Comedy',
    'Crime', 'Documentary', 'Drama', 'Fantasy', 'Horror',
    'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'Western',
];

export default function FilterPanel() {
    const { t } = useTranslation();
    const { search, genre, minRating, sort, setSearch, setGenre, setMinRating, setSort, resetFilters } = useFiltersStore();

    const hasFilters = search || genre || minRating || sort;

    return (
        <GlassPanel padding="1.5rem" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <SlidersHorizontal size={20} color="var(--color-accent)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{t('catalog.filter_title', 'Discovery Filters')}</h3>
            </div>

            {/* Search */}
            <div style={{ marginBottom: '-1rem' }}>
                <Input
                    id="filter-search"
                    label={t('catalog.search_placeholder', 'Search Movies')}
                    icon={Search}
                    placeholder="Inception, Dark Knight..."
                    value={search || ''}
                    onChange={(e) => setSearch(e.target.value)}
                    marginBottom="0"
                />
            </div>

            {/* Category */}
            <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    {t('catalog.filter_genre', 'CATEGORY')}
                </label>
                <div style={{ position: 'relative' }}>
                    <select
                        value={genre}
                        onChange={e => setGenre(e.target.value)}
                        style={{
                            width: '100%',
                            backgroundColor: 'var(--color-bg-dark)',
                            border: '1px solid var(--color-neutral-800)',
                            color: 'var(--color-white)',
                            padding: '0.8rem 2.5rem 0.8rem 1rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.9rem',
                            appearance: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        <option value="">{t('catalog.all_genres', 'All Genres')}</option>
                        {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    {/* Custom chevron */}
                    <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-neutral-400)' }}>
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Min Rating Slider */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {t('catalog.filter_rating', 'MIN. RATING')}
                    </label>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                        {minRating || 0}+
                    </span>
                </div>
                <input
                    type="range"
                    min="0" max="10" step="1"
                    value={minRating || 0}
                    onChange={(e) => setMinRating(e.target.value)}
                    style={{
                        width: '100%',
                        accentColor: 'var(--color-accent)',
                        height: '4px',
                        background: 'var(--color-neutral-800)',
                        borderRadius: 'var(--radius-pill)',
                        appearance: 'none',
                        outline: 'none',
                        cursor: 'pointer'
                    }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--color-neutral-400)' }}>
                    <span>0</span>
                    <span>5</span>
                    <span>10</span>
                </div>
            </div>

            {/* Sort By Radios */}
            <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-neutral-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                    {t('catalog.filter_sort', 'SORT BY')}
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: sort === 'rating' ? 'white' : 'var(--color-neutral-200)' }}>
                        <input
                            type="radio"
                            name="sort"
                            checked={sort === 'rating'}
                            onChange={() => setSort('rating')}
                            style={{ accentColor: 'var(--color-accent)', width: '16px', height: '16px' }}
                        />
                        {t('catalog.sort_pop', 'Popularity')}
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: sort === 'date' ? 'white' : 'var(--color-neutral-200)' }}>
                        <input
                            type="radio"
                            name="sort"
                            checked={sort === 'date'}
                            onChange={() => setSort('date')}
                            style={{ accentColor: 'var(--color-accent)', width: '16px', height: '16px' }}
                        />
                        {t('catalog.sort_date', 'Release Date')}
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: sort === 'title' ? 'white' : 'var(--color-neutral-200)' }}>
                        <input
                            type="radio"
                            name="sort"
                            checked={sort === 'title'}
                            onChange={() => setSort('title')}
                            style={{ accentColor: 'var(--color-accent)', width: '16px', height: '16px' }}
                        />
                        {t('catalog.sort_rating', 'Top Rated')}
                    </label>
                </div>
            </div>

            {/* Apply Filters Button */}
            <Button
                variant="outline"
                style={{ width: '100%', marginTop: '0.5rem' }}
                onClick={() => { }}
            >
                {t('catalog.apply_filters', 'APPLY FILTERS')}
            </Button>

            {/* Soft Reset hint if applied */}
            {hasFilters && (
                <button
                    onClick={resetFilters}
                    style={{
                        background: 'transparent', border: 'none', color: 'var(--color-neutral-400)',
                        fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline', alignSelf: 'center'
                    }}
                >
                    {t('catalog.clear_all', 'Clear all')}
                </button>
            )}
        </GlassPanel>
    );
}
