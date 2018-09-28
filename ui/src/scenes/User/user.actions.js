export const CREATE_USER_REQUEST = 'CREATE_USER_REQUEST';
export const CREATE_USER_SUCCESS = 'CREATE_USER_SUCCESS';
export const CREATE_USER_FAILURE = 'CREATE_USER_FAILURE';

export const createUserRequest = function (payload) {
  return {
    type: CREATE_USER_REQUEST,
    payload
  }
};

export const createUserSuccess = function (response) {
  return {
    type: CREATE_USER_SUCCESS,
    response
  }
};

export const createUserFailure = function (error) {
  return {
    type: CREATE_USER_FAILURE,
    error: error
  }
};
