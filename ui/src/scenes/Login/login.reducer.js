import {
  USER_LOGOUT,
  AUTHENTICATE_SUCCESS,
  AUTHENTICATE_FAILURE,
  GET_USER_FAILURE,
  GET_USER_SUCCESS
} from './login.actions';

const initialState = {
  username: null,
  role: null,
  account: null,
  error: null,
  authenticated: false,
  loginFailed: false,
  address: null
};

const reducer = function loginReducer (state = initialState, action) {
  switch(action.type) {
    case AUTHENTICATE_SUCCESS: 
      return {
        ...state,
        error: null,
        // TODO: unchecked when you work on login
        // authenticated: false,
        address: action.data.address
      };
    case AUTHENTICATE_FAILURE: 
      return {
        error: null,
        authenticated: false,
        address: null
      };
    case GET_USER_SUCCESS: 
      console.log("user -------------------", action)
      return {
        ...state,
        error: null,
        authenticated: true,
        username: action.result.data.user.username,
        account: action.result.data.user.account,
        role: action.result.data.user.role,
        loginFailed: false
      };
    case GET_USER_FAILURE: 
      return {
        error: null,
        authenticated: true,
        username: null,
        account: null,
        role: null
      };
    case USER_LOGOUT:
      return initialState;
    default:
      return state;
  }
};

export default reducer;
