const storage = sessionStorage;

export const authStorage = {
  getAccessToken: () => storage.getItem('accessToken'),
  getRefreshToken: () => storage.getItem('refreshToken'),
  getUser: () => {
    const stored = storage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  },
  setSession: ({ accessToken, refreshToken, user }) => {
    storage.setItem('accessToken', accessToken);
    storage.setItem('refreshToken', refreshToken);
    storage.setItem('user', JSON.stringify(user));
  },
  clearSession: () => {
    storage.removeItem('accessToken');
    storage.removeItem('refreshToken');
    storage.removeItem('user');
  },
};
