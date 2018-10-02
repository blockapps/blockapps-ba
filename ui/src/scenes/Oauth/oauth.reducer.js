import { OAUTH_REDIRECT_REQUEST, OAUTH_SUCCESS } from './oauth.actions';

const initialState = {
  username: null,
  role: null,
  error: null,
  authenticated: false,
  loginFailed: false
};

const reducer = function (state = initialState, action) {
  switch (action.type) {
    case OAUTH_REDIRECT_REQUEST:
      return initialState;
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
