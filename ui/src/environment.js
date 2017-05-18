export const API_URL =
  process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL + '/api/v1'
    : 'http://localhost:3000/api/v1';
export const API_MOCK =
  process.env.REACT_APP_API_MOCK
    ? process.env.REACT_APP_API_MOCK
    : false;
