import { CREATE_USER_SUCCESS, CREATE_USER_FAILURE, CREATE_USER_REQUEST, RESET_USER_SUCCESS } from "./user.actions";

const initialState = {
  data: null,
  error: null,
  success: false,
  isLoading: false
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_USER_REQUEST:
      return {
        ...state,
        isLoading: true
      }
    case CREATE_USER_SUCCESS:
      return {
        ...state,
        data: action.response,
        isLoading: false,
        success: true,
        error: null
      };
    case CREATE_USER_FAILURE:
      return {
        ...state,
        data: null,
        isLoading: false,
        success: false,
        error: action.error
      };
    case RESET_USER_SUCCESS:
      return {
        ...state,
        success: false
      };
    default:
      return state;
  }
};

export default reducer;
