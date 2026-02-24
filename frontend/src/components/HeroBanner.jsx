import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, ChevronRight } from 'lucide-react';
import { moviesApi } from '../lib/api';

export default function HeroBanner() {
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
        }, 6000);
        return () => clearInterval(interval);
    }, [idx, films]);

    if (!featured) return <HeroBannerSkeleton />;

    const posterSrc = featured.customPoster
        ? `http://localhost:3001${featured.customPoster}`
        : featured.poster;

    return (
        <div
            style={{
                position: 'relative', width: '100%', height: 'min(70vh, 600px)',
                overflow: 'hidden',
            }}
            aria-label={`Film en vedette: ${featured.title}`}
        >
            {/* Background image */}
            <img
                src={posterSrc}
                alt={featured.title}
                style={{
                    width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top',
                    filter: 'blur(0px) brightness(0.45)',
                    transition: 'opacity 0.8s ease',
                }}
            />

            {/* Gradient overlays */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to right, rgba(7,7,15,0.95) 0%, rgba(7,7,15,0.5) 50%, transparent 100%)',
            }} />
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px',
                background: 'linear-gradient(transparent, var(--color-bg-dark))',
            }} />

            {/* Content */}
            <div style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                padding: '0 clamp(1.5rem, 5vw, 5rem)',
            }}>
                <div style={{ maxWidth: '560px' }} className="animate-fade-in">
                    {/* Genre badges */}
                    {featured.genre?.slice(0, 3).map(g => (
                        <span key={g} style={{
                            display: 'inline-block', marginRight: '0.4rem', marginBottom: '0.75rem',
                            padding: '0.15rem 0.6rem', fontSize: '0.7rem', fontWeight: 600,
                            borderRadius: 'var(--radius-pill)', background: 'var(--color-accent-muted)',
                            color: 'var(--color-accent)', border: '1px solid var(--color-accent)',
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}>
                            {g}
                        </span>
                    ))}

                    <h1 style={{ margin: '0 0 0.75rem', fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.1, color: 'white' }}>
                        {featured.title}
                    </h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        {featured.year && <span style={{ color: 'var(--color-neutral-400)', fontSize: '0.9rem' }}>{featured.year}</span>}
                        {featured.imdbRating > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <Star size={16} fill="var(--color-gold)" color="var(--color-gold)" />
                                <span style={{ fontWeight: 700, color: 'var(--color-gold)', fontSize: '1rem' }}>
                                    {featured.imdbRating.toFixed(1)}/10
                                </span>
                            </div>
                        )}
                        {featured.runtime && <span style={{ color: 'var(--color-neutral-400)', fontSize: '0.9rem' }}>{featured.runtime}</span>}
                    </div>

                    {featured.plot && (
                        <p className="line-clamp-3" style={{
                            color: 'var(--color-neutral-200)', lineHeight: 1.65,
                            fontSize: '0.95rem', marginBottom: '1.5rem',
                        }}>
                            {featured.plot}
                        </p>
                    )}

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <Link
                            to={`/movie/${featured.imdbId || featured._id}`}
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                                padding: '0.7rem 1.5rem', borderRadius: 'var(--radius-pill)',
                                background: 'var(--color-accent)', color: 'white',
                                fontWeight: 700, fontSize: '0.9rem',
                                transition: 'background 0.2s, transform 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-accent-hover)'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-accent)'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                            <Play size={16} fill="white" />
                            Voir le détail
                        </Link>
                        <Link
                            to="/"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                padding: '0.7rem 1.25rem', borderRadius: 'var(--radius-pill)',
                                background: 'rgba(255,255,255,0.1)', color: 'white',
                                fontWeight: 600, fontSize: '0.9rem',
                                border: '1px solid rgba(255,255,255,0.15)',
                                transition: 'background 0.2s',
                                backdropFilter: 'blur(8px)',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                        >
                            Explorer <ChevronRight size={15} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Slide indicators */}
            {films.length > 1 && (
                <div style={{ position: 'absolute', bottom: '1.5rem', right: '2rem', display: 'flex', gap: '0.4rem' }}>
                    {films.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { setIdx(i); setFeatured(films[i]); }}
                            aria-label={`Film ${i + 1}`}
                            aria-current={i === idx}
                            style={{
                                width: i === idx ? '24px' : '8px', height: '8px',
                                borderRadius: 'var(--radius-pill)', border: 'none',
                                background: i === idx ? 'var(--color-accent)' : 'rgba(255,255,255,0.3)',
                                cursor: 'pointer', transition: 'width 0.3s, background 0.3s', padding: 0,
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function HeroBannerSkeleton() {
    return (
        <div className="skeleton" style={{ height: 'min(70vh, 600px)', width: '100%', borderRadius: 0 }} />
    );
}
