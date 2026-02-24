import { useEffect, useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HeroBanner from '../components/HeroBanner';
import FilterPanel from '../components/FilterPanel';
import MovieCard from '../components/MovieCard';
import Pagination from '../components/Pagination';
import { useFiltersStore } from '../store/filters.store';
import { moviesApi, userApi } from '../lib/api';
import { useAuthStore } from '../store/auth.store';
import { Film } from 'lucide-react';

export default function CataloguePage() {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuthStore();
    const [movies, setMovies] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [searchParams, setSearchParams] = useSearchParams();

    const { search, genre, minRating, sort, page, limit, setSearch, setGenre, setMinRating, setSort, setPage } = useFiltersStore();

    // Sync URL ↔ store on mount
    useEffect(() => {
        const s = searchParams.get('search') || '';
        const g = searchParams.get('genre') || '';
        const r = searchParams.get('minRating') || '';
        const so = searchParams.get('sort') || '';
        const p = parseInt(searchParams.get('page')) || 1;
        if (s) setSearch(s);
        if (g) setGenre(g);
        if (r) setMinRating(r);
        if (so) setSort(so);
        if (p > 1) setPage(p);
    }, []); // eslint-disable-line

    // Sync store → URL
    useEffect(() => {
        const params = {};
        if (search) params.search = search;
        if (genre) params.genre = genre;
        if (minRating) params.minRating = minRating;
        if (sort) params.sort = sort;
        if (page > 1) params.page = page;
        setSearchParams(params, { replace: true });
    }, [search, genre, minRating, sort, page]);

    // Fetch movies
    useEffect(() => {
        setLoading(true);
        moviesApi.getAll({ search, genre, minRating, sort, page, limit })
            .then(r => {
                setMovies(r.data.movies || []);
                setTotal(r.data.total || 0);
                setPages(r.data.pages || 1);
            })
            .catch(() => { setMovies([]); })
            .finally(() => setLoading(false));
    }, [search, genre, minRating, sort, page, limit]);

    // Fetch favorites if authenticated
    useEffect(() => {
        if (!isAuthenticated) return;
        userApi.getFavorites().then(r => {
            setFavorites((r.data.favorites || []).map(f => f._id || f.toString()));
        }).catch(() => { });
    }, [isAuthenticated]);

    const handleToggleFavorite = useCallback(async (movieId) => {
        const isFav = favorites.includes(movieId);
        if (isFav) {
            await userApi.removeFavorite(movieId);
            setFavorites(prev => prev.filter(id => id !== movieId));
        } else {
            await userApi.addFavorite(movieId);
            setFavorites(prev => [...prev, movieId]);
        }
    }, [favorites]);

    return (
        <main style={{ paddingBottom: '4rem' }}>
            <HeroBanner />

            {/* Main Layout Container (Sidebar + Grid) */}
            <div style={{
                display: 'flex',
                gap: '2rem',
                padding: '2rem 4%',
                maxWidth: '1800px',
                margin: '0 auto',
                alignItems: 'flex-start'
            }}>

                {/* Left Sidebar (Filters) */}
                <aside style={{
                    flex: '0 0 280px', /* Fixed width */
                    position: 'sticky',
                    top: '90px' /* Stick below navbar */
                }}>
                    <FilterPanel />


                </aside>

                {/* Right Content (Movie Grid) */}
                <section style={{ flex: '1', minWidth: 0 }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                            {search ? `${t('catalog.search_results', 'Search Results')} (${total})` : t('catalog.new_releases', 'New Releases')}
                        </h2>

                        {/* Tiny layout toggle buttons */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => setViewMode('grid')}
                                style={{
                                    width: '32px', height: '32px',
                                    background: viewMode === 'grid' ? 'var(--color-bg-card)' : 'transparent',
                                    border: '1px solid var(--color-neutral-800)',
                                    borderRadius: '4px',
                                    color: viewMode === 'grid' ? 'white' : 'var(--color-neutral-400)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                {/* Grid icon */}
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect width="6" height="6" /><rect width="6" height="6" x="8" /><rect width="6" height="6" y="8" /><rect width="6" height="6" x="8" y="8" /></svg>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{
                                    width: '32px', height: '32px',
                                    background: viewMode === 'list' ? 'var(--color-bg-card)' : 'transparent',
                                    border: '1px solid var(--color-neutral-800)',
                                    borderRadius: '4px',
                                    color: viewMode === 'list' ? 'white' : 'var(--color-neutral-400)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                {/* List icon */}
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect width="14" height="4" /><rect width="14" height="4" y="5" /><rect width="14" height="4" y="10" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Grid */}
                    {loading && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="skeleton" style={{ aspectRatio: '2/3.5', borderRadius: 'var(--radius-sm)' }} />
                            ))}
                        </div>
                    )}

                    {!loading && movies.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
                            <Film size={48} style={{ color: 'var(--color-neutral-700)', marginBottom: '1rem', margin: '0 auto' }} />
                            <p style={{ color: 'var(--color-neutral-400)', fontSize: '1.1rem' }}>{t('catalog.no_results')}</p>
                        </div>
                    )}

                    {!loading && movies.length > 0 && (
                        <>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: viewMode === 'grid'
                                        ? 'repeat(auto-fill, minmax(220px, 1fr))'
                                        : '1fr',
                                    gap: '1.5rem',
                                    marginBottom: '3rem',
                                }}
                            >
                                {movies.map(movie => (
                                    <MovieCard
                                        key={movie._id}
                                        movie={movie}
                                        variant={viewMode}
                                        isFavorite={favorites.includes(movie._id)}
                                        onToggleFavorite={isAuthenticated ? handleToggleFavorite : null}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            {pages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
                                    {/* Simplistic CineView pagination */}
                                    <button disabled={page === 1} onClick={() => setPage(page - 1)} style={{ width: '36px', height: '36px', background: 'var(--color-bg-card)', border: '1px solid var(--color-neutral-800)', borderRadius: '4px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}>
                                        &lt;
                                    </button>

                                    <button style={{ width: '36px', height: '36px', background: 'var(--color-accent)', border: 'none', borderRadius: '4px', color: 'white', fontWeight: 700 }}>
                                        {page}
                                    </button>

                                    {page < pages && (
                                        <button onClick={() => setPage(page + 1)} style={{ width: '36px', height: '36px', background: 'var(--color-bg-card)', border: '1px solid var(--color-neutral-800)', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>
                                            {page + 1}
                                        </button>
                                    )}

                                    <div style={{ color: 'var(--color-neutral-400)', alignSelf: 'center', padding: '0 0.5rem' }}>...</div>

                                    <button disabled={page === pages} onClick={() => setPage(page + 1)} style={{ width: '36px', height: '36px', background: 'var(--color-bg-card)', border: '1px solid var(--color-neutral-800)', borderRadius: '4px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: page === pages ? 'default' : 'pointer', opacity: page === pages ? 0.5 : 1 }}>
                                        &gt;
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}
