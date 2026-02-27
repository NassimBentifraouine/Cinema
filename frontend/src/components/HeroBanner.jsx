import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { moviesApi } from '../lib/api';

export default function HeroBanner() {
    const { t, i18n } = useTranslation();
    const [featured, setFeatured] = useState(null);
    const [idx, setIdx] = useState(0);
    const [films, setFilms] = useState([]);

    useEffect(() => {
        moviesApi.getAll({ sort: 'rating', limit: 5, minRating: 7 })
            .then(r => {
                const movies = r.data.movies?.filter(m => m.poster) || [];
                if (movies.length) { setFilms(movies); setFeatured(movies[0]); }
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        if (films.length < 2) return;
        const interval = setInterval(() => {
            const next = (idx + 1) % films.length;
            setIdx(next);
            setFeatured(films[next]);
        }, 8000);
        return () => clearInterval(interval);
    }, [idx, films]);

    if (!featured) return <HeroBannerSkeleton />;

    const posterSrc = featured.customPoster
        ? `http://localhost:3001${featured.customPoster}`
        : featured.poster;

    const isEn = i18n.language === 'en';
    const displayTitle = (isEn && featured.titleVO) ? featured.titleVO : featured.title;
    const displayPlot = (isEn && featured.plotVO) ? featured.plotVO : featured.plot;

    const titleWords = displayTitle ? displayTitle.split(' ') : ['THE', 'MOVIE'];
    const firstWord = titleWords[0];
    const restOfTitle = titleWords.slice(1).join(' ');

    return (
        <div
            style={{
                position: 'relative', width: '100%', height: '80vh',
                minHeight: '600px', backgroundColor: 'var(--color-bg-dark)',
                overflow: 'hidden'
            }}
            aria-label={`Film en vedette: ${displayTitle}`}
        >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                <img
                    src={posterSrc}
                    alt={displayTitle}
                    style={{
                        width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%',
                        transition: 'opacity 1s ease-in-out',
                        opacity: 0.9
                    }}
                />
            </div>

            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to right, rgba(18, 12, 12, 1) 10%, rgba(18, 12, 12, 0.4) 50%, transparent 100%)',
            }} />
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
                background: 'linear-gradient(to top, var(--color-bg-dark) 0%, transparent 100%)',
            }} />

            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                display: 'flex', alignItems: 'center', zIndex: 10
            }}>
                <div style={{
                    width: '92%', maxWidth: '1400px', margin: '0 auto',
                    padding: '0 2.5rem', boxSizing: 'border-box'
                }}>
                    <div className="animate-fade-in" key={featured._id} style={{ maxWidth: '650px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{
                                backgroundColor: 'rgba(229, 9, 20, 0.2)',
                                color: 'var(--color-accent)',
                                border: '1px solid rgba(229, 9, 20, 0.4)',
                                padding: '0.3rem 0.75rem',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                letterSpacing: '0.05em'
                            }}>
                                {t('catalog.trending_prefix', 'TRENDING')} #{idx + 1}
                            </div>
                            {featured.imdbRating > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}>
                                    <Star size={14} fill="var(--color-gold)" color="var(--color-gold)" />
                                    <span style={{ fontSize: '0.9rem' }}>{featured.imdbRating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>

                        <h1 style={{
                            margin: '0 0 1.5rem', fontSize: 'clamp(3.5rem, 8vw, 5.5rem)',
                            fontWeight: 900, lineHeight: 1, color: 'white',
                            textTransform: 'uppercase', fontStyle: 'italic',
                            letterSpacing: '-0.02em',
                            display: 'flex', flexDirection: 'column'
                        }}>
                            <span>{firstWord}</span>
                            <span style={{ color: 'var(--color-accent)' }}>{restOfTitle || 'MOVIE'}</span>
                        </h1>

                        {displayPlot && (
                            <p className="line-clamp-3" style={{
                                color: 'var(--color-neutral-200)', lineHeight: 1.6,
                                fontSize: '1.1rem', marginBottom: '2.5rem', fontWeight: 400,
                                maxWidth: '500px'
                            }}>
                                {displayPlot}
                            </p>
                        )}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Link
                                to={`/movie/${featured.imdbId || featured._id}`}
                                className="btn-primary"
                                style={{ padding: '0.8rem 2rem', fontSize: '1rem', backgroundColor: 'var(--color-accent)', color: 'white', borderRadius: '4px', fontWeight: 800 }}
                            >
                                <Info size={20} />
                                {t('catalog.more_info', 'More Info')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HeroBannerSkeleton() {
    return (
        <div className="skeleton" style={{ height: '80vh', minHeight: '600px', width: '100%', borderRadius: 0 }} />
    );
}
