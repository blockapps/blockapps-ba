import {
  USER_LOGIN_SUBMIT,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAILURE
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
        roles: action.role,
        error: null,
        authenticated: true,
        loginFailed: false
      }
    case USER_LOGIN_FAILURE:
      return {
        username: null,
        roles: null,
        error: action.error,
        authenticated: false,
        loginFailed: true
      }
    default:
      return state;
  }
}

export default reducer;
