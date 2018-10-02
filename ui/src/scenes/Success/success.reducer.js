import { OAUTH_SUCCESS } from './success.actions';

const initialState = {
  username: null,
  role: null,
  error: null,
  authenticated: false,
  loginFailed: false
};

const reducer = function (state = initialState, action) {
  switch (action.type) {
    case OAUTH_SUCCESS:
      return {
        username: action.email,
        role: action.role,
        error: null,
        authenticated: true,
        loginFailed: false
      }
    default:
      return state;
  }
};

export default reducer;
