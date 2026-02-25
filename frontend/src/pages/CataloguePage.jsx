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

// UI Components
import Button from '../components/ui/Button';

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
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Sync store → URL
    useEffect(() => {
        const params = {};
        if (search) params.search = search;
        if (genre) params.genre = genre;
        if (minRating) params.minRating = minRating;
        if (sort) params.sort = sort;
        if (page > 1) params.page = page;
        setSearchParams(params, { replace: true });
    }, [search, genre, minRating, sort, page, setSearchParams]);

    // Fetch movies
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
                    {/* Results Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.5rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <div style={{ width: '20px', height: '2px', backgroundColor: 'var(--color-accent)' }} />
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-accent)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                                    {t('catalog.discover', 'DISCOVER')}
                                </span>
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
                                {search ? `${t('catalog.search_results', 'Résultats')} (${total})` : t('catalog.new_releases', 'Nouveautés')}
                            </h2>
                        </div>

                        {/* Tiny layout toggle buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <Button
                                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                                size="sm"
                                padding="0.5rem"
                                onClick={() => setViewMode('grid')}
                                style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <svg width="28" height="28" viewBox="0 0 14 14" fill="currentColor"><rect width="6" height="6" /><rect width="6" height="6" x="8" /><rect width="6" height="6" y="8" /><rect width="6" height="6" x="8" y="8" /></svg>
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'primary' : 'outline'}
                                size="sm"
                                padding="0.5rem"
                                onClick={() => setViewMode('list')}
                                style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <svg width="28" height="28" viewBox="0 0 14 14" fill="currentColor"><rect width="14" height="4" /><rect width="14" height="4" y="5" /><rect width="14" height="4" y="10" /></svg>
                            </Button>
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
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page === 1}
                                        onClick={() => setPage(page - 1)}
                                        style={{ width: '36px', height: '36px' }}
                                    >
                                        &lt;
                                    </Button>

                                    <Button
                                        variant="primary"
                                        size="sm"
                                        style={{ width: '36px', height: '36px', fontWeight: 700 }}
                                    >
                                        {page}
                                    </Button>

                                    {page < pages && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(page + 1)}
                                            style={{ width: '36px', height: '36px' }}
                                        >
                                            {page + 1}
                                        </Button>
                                    )}

                                    <div style={{ color: 'var(--color-neutral-400)', alignSelf: 'center', padding: '0 0.5rem' }}>...</div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page === pages}
                                        onClick={() => setPage(page + 1)}
                                        style={{ width: '36px', height: '36px' }}
                                    >
                                        &gt;
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}
