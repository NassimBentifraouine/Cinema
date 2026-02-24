import { useEffect, useCallback } from 'react';
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
import { useState } from 'react';

export default function CataloguePage() {
    const { t } = useTranslation();
    const { isAuthenticated } = useAuthStore();
    const [movies, setMovies] = useState([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState([]);
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
        <main>
            <HeroBanner />

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
                {/* Section header */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <h2 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700 }}>
                        {t('catalog.title')}
                    </h2>
                    {!loading && (
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-neutral-400)' }}>
                            {total} film{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
                        </p>
                    )}
                </div>

                {/* Filters */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <FilterPanel />
                </div>

                {/* Loading skeleton grid */}
                {loading && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 'var(--radius-lg)' }} />
                        ))}
                    </div>
                )}

                {/* No results */}
                {!loading && movies.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
                        <Film size={48} style={{ color: 'var(--color-neutral-700)', marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--color-neutral-400)', fontSize: '1.1rem' }}>{t('catalog.no_results')}</p>
                    </div>
                )}

                {/* Movie grid */}
                {!loading && movies.length > 0 && (
                    <>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                gap: '1rem',
                                marginBottom: '2rem',
                            }}
                        >
                            {movies.map(movie => (
                                <MovieCard
                                    key={movie._id}
                                    movie={movie}
                                    isFavorite={favorites.includes(movie._id)}
                                    onToggleFavorite={isAuthenticated ? handleToggleFavorite : null}
                                />
                            ))}
                        </div>

                        <Pagination page={page} pages={pages} onPageChange={setPage} />
                    </>
                )}
            </div>
        </main>
    );
}
