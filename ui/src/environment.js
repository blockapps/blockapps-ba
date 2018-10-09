export const API_URL =
  process.env.DEVMODE === 'true'
    ? 'http://localhost:3031/api/v1'
    : '/server/api/v1';

export const APP_TOKEN_COOKIE_NAME = 'strato_oauth_demo_session';
export const USER_ROLE_COOKIE_NAME = 'user-role';