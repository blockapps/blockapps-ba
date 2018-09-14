export const FETCH_CHAINS_REQUEST = 'FETCH_CHAINS_REQUEST';
export const FETCH_CHAINS_SUCCESS = 'FETCH_CHAINS_SUCCESS';
export const FETCH_CHAINS_FAILURE = 'FETCH_CHAINS_FAILURE';

export const fetchChains = function () {
  return {
    type: FETCH_CHAINS_REQUEST
  }
};

export const fetchChainsSuccess = function (chains) {
  return {
    type: FETCH_CHAINS_SUCCESS,
    chains: chains,
  }
};

export const fetchChainsFailure = function (error) {
  return {
    type: FETCH_CHAINS_FAILURE,
    error: error,
  }
};