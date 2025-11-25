import { jwtDecode } from 'jwt-decode';

export function getUserFromToken(token) {
  try {
    const decoded = jwtDecode(token);
    return {
      id: decoded.id,
      email: decoded.email,
      displayName: decoded.displayName,
      isVerified: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}
