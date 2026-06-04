export const isAuthenticated = () => !!localStorage.getItem('accessToken');

export const isGuest = () => localStorage.getItem('isGuest') === 'true';
