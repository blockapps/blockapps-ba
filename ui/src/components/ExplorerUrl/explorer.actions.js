export const GET_EXPLORER_URL = 'GET_EXPLORER_URL';
export const GET_EXPLORER_URL_SUCCESS = 'GET_EXPLORER_URL_SUCCESS';
export const GET_EXPLORER_URL_FAILURE = 'GET_EXPLORER_URL_FAILURE';

export const getExplorerUrl = function() {
  return {
    type: GET_EXPLORER_URL,
  }
};

export const getExplorerUrlSuccess = function(explorerUrl) {
  return {
    type: GET_EXPLORER_URL_SUCCESS,
    explorerUrl: explorerUrl
  }
};

export const getExplorerUrlFailure = function(error) {
  return {
    type: GET_EXPLORER_URL_FAILURE,
    error: error
  }
};