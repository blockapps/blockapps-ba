import {
  USER_SIGNUP_SUBMIT,
  USER_SIGNUP_SUCCESS,
  USER_SIGNUP_FAILURE,
  USER_LOGOUT,
} from './signup.actions';

const initialState = {
  username: null,
  role: null,
  error: null,
  signupFailed: false
};

const reducer = function signupReducer (state = initialState, action) {
  switch(action.type) {
    case USER_SIGNUP_SUBMIT:
      return initialState;
    case USER_SIGNUP_SUCCESS:
      return {
        username: action.username,
        role: action.role,
        error: null,
        signupFailed: false
      };
    case USER_SIGNUP_FAILURE:
      return {
        username: null,
        role: null,
        error: action.error,
        signupFailed: true
      };
    case USER_LOGOUT:
      return initialState;
    default:
      return state;
  }
};

export default reducer;
