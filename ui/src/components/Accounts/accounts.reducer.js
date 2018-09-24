import {
  FETCH_ACCOUNTS_SUCCESS,
  FETCH_ACCOUNTS_FAILURE,
  FETCH_ACCOUNT_ADDRESS_SUCCESS,
  FETCH_ACCOUNT_ADDRESS_FAILURE
} from './accounts.actions';

const initialState = {
  accounts: [],
  accountAddresses: [],
  error: null
};

const reducer = function (state = initialState, action) {
  switch (action.type) {
    case FETCH_ACCOUNTS_SUCCESS:
      return {
        ...state,
        accounts: action.accounts,
        error: null
      };
    case FETCH_ACCOUNTS_FAILURE:
      return {
        ...state,
        error: action.error
      };
    case FETCH_ACCOUNT_ADDRESS_SUCCESS:
      return {
        ...state,
        accountAddresses: action.addresses,
        error: null,
      };
    case FETCH_ACCOUNT_ADDRESS_FAILURE:
      return {
        ...state,
        accountAddresses: [],
        error: action.error
      };
    default:
      return state;
  }
};

export default reducer;
