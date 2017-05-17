import {
  USER_LOGIN_SUBMIT,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAILURE,
  USER_LOGOUT,
} from './login.actions';

const initialState = {
  username: null,
  role: null,
  error: null,
  authenticated: false,
  loginFailed: false
};

const reducer = function loginReducer (state = initialState, action) {
  switch(action.type) {
    case USER_LOGIN_SUBMIT:
      return initialState;
    case USER_LOGIN_SUCCESS:
      return {
        username: action.username,
        role: action.role,
        error: null,
        authenticated: true,
        loginFailed: false
      };
    case USER_LOGIN_FAILURE:
      return {
        username: null,
        role: null,
        error: action.error,
        authenticated: false,
        loginFailed: true
      };
    case USER_LOGOUT:
      return initialState;
    default:
      return state;
  }
};

export default reducer;
