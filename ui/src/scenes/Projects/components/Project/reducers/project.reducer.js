import {
  FETCH_PROJECT,
  FETCH_PROJECT_SUCCESS,
  FETCH_PROJECT_FAILURE,
} from '../actions/project.actions';

import {
  FETCH_PROJECT_BIDS_SUCCESS
} from '../../BidTable/bidTable.actions';

import bidTableReducer from '../../BidTable/bidTable.reducer';

const initialState = {
  project: '',
  isUpdating: false,
  message: ''
};

const reducer = function (state=initialState, action) {
  // console.log('########################', action.type, state.nodes);
  switch (action.type) {
    case FETCH_PROJECT:
      return {
        project: state.project,
        isUpdating: true,
        message: ''
      };
    case FETCH_PROJECT_SUCCESS:
      return {
        project: {
          ...action.project,
          bids: bidTableReducer({ bids: state.project.bids }, action).bids
        },
        isUpdating: false,
        message: ''
      };
    case FETCH_PROJECT_FAILURE:
      return {
        project: state.project,
        isUpdating: false,
        message: action.message
      };
    case FETCH_PROJECT_BIDS_SUCCESS:
      const bidReducer = bidTableReducer({ bids: state.project.bids }, action);
      console.log('>>>> bid Reducer >>>>', bidReducer);
      return {
        project: {
          ...state.project,
          bids: bidTableReducer({ bids: state.project.bids }, action).bids
        },
        isUpdating: false,
        message: ''
      };
    default:
      return state;
  }
};

export default reducer;
