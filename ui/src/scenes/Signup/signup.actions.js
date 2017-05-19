export const USER_SIGNUP_SUBMIT = 'USER_SIGNUP_SUBMIT';
export const USER_SIGNUP_SUCCESS = 'USER_SIGNUP_SUCCESS';
export const USER_SIGNUP_FAILURE = 'USER_SIGNUP_FAILURE';
export const USER_LOGOUT = 'USER_LOGOUT';

export const userSignupSubmit = function(username, password, role) {
  console.log("userSignupSubmit");
  return {
    type: USER_SIGNUP_SUBMIT,
    username,
    password,
    role
  }
};

export const userSignupSuccess = function(username, role) {
  return {
    type: USER_SIGNUP_SUCCESS,
    username: username,
    role: role
  }
};

export const userSignupFailure = function(error) {
  return {
    type: USER_SIGNUP_FAILURE,
    error: error
  }
};
