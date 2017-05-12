import {
  FETCH_PROJECT_BIDS,
  FETCH_PROJECT_BIDS_SUCCESS,
  FETCH_PROJECT_BIDS_FAILURE,
} from './bidTable.actions';

const initialState = {
  bids: [],
  error: null,
};

const reducer = function (state = initialState, action) {
  switch (action.type) {
    case FETCH_PROJECT_BIDS:
      return {
        bids: state.bids,
        error: null,
      };
    case FETCH_PROJECT_BIDS_SUCCESS:
      console.log('>>>> actiom bids >>>>', action.bids);
      return {
        bids: action.bids,
        error: null,
      };
    case FETCH_PROJECT_BIDS_FAILURE:
      return {
        bids: state.bids,
        error: action.error
      };
    default:
      return state;
  }
};

export default reducer;
