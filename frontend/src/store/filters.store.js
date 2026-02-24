import { create } from 'zustand';

export const useFiltersStore = create((set) => ({
    search: '',
    genre: '',
    minRating: '',
    sort: '',
    page: 1,
    limit: 20,

    setSearch: (search) => set({ search, page: 1 }),
    setGenre: (genre) => set({ genre, page: 1 }),
    setMinRating: (minRating) => set({ minRating, page: 1 }),
    setSort: (sort) => set({ sort, page: 1 }),
    setPage: (page) => set({ page }),
    setLimit: (limit) => set({ limit, page: 1 }),
    resetFilters: () => set({ search: '', genre: '', minRating: '', sort: '', page: 1, limit: 20 }),
}));
