export const FETCH_ACCOUNTS_REQUEST = 'FETCH_ACCOUNTS_REQUEST';
export const FETCH_ACCOUNTS_SUCCESS = 'FETCH_ACCOUNTS_SUCCESS';
export const FETCH_ACCOUNTS_FAILURE = 'FETCH_ACCOUNTS_FAILURE';
export const FETCH_ACCOUNT_ADDRESS_REQUEST = 'FETCH_ACCOUNT_ADDRESS_REQUEST';
export const FETCH_ACCOUNT_ADDRESS_SUCCESS = 'FETCH_ACCOUNT_ADDRESS_SUCCESS';
export const FETCH_ACCOUNT_ADDRESS_FAILURE = 'FETCH_ACCOUNT_ADDRESS_FAILURE';

export const fetchAccounts = function () {
  return {
    type: FETCH_ACCOUNTS_REQUEST
  }
};

export const fetchAccountsSuccess = function (accounts) {
  return {
    type: FETCH_ACCOUNTS_SUCCESS,
    accounts: accounts
  }
};

export const fetchAccountsFailure = function (error) {
  return {
    type: FETCH_ACCOUNTS_FAILURE,
    error: error
  }
};

export const fetchUserAddresses = function (username) {
  return {
    type: FETCH_ACCOUNT_ADDRESS_REQUEST,
    username
  }
};

export const fetchUserAddressesSuccess = function (addresses) {
  return {
    type: FETCH_ACCOUNT_ADDRESS_SUCCESS,
    addresses: addresses
  }
};

export const fetchUserAddressesFailure = function (error) {
  return {
    type: FETCH_ACCOUNT_ADDRESS_FAILURE,
    error: error
  }
};