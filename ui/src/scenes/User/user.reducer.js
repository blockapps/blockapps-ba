import { CREATE_USER_SUCCESS, CREATE_USER_FAILURE, CREATE_USER_REQUEST } from "./user.actions";

const initialState = {
  data: null,
  error: null,
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
        error: null
      };
    case CREATE_USER_FAILURE:
      return {
        ...state,
        data: null,
        isLoading: false,
        error: action.error
      };
    default:
      return state;
  }
};

export default reducer;
