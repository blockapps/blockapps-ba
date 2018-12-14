export const USER_LOGOUT = 'USER_LOGOUT';
export const ME = 'ME';
export const AUTHENTICATE_SUCCESS = 'AUTHENTICATE_SUCCESS';
export const AUTHENTICATE_FAILURE = 'AUTHENTICATE_FAILURE';

export const GET_USER = 'GET_USER';
export const GET_USER_SUCCESS = 'GET_USER_SUCCESS';
export const GET_USER_FAILURE = 'GET_USER_FAILURE';

export const authenticatedSuccess = function (data) {
  return {
    type: AUTHENTICATE_SUCCESS,
    data
  }
}

export const authenticatedFailure = function () {
  return {
    type: AUTHENTICATE_FAILURE
  }
}

export const getUser = function (data) {
  return {
    type: GET_USER,
    data
  }
}

export const getUserSuccess = function (result) {
  return {
    type: GET_USER_SUCCESS,
    result
  }
}

export const getUserFailure = function () {
  return {
    type: GET_USER_FAILURE
  }
}

export const me = function () {
  return {
    type: ME
  }
};

export const userLogout = function () {
  return {
    type: USER_LOGOUT,
  }
};