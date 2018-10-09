import { LOGOUT_REQUEST } from './logout.actions';

const initialState = {
  username: null,
  role: null,
  error: null,
  authenticated: false,
  loginFailed: false
};

const reducer = function (state = initialState, action) {
  switch (action.type) {
    case LOGOUT_REQUEST:
      return initialState;
    default:
      return state;
  }
};

export default reducer;
