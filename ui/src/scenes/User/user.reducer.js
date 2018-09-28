import { CREATE_USER_SUCCESS, CREATE_USER_FAILURE } from "./user.actions";

const initialState = {
  data: null,
  error: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_USER_SUCCESS:
      return {
        ...state,
        data: action.response,
        error: null
      };
    case CREATE_USER_FAILURE:
      return {
        ...state,
        data: null,
        error: action.error
      };
    default:
      return state;
  }
};

export default reducer;
