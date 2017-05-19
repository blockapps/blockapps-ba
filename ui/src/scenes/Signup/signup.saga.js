import { takeLatest, put, call } from 'redux-saga/effects';
import {
  USER_SIGNUP_SUBMIT,
  userSignupSuccess,
  userSignupFailure
} from './signup.actions';
import { browserHistory } from 'react-router';
import { API_URL, API_MOCK } from '../../environment';
import { handleApiError } from '../../lib/apiErrorHandler';
import { showLoading, hideLoading } from 'react-redux-loading-bar';

const signupUrl = API_URL + '/login/signup';

function signupApiCall(username,password, role) {
  if(API_MOCK) {
    return new Promise(function(resolve, reject){
      resolve({
        data: {
          user: {
            username: 'Supplier1',
            role: 'Supplier'
          }
        }
      });
    });
  }
  else {
    return fetch(signupUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password, role })
    })
    .then(handleApiError)
    .then(function(response) {
      return response.json();
    })
    .catch(function(error){
      throw error;
    });
  }
}

function* submitSignup(action) {
  try {
    yield put(showLoading());
    const response = yield call(signupApiCall, action.username, action.password, action.role);
    yield put(hideLoading());
    console.log(response);
    if(response.data) {
      yield put(userSignupSuccess(response.data.user.username, response.data.user.role));
    }
  }
  catch(err)
  {
    yield put(userSignupFailure(err));
    yield put(hideLoading());
  }
  browserHistory.push('/login');
}

export default function* watchSignupSubmit() {
  yield takeLatest(USER_SIGNUP_SUBMIT, submitSignup);
}
