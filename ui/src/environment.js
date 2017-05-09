export const API_URL =
  process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL
    : 'http://localhost:9001/v1';

export const API_MOCK =
  process.env.REACT_APP_API_MOCK
    ? process.env.REACT_APP_API_MOCK
    : false;

export const POLL_INTERVAL = 1 * 1000;
