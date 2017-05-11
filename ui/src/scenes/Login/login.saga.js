import { takeLatest, put, call } from 'redux-saga/effects';
import {
  USER_LOGIN_SUBMIT,
  userLoginSuccess,
  userLoginFailure
} from './login.actions';
import { browserHistory } from 'react-router';
import { API_URL } from '../../environment';
import { handleApiError } from '../../lib/apiErrorHandler';

const loginUrl = API_URL + '/login';

function loginApiCall(username,password) {
  return fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ username, password})
  })
  .then(handleApiError)
  .then(function(response) {
    return response.json();
  })
  .catch(function(error){
    throw error;
  });
}

function* submitLogin(action) {
  try {
    const response = yield call(loginApiCall, action.username, action.password);
    console.log('>>>> response >>>>',response);
    if(response.data.authenticate) {
      yield put(userLoginSuccess(response.data.user.username, response.data.user.role));
      browserHistory.push('/dashboard');
    }
  }
  catch(err)
  {
    yield put(userLoginFailure(err));
  }
}

export default function* watchLoginSubmit() {
  yield takeLatest(USER_LOGIN_SUBMIT, submitLogin);
}
