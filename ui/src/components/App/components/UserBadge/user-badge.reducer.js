import {
  USER_BALANCE_SUBMIT,
  USER_BALANCE_SUCCESS,
  USER_BALANCE_FAILURE
} from './user-badge.actions';

const initialState = {
  balance: 0,
  error: ''
};

const reducer = function loginReducer (state = initialState, action) {
  switch(action.type) {
    case USER_BALANCE_SUBMIT:
      return state;
    case USER_BALANCE_SUCCESS:
      return {
        username: action.balance,
        error: null
      };
    case USER_BALANCE_FAILURE:
      return {
        balance: state.balance,
        error: action.error
      };
    default:
      return state;
  }
};

export default reducer;
