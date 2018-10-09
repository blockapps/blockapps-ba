import { takeLatest, put, call } from 'redux-saga/effects';
import { LOGOUT_REQUEST } from './logout.actions';
import { API_URL } from '../../environment';
import { handleApiError } from '../../lib/apiErrorHandler';
import { showLoading, hideLoading } from 'react-redux-loading-bar';

const oauthUrl = API_URL + '/oauth/logout';

function logoutApiCall() {

  return fetch(oauthUrl, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Accept': 'application/json'
    }
  })
    .then(handleApiError)
    .then(function (response) {
      return response.json();
    })
    .catch(function (error) {
      throw error;
    });

}

function* requestLogout() {
  try {
    yield put(showLoading());
    const response = yield call(logoutApiCall);
    yield put(hideLoading());
    // As suggested on https://github.com/ReactTraining/react-router/issues/1434
    // so cannot use BrowserHistory from react-router package
    // TODO: use react-router-redux library for external navigation
    yield call(window.location.href = response.data.url);
  }
  catch (err) {
    // yield put(userLoginFailure(err));
    yield put(hideLoading());
  }
}

export default function* watchLogoutRequest() {
  yield takeLatest(LOGOUT_REQUEST, requestLogout);
}
