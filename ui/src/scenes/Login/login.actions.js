export const USER_LOGIN_SUBMIT = 'USER_LOGIN_SUBMIT';
export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS';
export const USER_LOGIN_FAILURE = 'USER_LOGIN_FAILURE';

export const userLoginSubmit = function(username, password) {
  return {
    type: USER_LOGIN_SUBMIT,
    username,
    password
  }
}


export const userLoginSuccess = function(address, roles) {
  return {
    type: USER_LOGIN_SUCCESS,
    address: address,
    roles: roles
  }
}

export const userLoginFailure = function(error) {
  return {
    type: USER_LOGIN_FAILURE,
    error: error
  }
}
