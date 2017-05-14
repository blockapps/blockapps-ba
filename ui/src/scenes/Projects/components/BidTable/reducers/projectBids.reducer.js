import {
  FETCH_PROJECT_BIDS,
  FETCH_PROJECT_BIDS_SUCCESS,
  FETCH_PROJECT_BIDS_FAILURE,
} from '../actions/projectBids.actions';

const initialState = {
  bids: [],
  error: null,
};

const reducer = function (state = initialState, action) {
  switch (action.type) {
    case FETCH_PROJECT_BIDS:
      return {
        bids: [],
        error: null,
      };
    case FETCH_PROJECT_BIDS_SUCCESS:
      return {
        bids: action.bids,
        error: null,
      };
    case FETCH_PROJECT_BIDS_FAILURE:
      return {
        bids: [],
        error: action.error
      };
    default:
      return state;
  }
};

export default reducer;
