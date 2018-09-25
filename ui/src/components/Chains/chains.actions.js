export const FETCH_CHAINS_REQUEST = 'FETCH_CHAINS_REQUEST';
export const FETCH_CHAINS_SUCCESS = 'FETCH_CHAINS_SUCCESS';
export const FETCH_CHAINS_FAILURE = 'FETCH_CHAINS_FAILURE';
export const SET_CHAIN_ID = 'SET_CHAIN_ID';
export const RESET_CHAIN_ID = 'RESET_CHAIN_ID';

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

export const setChainID = function (chainId) {
  return {
    type: SET_CHAIN_ID,
    chainId
  }
}

export const resetChainID = function () {
  return {
    type: RESET_CHAIN_ID
  }
}