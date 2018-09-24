const HTTP_PROTOCOL = document.location.protocol === "http:" ? "http" : "https";

export const API_URL =
  process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL + '/api/v1'
    : 'http://localhost:3031/api/v1';
export const API_MOCK =
  process.env.REACT_APP_API_MOCK
    ? process.env.REACT_APP_API_MOCK
    : false;
    
export const strato_url = `${HTTP_PROTOCOL}://${window.location.hostname}/strato-api/eth/v1.2`;
export const bloc_url =  `${HTTP_PROTOCOL}://${window.location.hostname}/bloc/v2.2`;