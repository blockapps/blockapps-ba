export const API_URL =
  process.env.DEVMODE === 'true'
    ? 'http://localhost:3031/api/v1'
    : '/server/api/v1';