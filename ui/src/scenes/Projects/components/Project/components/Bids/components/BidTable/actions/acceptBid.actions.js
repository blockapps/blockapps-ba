export const ACCEPT_BID = 'ACCEPT_BID';
export const ACCEPT_BID_SUCCESS = 'ACCEPT_BID_SUCCESS';
export const ACCEPT_BID_FAILURE = 'ACCEPT_BID_FAILURE';

export const acceptBid = function(username, projectName, bidId) {
  return {
    type: ACCEPT_BID,
    username: username,
    projectName: projectName,
    id: bidId
  }
};

export const acceptBidSuccess= function() {
  return {
    type: ACCEPT_BID_SUCCESS
  }
};

export const acceptBidFailure = function(err) {
  return {
    type: ACCEPT_BID_FAILURE,
    err: err
  }
};
