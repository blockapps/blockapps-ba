import {
  OPEN_INVITE_ENTITY_MODAL,
  CLOSE_INVITE_ENTITY_MODAL,
  INVITE_ENTITY_REQUEST,
  INVITE_ENTITY_SUCCESS,
  INVITE_ENTITY_FAILURE,
  RESET_MESSAGE
} from "./inviteEntity.actions";

const initialState = {
  isOpen: false,
  isEntityCreated: false,
  message: null,
};

const reducer = function (state = initialState, action) {
  switch (action.type) {
    case OPEN_INVITE_ENTITY_MODAL:
      return {
        ...state,
        isOpen: true
      };
    case CLOSE_INVITE_ENTITY_MODAL:
      return {
        ...state,
        isOpen: false
      };
    case INVITE_ENTITY_REQUEST:
      return {
        ...state,
        message: null,
      }
    case INVITE_ENTITY_SUCCESS:
      return {
        ...state,
        isOpen: false,
        message: 'Entity created',
        isEntityCreated: action.isEntityCreated
      }
    case INVITE_ENTITY_FAILURE:
      return {
        ...state,
        isOpen: true,
        isEntityCreated: false,
        message: action.error,
      }
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
