import {
  USER_BALANCE_SUBMIT,
  USER_BALANCE_SUCCESS,
  USER_BALANCE_FAILURE
} from './user-badge.actions';

const initialState = {
  balance: '',
  error: ''
};

const reducer = function loginReducer (state = initialState, action) {
  switch(action.type) {
    //Action when the balance is not received
    case USER_BALANCE_SUBMIT:
      return {
        balance: '',
        error: null
      };
    //Action when the balance is received
    case USER_BALANCE_SUCCESS:
      return {
        balance: action.balance,
        error: null
      };
    //Action when balance api call fails
    case USER_BALANCE_FAILURE:
      return {
        balance: '',
        error: action.error
      };
    default:
      return state;
  }
};

export default reducer;
