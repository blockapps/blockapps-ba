const HTTP_PROTOCOL = document.location.protocol === "http:" ? "http" : "https";

export const API_URL =
  process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL + '/api/v1'
    : 'http://localhost/api/v1';
export const API_MOCK =
  process.env.REACT_APP_API_MOCK
    ? process.env.REACT_APP_API_MOCK
    : false;