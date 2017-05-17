export const FETCH_PROJECT_BIDS = 'FETCH_PROJECT_BIDS';
export const FETCH_PROJECT_BIDS_SUCCESS = 'FETCH_PROJECT_BIDS_SUCCESS';
export const FETCH_PROJECT_BIDS_FAILURE = 'FETCH_PROJECT_BIDS_FAILURE';

export const fetchProjectBids = function(name) {
  return {
    type: FETCH_PROJECT_BIDS,
    name: name,
  }
};

export const fetchProjectBidsSuccess = function (bids) {
  return {
    type: FETCH_PROJECT_BIDS_SUCCESS,
    bids: bids,
  }
};

export const fetchProjectBidsFailure = function (error) {
  return {
    type: FETCH_PROJECT_BIDS_FAILURE,
    error: error,
  }
};
