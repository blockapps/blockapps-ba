import { takeLatest, put, call } from 'redux-saga/effects';
import { OAUTH_REDIRECT_REQUEST } from './oauth.actions';
import { API_URL } from '../../environment';
import { handleApiError } from '../../lib/apiErrorHandler';
import { showLoading, hideLoading } from 'react-redux-loading-bar';

const oauthUrl = API_URL + '/oauth';

function loginApiCall() {

  return fetch(oauthUrl, {
    method: 'GET',
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

function* requestOauthRedirect() {
  try {
    yield put(showLoading());
    const response = yield call(loginApiCall);
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

export default function* watchOauthRedirect() {
  yield takeLatest(OAUTH_REDIRECT_REQUEST, requestOauthRedirect);
}
