import {
  GET_EXPLORER_URL,
  GET_EXPLORER_URL_SUCCESS,
  GET_EXPLORER_URL_FAILURE
} from './explorer.actions';

const initialState = {
  explorerUrl: null,
  error: null,
};

const reducer = function explorerUrlReducer (state = initialState, action) {
  switch(action.type) {
    case GET_EXPLORER_URL:
      return initialState;
    case GET_EXPLORER_URL_SUCCESS:
      return {
        explorerUrl: action.explorerUrl,
        error: null,
      };
    case GET_EXPLORER_URL_FAILURE:
      return {
        explorerUrl: null,
        error: action.error,
      };
    default:
      return state;
  }
};

export default reducer;
