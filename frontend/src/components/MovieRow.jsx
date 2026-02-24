import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

export default function MovieRow({ title, movies, loading, favorites, onToggleFavorite, isAuthenticated }) {
    const rowRef = useRef(null);

    const scroll = (direction) => {
        if (rowRef.current) {
            const { current } = rowRef;
            const scrollAmount = direction === 'left' ? -current.offsetWidth + 100 : current.offsetWidth - 100;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div style={{ marginBottom: '3rem', position: 'relative' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', padding: '0 4%' }}>
                    {title}
                </h2>
                <div className="row-container">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="row-item skeleton" style={{ aspectRatio: '2/3', borderRadius: 'var(--radius-sm)' }} />
                    ))}
                </div>
            </div>
        );
    }

    if (!movies || movies.length === 0) return null;

    return (
        <div style={{ marginBottom: '3vw', position: 'relative' }} className="group">
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem', padding: '0 4%', color: 'var(--color-neutral-100)' }}>
                {title}
            </h2>

            {/* Scroll Buttons */}
            <button
                onClick={() => scroll('left')}
                style={{
                    position: 'absolute', top: '50%', left: 0, bottom: 0,
                    width: '4%', zIndex: 20,
                    background: 'rgba(20,20,20,0.7)', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', opacity: 0, transition: 'all 0.2s',
                    color: 'white'
                }}
                className="group-hover:opacity-100"
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(20,20,20,0.9)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(20,20,20,0.7)'}
            >
                <ChevronLeft size={36} />
            </button>

            <button
                onClick={() => scroll('right')}
                style={{
                    position: 'absolute', top: '50%', right: 0, bottom: 0,
                    width: '4%', zIndex: 20,
                    background: 'rgba(20,20,20,0.7)', border: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', opacity: 0, transition: 'all 0.2s',
                    color: 'white'
                }}
                className="group-hover:opacity-100"
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(20,20,20,0.9)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(20,20,20,0.7)'}
            >
                <ChevronRight size={36} />
            </button>

            {/* Row Container */}
            <div ref={rowRef} className="row-container">
                {movies.map(movie => (
                    <div key={movie._id} className="row-item" style={{ position: 'relative' }}>
                        <MovieCard
                            movie={movie}
                            isFavorite={favorites.includes(movie._id)}
                            onToggleFavorite={isAuthenticated ? onToggleFavorite : null}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
