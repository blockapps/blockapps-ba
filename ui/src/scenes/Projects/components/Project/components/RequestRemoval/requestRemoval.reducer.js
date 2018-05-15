import {
  OPEN_REQUEST_REMOVAL_MODAL,
  CLOSE_REQUEST_REMOVAL_MODAL,
  VOTE_SUCCESS,
  VOTE_FAILURE,
  VOTE_REQUEST,
  FETCH_ENTITES_SUCCESS,
  FETCH_ENTITES_FAILURE,
  RESET_MESSAGE
} from "./requestRemoval.actions";

const initialState = {
  isOpen: false,
  entities: [],
  message: null
};

const reducer = function (state = initialState, action) {
  switch (action.type) {
    case OPEN_REQUEST_REMOVAL_MODAL:
      return {
        ...state,
        isOpen: true
      }
    case CLOSE_REQUEST_REMOVAL_MODAL:
      return {
        ...state,
        isOpen: false
      }
    case VOTE_REQUEST:
      return {
        ...state,
        isVoted: null,
        message: null
      }
    case VOTE_SUCCESS:
      return {
        ...state,
        isVoted: action.response,
        isOpen: false,
        message: 'Your removal request was successfully recorded on strato'
      }
    case VOTE_FAILURE:
      return {
        ...state,
        isVoted: false,
        message: action.error
      }
    case FETCH_ENTITES_SUCCESS:
      return {
        ...state,
        entities: action.entities,
        message: null
      };
    case FETCH_ENTITES_FAILURE:
      return {
        ...state,
        message: action.error
      };
    case RESET_MESSAGE:
      return {
        ...state,
        message: null
      }
    default:
      return state;
  }
};

export default reducer;
