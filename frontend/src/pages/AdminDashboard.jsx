import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Edit, Trash2, X, Search, Upload } from 'lucide-react';
import { moviesApi } from '../lib/api';
import { useToast } from '../components/ui/Toaster';

export default function AdminDashboard() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [movies, setMovies] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [importLoading, setImportLoading] = useState(false);
    const [omdbImportId, setOmdbImportId] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editMovie, setEditMovie] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const modalRef = useRef(null);

    const fetchMovies = () => {
        setLoading(true);
        moviesApi.getAll({ search, page, limit: 15 })
            .then(r => { setMovies(r.data.movies || []); setTotal(r.data.total || 0); })
            .catch(() => { })
            .finally(() => setLoading(false));
    };

    const handleQuickImport = async () => {
        if (!omdbImportId) {
            toast({ message: "Veuillez entrer un ID IMDb", type: 'warning' });
            return;
        }
        setImportLoading(true);
        try {
            await moviesApi.create({ imdbId: omdbImportId });
            toast({ message: "Film importé avec succès !", type: 'success' });
            setOmdbImportId('');
            fetchMovies();
        } catch (err) {
            toast({ message: err.response?.data?.message || t('errors.server_error'), type: 'error' });
        } finally {
            setImportLoading(false);
        }
    };

    useEffect(() => { fetchMovies(); }, [search, page]);

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
        } catch (err) {
            const msg = err.response?.data?.message || t('errors.server_error');
            toast({ message: msg, type: 'error' });
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
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }} className="animate-fade-in">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ margin: '0 0 0.2rem', fontSize: '1.75rem', fontWeight: 800 }}>{t('admin.movies')}</h1>
                    <p style={{ margin: 0, color: 'var(--color-neutral-400)', fontSize: '0.875rem' }}>{total} film{total !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={openCreate} style={accentBtn}>
                    <Plus size={16} /> {t('admin.add_movie')}
                </button>
            </div>

            {/* Toolbar (Search) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: '1', minWidth: '200px', maxWidth: '380px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)', pointerEvents: 'none' }} />
                    <input
                        type="text" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        placeholder="Chercher un film dans la base..."
                        style={{ width: '100%', paddingLeft: '2.25rem', paddingRight: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', background: 'var(--color-neutral-900)', border: '1px solid var(--color-neutral-700)', borderRadius: 'var(--radius-pill)', color: 'var(--color-neutral-100)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                </div>
            </div>

            {/* Table */}
            <div style={{ background: 'var(--color-bg-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-neutral-800)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }} aria-label="Gestion des films">
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--color-neutral-800)' }}>
                            {['Poster', 'Titre', 'Année', 'Note IMDb', 'Genres', 'Actions'].map(h => (
                                <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-neutral-400)' }}>{h}</th>
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
                                <td style={{ padding: '0.6rem 1rem' }}>
                                    {movie.poster ? <img src={movie.customPoster || movie.poster} alt={movie.title} style={{ width: '36px', height: '54px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} /> : <div style={{ width: '36px', height: '54px', background: 'var(--color-neutral-800)', borderRadius: 'var(--radius-sm)' }} />}
                                </td>
                                <td style={{ padding: '0.6rem 1rem', fontSize: '0.875rem', fontWeight: 600, maxWidth: '220px' }}>
                                    <span className="line-clamp-2">{movie.title}</span>
                                    <span style={{ fontSize: '0.72rem', color: 'var(--color-neutral-400)', display: 'block' }}>{movie.imdbId}</span>
                                </td>
                                <td style={{ padding: '0.6rem 1rem', fontSize: '0.875rem', color: 'var(--color-neutral-400)' }}>{movie.year}</td>
                                <td style={{ padding: '0.6rem 1rem', fontSize: '0.875rem', color: 'var(--color-gold)', fontWeight: 700 }}>
                                    {movie.imdbRating > 0 ? `⭐ ${movie.imdbRating.toFixed(1)}` : '—'}
                                </td>
                                <td style={{ padding: '0.6rem 1rem', fontSize: '0.78rem', maxWidth: '160px' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                        {(movie.genre || []).slice(0, 3).map(g => (
                                            <span key={g} style={{ padding: '0.1rem 0.45rem', background: 'var(--color-neutral-800)', borderRadius: 'var(--radius-pill)', fontSize: '0.7rem', color: 'var(--color-neutral-300)' }}>{g}</span>
                                        ))}
                                    </div>
                                </td>
                                <td style={{ padding: '0.6rem 1rem' }}>
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <IconBtn onClick={() => openEdit(movie)} label={t('admin.edit_movie')} color="var(--color-neutral-400)">
                                            <Edit size={15} />
                                        </IconBtn>
                                        <IconBtn onClick={() => setDeleteId(movie._id)} label={t('admin.delete_movie')} color="var(--color-accent)">
                                            <Trash2 size={15} />
                                        </IconBtn>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!loading && movies.length === 0 && (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-neutral-400)' }}>Aucun film trouvé</td></tr>
                        )}
                    </tbody>
                </table>

                {/* Table pagination */}
                {total > 15 && (
                    <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--color-neutral-800)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-neutral-400)' }}>Page {page} · {total} films</span>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={paginBtn(page === 1)}>← Préc.</button>
                            <button onClick={() => setPage(p => p + 1)} disabled={page * 15 >= total} style={paginBtn(page * 15 >= total)}>Suiv. →</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {modalOpen && (
                <ModalOverlay onClose={handleModalBg}>
                    <MovieForm initial={editMovie} onSave={handleSave} onClose={closeModal} t={t} />
                </ModalOverlay>
            )}

            {/* Confirm Delete Modal */}
            {deleteId && (
                <ModalOverlay onClose={() => setDeleteId(null)}>
                    <div style={{ background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-xl)', padding: '2rem', maxWidth: '380px', width: '100%' }}>
                        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1.1rem', fontWeight: 700 }}>Supprimer le film</h2>
                        <p style={{ color: 'var(--color-neutral-400)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{t('admin.confirm_delete')}</p>
                        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setDeleteId(null)} style={ghostBtn}>{t('admin.cancel')}</button>
                            <button onClick={handleDelete} style={dangerBtn}>{t('admin.delete_movie')}</button>
                        </div>
                    </div>
                </ModalOverlay>
            )}
        </main>
    );
}

function MovieForm({ initial, onSave, onClose, t }) {
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
        }, 400); // 400ms debounce
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
                toast({ message: "Données appliquées !", type: 'success' });
            }
        } catch (err) {
            toast({ message: "Erreur lors de la récupération des détails.", type: 'error' });
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

    const field = (key, opts = {}) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label htmlFor={`field-${key}`} style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-neutral-400)' }}>
                {t(`admin.${key === 'imdbId' ? 'imdb_id' : key + '_field'}`) || key}
            </label>
            {opts.textarea ? (
                <textarea id={`field-${key}`} value={formData[key] || ''} rows={3} onChange={e => setFormData(f => ({ ...f, [key]: e.target.value }))} style={{ ...finput, resize: 'vertical' }} />
            ) : (
                <input id={`field-${key}`} type="text" value={formData[key] || ''} onChange={e => setFormData(f => ({ ...f, [key]: e.target.value }))} style={finput} />
            )}
        </div>
    );

    return (
        <div style={{ background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-xl)', padding: '1.75rem', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>
                    {initial ? t('admin.edit_movie') : t('admin.add_movie')}
                </h2>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-neutral-400)', display: 'flex' }} aria-label={t('common.close')}>
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <label htmlFor="field-title" style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-neutral-400)' }}>
                            {t('admin.title_field') || 'Titre'}
                            {fetching && <span style={{ marginLeft: '0.5rem', color: 'var(--color-accent)', fontStyle: 'italic', textTransform: 'none' }}>Chargement...</span>}
                        </label>
                        <input
                            id="field-title"
                            type="text"
                            value={formData.title}
                            onChange={handleTitleChange}
                            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            style={finput}
                            autoComplete="off"
                        />
                    </div>

                    {showSuggestions && suggestions.length > 0 && (
                        <div style={{
                            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                            background: 'var(--color-bg-dark)', border: '1px solid var(--color-neutral-700)',
                            borderRadius: 'var(--radius-md)', marginTop: '0.25rem', overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                        }}>
                            {suggestions.map((s, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleSelectSuggestion(s)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem',
                                        cursor: 'pointer', borderBottom: i < suggestions.length - 1 ? '1px solid var(--color-neutral-800)' : 'none',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-neutral-800)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    {s.poster ? (
                                        <img src={s.poster} alt={s.title} style={{ width: '24px', height: '36px', objectFit: 'cover', borderRadius: '2px' }} />
                                    ) : (
                                        <div style={{ width: '24px', height: '36px', background: 'var(--color-neutral-700)', borderRadius: '2px' }} />
                                    )}
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{s.title}</span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)' }}>{s.year} • {s.imdbId}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ID IMDb is now purely manual or auto-filled for reference */}
                {field('imdbId')}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {field('year')}
                    {field('genre')}
                </div>
                {field('genreVO')}
                {field('categories')}
                {field('plot', { textarea: true })}
                {field('plotVO', { textarea: true })}
                {field('poster')}

                {/* Image upload */}
                <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-neutral-400)', display: 'block', marginBottom: '0.4rem' }}>{t('admin.upload_poster')}</label>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        {preview && <img src={preview} alt="preview" style={{ width: '50px', height: '75px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />}
                        <button type="button" onClick={() => fileRef.current?.click()} style={ghostBtn}>
                            <Upload size={14} /> Choisir une image
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button type="button" onClick={onClose} style={ghostBtn}>{t('admin.cancel')}</button>
                    <button type="submit" disabled={saving} style={accentBtn}>
                        {saving ? '...' : t('admin.save')}
                    </button>
                </div>
            </form>
        </div>
    );
}

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

const finput = { padding: '0.55rem 0.75rem', background: 'var(--color-neutral-900)', border: '1px solid var(--color-neutral-700)', borderRadius: 'var(--radius-md)', color: 'var(--color-neutral-100)', fontSize: '0.875rem', outline: 'none', width: '100%', boxSizing: 'border-box' };
const accentBtn = { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.25rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-pill)', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', transition: 'background 0.2s' };
const ghostBtn = { display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.6rem 1.1rem', background: 'transparent', border: '1px solid var(--color-neutral-700)', color: 'var(--color-neutral-300)', borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 };
const dangerBtn = { padding: '0.6rem 1.1rem', background: 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-pill)', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' };
const paginBtn = (disabled) => ({ padding: '0.35rem 0.75rem', background: 'var(--color-neutral-800)', border: '1px solid var(--color-neutral-700)', borderRadius: 'var(--radius-md)', color: disabled ? 'var(--color-neutral-700)' : 'var(--color-neutral-200)', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: '0.8rem' });
