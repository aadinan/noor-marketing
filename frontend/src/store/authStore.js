import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: (userData, authToken) => set({
                user: userData,
                token: authToken,
                isAuthenticated: true,
            }),

            logout: () => set({
                user: null,
                token: null,
                isAuthenticated: false,
            }),

            updateUser: (updates) => set((state) => ({
                user: { ...state.user, ...updates }
            }))
        }),
        {
            name: 'auth-storage', // saves to localStorage
        }
    )
);

export default useAuthStore;
