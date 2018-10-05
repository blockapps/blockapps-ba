import { takeLatest, put, call } from 'redux-saga/effects';
import {
  USER_LOGIN_SUBMIT,
  userLoginSuccess,
  userLoginFailure
} from './login.actions';
import { browserHistory } from 'react-router';
import { API_URL, API_MOCK } from '../../environment';
import { handleApiError } from '../../lib/apiErrorHandler';
import { showLoading, hideLoading } from 'react-redux-loading-bar';
import { setUserMessage } from '../../components/UserMessage/user-message.action';

const loginUrl = API_URL + '/login';

function loginApiCall(username, password, chainId) {
  if (API_MOCK) {
    return new Promise(function (resolve, reject) {
      resolve({
        data: {
          authenticate: true,
          user: {
            username: 'Supplier1',
            role: 'Supplier'
          }
        }
      });
    });
  }
  else {
    return fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password, chainId })
    })
      .then(handleApiError)
      .then(function (response) {
        return response.json();
      })
      .catch(function (error) {
        throw error;
      });
  }
}

function* submitLogin(action) {
  try {
    yield put(showLoading());
    const response = yield call(loginApiCall, action.username, action.password, action.chainId);
    yield put(hideLoading());
    if (response.data.authenticate) {
      yield put(userLoginSuccess(response.data.user.username, response.data.user.role, response.data.user.account));
    }
  }
  catch (err) {
    yield put(userLoginFailure(err));
    yield put(setUserMessage(err));
    yield put(hideLoading());
  }
  browserHistory.push('/projects');
}

export default function* watchLoginSubmit() {
  yield takeLatest(USER_LOGIN_SUBMIT, submitLogin);
}
