export const USER_BALANCE_SUBMIT = 'USER_BALANCE_SUBMIT';
export const USER_BALANCE_SUCCESS = 'USER_BALANCE_SUCCESS';
export const USER_BALANCE_FAILURE = 'USER_BALANCE_FAILURE';


export const userBalanceSubmit = function(username) {
  return {
    type: USER_BALANCE_SUBMIT,
    username
  }
};

export const userBalanceSuccess = function(balance) {
  return {
    type: USER_BALANCE_SUCCESS,
    balance
  }
};

export const userBalanceFailure = function(error) {
  return {
    type: USER_BALANCE_FAILURE,
    error: error
  }
};
