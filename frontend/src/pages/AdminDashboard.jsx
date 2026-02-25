import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, X, Search, Upload } from 'lucide-react';
import { moviesApi } from '../lib/api';
import { useToast } from '../components/ui/Toaster';

// UI Components
import GlassPanel from '../components/ui/GlassPanel';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function AdminDashboard() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [movies, setMovies] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMovie, setEditMovie] = useState(null);
    const [deleteId, setDeleteId] = useState(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchMovies = (isInitial = false) => {
        if (isInitial) setLoading(true);
        else setIsSearching(true);

        moviesApi.getAll({ search: debouncedSearch, page, limit: 15 })
            .then(r => {
                setMovies(r.data.movies || []);
                setTotal(r.data.total || 0);
            })
            .catch(() => { })
            .finally(() => {
                setLoading(false);
                setIsSearching(false);
            });
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchMovies(loading && search === ''); // Only full loading on first mount
    }, [debouncedSearch, page]);

    const openCreate = () => { setEditMovie(null); setModalOpen(true); };
    const openEdit = (m) => { setEditMovie(m); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditMovie(null); };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await moviesApi.delete(deleteId);
            toast({ message: 'Film supprimé', type: 'success' });
            setDeleteId(null);
            fetchMovies();
        } catch {
            toast({ message: t('errors.server_error'), type: 'error' });
        }
    };

    const handleSave = async (formData) => {
        try {
            if (editMovie) {
                await moviesApi.update(editMovie._id, formData);
                toast({ message: 'Film mis à jour', type: 'success' });
            } else {
                await moviesApi.create(formData);
                toast({ message: 'Film créé', type: 'success' });
            }
            closeModal();
            fetchMovies();
        } catch {
            toast({ message: t('errors.server_error'), type: 'error' });
        }
    };

    // Close modal on outside click
    const handleModalBg = (e) => { if (e.target === e.currentTarget) closeModal(); };

    // Keyboard: close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') { closeModal(); setDeleteId(null); } };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    return (
        <main style={{ width: '92%', maxWidth: '1400px', margin: '0 auto', padding: '160px 0 4rem' }} className="animate-fade-in">
            {/* Page Header */}
            <header style={{ marginBottom: '3.5rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '32px', height: '2px', backgroundColor: 'var(--color-accent)' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-accent)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                        {t('admin.management', 'MANAGEMENT')}
                    </span>
                </div>
                <h1 style={{
                    margin: 0,
                    fontSize: '3rem',
                    fontWeight: 950,
                    letterSpacing: '-0.04em',
                    lineHeight: 1.1,
                    color: 'white'
                }}>
                    {t('admin.movies')}
                </h1>
                <p style={{ margin: '0.5rem 0 0', color: 'var(--color-neutral-400)', fontSize: '1.05rem', fontWeight: 500 }}>
                    <strong style={{ color: 'white', fontWeight: 900 }}>{total}</strong> {t('admin.movies_count')}
                </p>
            </header>

            {/* Premium Action Bar */}
            <GlassPanel padding="1.25rem 1.5rem" borderRadius="var(--radius-xl)" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '4rem',
                flexWrap: 'wrap',
                gap: '1.5rem',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.4)'
            }}>
                <div style={{ position: 'relative', flex: '1', minWidth: '280px', maxWidth: '500px', opacity: isSearching ? 0.7 : 1, transition: 'opacity 0.2s' }}>
                    <Input
                        icon={Search}
                        placeholder={t('admin.search_placeholder')}
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        style={{
                            paddingLeft: '2.8rem',
                            borderRadius: 'var(--radius-pill)',
                            height: '52px',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            fontSize: '1rem'
                        }}
                        marginBottom="0"
                    />
                    {isSearching && (
                        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                            <div className="skeleton" style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                        </div>
                    )}
                </div>

                <Button
                    onClick={openCreate}
                    icon={Plus}
                    pill
                    size="lg"
                    style={{
                        height: '52px',
                        padding: '0 2rem',
                        boxShadow: '0 10px 25px rgba(229, 9, 20, 0.25)',
                        fontSize: '1rem'
                    }}
                >
                    {t('admin.add_movie')}
                </Button>
            </GlassPanel>

            {/* Table */}
            <GlassPanel padding="0" style={{ border: '1px solid var(--color-neutral-800)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }} aria-label="Gestion des films">
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-neutral-800)' }}>
                            {[t('admin.col_poster'), t('admin.col_title'), t('admin.col_year'), t('admin.col_imdb_rating'), t('admin.col_genres'), t('admin.col_actions')].map(h => (
                                <th key={h} style={{ padding: '1.25rem 1.5rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-neutral-400)' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading && Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i}>
                                <td colSpan={6} style={{ padding: '0.6rem 1rem' }}>
                                    <div className="skeleton" style={{ height: '36px', borderRadius: 'var(--radius-md)' }} />
                                </td>
                            </tr>
                        ))}
                        {!loading && movies.map(movie => (
                            <tr key={movie._id} style={{ borderBottom: '1px solid var(--color-neutral-900)', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-neutral-900)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    {movie.poster ? <img src={movie.customPoster || movie.poster} alt={movie.title} style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} /> : <div style={{ width: '40px', height: '60px', background: 'var(--color-neutral-800)', borderRadius: 'var(--radius-sm)' }} />}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', fontWeight: 700, maxWidth: '280px' }}>
                                    <span className="line-clamp-2">{movie.title}</span>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--color-neutral-500)', display: 'block', marginTop: '0.2rem' }}>{movie.imdbId}</span>
                                </td>
                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.9rem', color: 'var(--color-neutral-400)', fontWeight: 600 }}>{movie.year}</td>
                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.95rem', color: 'var(--color-gold)', fontWeight: 800 }}>
                                    {movie.imdbRating > 0 ? `⭐ ${movie.imdbRating.toFixed(1)}` : '—'}
                                </td>
                                <td style={{ padding: '1rem 1.5rem', fontSize: '0.78rem', maxWidth: '200px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                        {(movie.genre || []).slice(0, 3).map(g => (
                                            <span key={g} style={{ padding: '0.1rem 0.45rem', background: 'var(--color-neutral-800)', borderRadius: 'var(--radius-pill)', fontSize: '0.7rem', color: 'var(--color-neutral-300)' }}>{g}</span>
                                        ))}
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                                        <IconBtn onClick={() => openEdit(movie)} label={t('admin.edit_movie')} color="var(--color-neutral-400)">
                                            <Edit size={16} />
                                        </IconBtn>
                                        <IconBtn onClick={() => setDeleteId(movie._id)} label={t('admin.delete_movie')} color="var(--color-accent)">
                                            <Trash2 size={16} />
                                        </IconBtn>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && movies.length === 0 && (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-neutral-400)' }}>{t('admin.no_movies')}</td></tr>
                        )}
                    </tbody>
                </table>

                {/* Table pagination */}
                {total > 15 && (
                    <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--color-neutral-800)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-neutral-400)' }}>{t('admin.page_info_admin', { page, total })}</span>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>{t('admin.prev')}</Button>
                            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 15 >= total}>{t('admin.next')}</Button>
                        </div>
                    </div>
                )}
            </GlassPanel>

            {/* Create/Edit Modal */}
            {
                modalOpen && (
                    <ModalOverlay onClose={handleModalBg}>
                        <MovieForm initial={editMovie} onSave={handleSave} onClose={closeModal} t={t} />
                    </ModalOverlay>
                )
            }

            {/* Confirm Delete Modal */}
            {
                deleteId && (
                    <ModalOverlay onClose={() => setDeleteId(null)}>
                        <GlassPanel padding="2rem" style={{ maxWidth: '380px', width: '100%' }}>
                            <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem', fontWeight: 700 }}>{t('admin.title')}</h2>
                            <p style={{ color: 'var(--color-neutral-400)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{t('admin.confirm_delete')}</p>
                            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                <Button variant="ghost" onClick={() => setDeleteId(null)}>{t('admin.cancel')}</Button>
                                <Button onClick={handleDelete}>{t('admin.delete_movie')}</Button>
                            </div>
                        </GlassPanel>
                    </ModalOverlay>
                )
            }
        </main >
    );
}

const MovieForm = ({ initial, onSave, onClose, t }) => {
    const fileRef = useRef(null);
    const [formData, setFormData] = useState({
        imdbId: initial?.imdbId || '',
        title: initial?.title || '',
        titleVO: initial?.titleVO || '',
        year: initial?.year || '',
        genre: (initial?.genre || []).join(', '),
        genreVO: (initial?.genreVO || []).join(', '),
        categories: (initial?.categories || []).join(', '),
        plot: initial?.plot || '',
        plotVO: initial?.plotVO || '',
        poster: initial?.poster || '',
    });
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(initial?.poster || '');
    const [saving, setSaving] = useState(false);

    const [fetching, setFetching] = useState(false);
    const { toast } = useToast();

    const handleFile = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceTimeout = useRef(null);

    const handleTitleChange = (e) => {
        const val = e.target.value;
        setFormData(f => ({ ...f, title: val }));

        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

        if (val.trim().length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        debounceTimeout.current = setTimeout(async () => {
            try {
                const { data } = await moviesApi.getOmdbSuggestions(val);
                if (data && data.length > 0) {
                    setSuggestions(data);
                    setShowSuggestions(true);
                } else {
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            } catch (err) {
                console.error("Erreur suggestions", err);
            }
        }, 400);
    };

    const handleSelectSuggestion = async (suggestion) => {
        setShowSuggestions(false);
        setFetching(true);
        try {
            const { data } = await moviesApi.getOmdbPreview(suggestion.imdbId);
            if (data) {
                setFormData(prev => ({
                    ...prev,
                    imdbId: data.imdbId || prev.imdbId,
                    title: data.title || prev.title,
                    titleVO: data.titleVO || prev.titleVO,
                    year: data.year || prev.year,
                    genre: Array.isArray(data.genre) ? data.genre.join(', ') : (data.genre || prev.genre),
                    genreVO: Array.isArray(data.genreVO) ? data.genreVO.join(', ') : (data.genreVO || prev.genreVO),
                    categories: Array.isArray(data.categories) ? data.categories.join(', ') : (data.categories || prev.categories),
                    plot: data.plot || prev.plot,
                    plotVO: data.plotVO || prev.plotVO,
                    poster: data.poster || prev.poster,
                    imdbRating: data.imdbRating || prev.imdbRating
                }));
                if (data.poster) setPreview(data.poster);
                toast({ message: t('admin.data_applied'), type: 'success' });
            }
        } catch {
            toast({ message: t('admin.fetch_error'), type: 'error' });
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const fd = new FormData();
        Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
        if (file) fd.append('poster', file);
        await onSave(fd);
        setSaving(false);
    };

    const inputGroup = (key, label, opts = {}) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label htmlFor={`field-${key}`} style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-neutral-400)' }}>
                {label}
            </label>
            {opts.textarea ? (
                <textarea
                    id={`field-${key}`}
                    value={formData[key] || ''}
                    rows={opts.rows || 3}
                    onChange={e => setFormData(f => ({ ...f, [key]: e.target.value }))}
                    style={{ ...finput, resize: 'vertical', minHeight: '80px' }}
                    placeholder={opts.placeholder}
                />
            ) : (
                <input
                    id={`field-${key}`}
                    type="text"
                    value={formData[key] || ''}
                    onChange={e => setFormData(f => ({ ...f, [key]: e.target.value }))}
                    style={finput}
                    placeholder={opts.placeholder}
                    autoComplete="off"
                />
            )}
        </div>
    );

    return (
        <GlassPanel padding="2.5rem" borderRadius="var(--radius-2xl)" style={{
            maxWidth: '850px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.7)',
            position: 'relative'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                        <div style={{ width: '20px', height: '2px', backgroundColor: 'var(--color-accent)' }} />
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-accent)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                            {initial ? t('admin.modal_edit_prefix') : t('admin.modal_add_prefix')}
                        </span>
                    </div>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 950, letterSpacing: '-0.02em' }}>
                        {initial ? t('admin.edit_movie') : t('admin.add_movie')}
                    </h2>
                </div>
                <button onClick={onClose} style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    aria-label={t('common.close')}>
                    <X size={18} />
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Ligne 1: Titre & ID IMDb */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                            <label htmlFor="field-title" style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-neutral-400)' }}>
                                {t('admin.title_field') || t('admin.title_main')}
                                {fetching && <span style={{ marginLeft: '0.5rem', color: 'var(--color-accent)', fontStyle: 'italic', textTransform: 'none' }}>{t('admin.hydrating')}</span>}
                            </label>
                            <input
                                id="field-title"
                                type="text"
                                value={formData.title}
                                onChange={handleTitleChange}
                                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                style={{ ...finput, height: '56px', fontSize: '1.2rem', fontWeight: 700 }}
                                placeholder="Ex: Inception"
                                autoComplete="off"
                            />
                        </div>

                        {showSuggestions && suggestions.length > 0 && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                                background: 'rgba(20,20,20,0.95)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 'var(--radius-lg)', marginTop: '0.5rem', overflow: 'hidden',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)'
                            }}>
                                {suggestions.map((s, i) => (
                                    <div
                                        key={i}
                                        onClick={() => handleSelectSuggestion(s)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.6rem 1rem',
                                            cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{ width: '28px', height: '42px', flexShrink: 0, background: 'var(--color-neutral-800)', borderRadius: '4px', overflow: 'hidden' }}>
                                            {s.poster && <img src={s.poster} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{s.title}</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)' }}>{s.year} • {s.imdbId}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {inputGroup('imdbId', 'ID IMDb', { placeholder: 'tt0000000' })}
                </div>

                {/* Ligne 2: Titre VO & Année */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem' }}>
                    {inputGroup('titleVO', t('admin.title_vo', 'Titre Original (VO)'), { placeholder: 'Original Title' })}
                    {inputGroup('year', t('admin.year_field'), { placeholder: '2024' })}
                </div>

                {/* Ligne 3: Genres & Genres VO */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    {inputGroup('genre', t('admin.genre_field'), { placeholder: 'Action, Drame' })}
                    {inputGroup('genreVO', t('admin.genre_vo', 'Genres (VO)'), { placeholder: 'Action, Drama' })}
                </div>

                {/* Ligne 4: Catégories & Poster URL */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.25rem' }}>
                    {inputGroup('categories', t('admin.categories_field'), { placeholder: 'Blockbuster...' })}
                    {inputGroup('poster', t('admin.poster_url', 'URL de l\'affiche'), { placeholder: 'https://...' })}
                </div>

                {/* Ligne 5: Synopsis FR & VO (Side by Side) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    {inputGroup('plot', t('admin.plot_fr', 'Synopsis (FR)'), { textarea: true, rows: 2, placeholder: 'Résumé...' })}
                    {inputGroup('plotVO', t('admin.plot_vo', 'Synopsis (VO)'), { textarea: true, rows: 2, placeholder: 'Summary...' })}
                </div>

                {/* Section Upload & Footer simplifiée */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '1rem',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    gap: '1.5rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '40px', height: '60px', flexShrink: 0, background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {preview ? (
                                <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <Upload size={20} opacity={0.2} />
                            )}
                        </div>
                        <Button type="button" onClick={() => fileRef.current?.click()} size="sm" variant="outline" icon={Upload}>
                            {t('admin.upload_poster', 'Transférer')}
                        </Button>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Button type="button" variant="ghost" onClick={onClose} style={{ fontWeight: 700 }}>
                            {t('admin.cancel', 'Annuler')}
                        </Button>
                        <Button type="submit" disabled={saving} size="md" style={{ minWidth: '140px', fontWeight: 800 }}>
                            {saving ? '...' : (initial ? t('admin.btn_update', 'METTRE À JOUR') : t('admin.btn_save', 'ENREGISTRER'))}
                        </Button>
                    </div>
                </div>
            </form>
        </GlassPanel>
    );
};

function ModalOverlay({ children, onClose }) {
    return (
        <div
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', backdropFilter: 'blur(4px)' }}
            role="dialog" aria-modal="true"
        >
            <div onClick={e => e.stopPropagation()} className="animate-scale-in">
                {children}
            </div>
        </div>
    );
}

function IconBtn({ children, label, color, onClick }) {
    return (
        <button onClick={onClick} aria-label={label} title={label}
            style={{ background: 'var(--color-neutral-800)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.4rem', cursor: 'pointer', color, display: 'flex', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-neutral-700)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-neutral-800)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
            {children}
        </button>
    );
}

const finput = {
    padding: '0 1.25rem',
    height: '52px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 'var(--radius-lg)',
    color: 'var(--color-neutral-100)',
    fontSize: '1rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
};
