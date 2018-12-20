import {
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
        address: action.data.address
      };
    case AUTHENTICATE_FAILURE: 
      return {
        error: null,
        authenticated: false,
        address: null
      };
    case GET_USER_SUCCESS:
      return {
        ...state,
        error: null,
        authenticated: true,
        username: action.result.user.account,
        account: action.result.user.account,
        role: action.result.user.role,
        loginFailed: false
      };
    case GET_USER_FAILURE: 
      return {
        ...state,
        error: null,
        authenticated: false,
        username: null,
        account: null,
        role: null
      };
    default:
      return state;
  }
};

export default reducer;
