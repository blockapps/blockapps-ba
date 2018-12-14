import { takeLatest, put, call, wait } from 'redux-saga/effects';
import {
  ME,
  authenticatedSuccess,
  authenticatedFailure,
  GET_USER,
  getUserFailure,
  getUserSuccess
} from './login.actions';
import { API_URL } from '../../environment';
import { setChainID } from '../../components/Chains/chains.actions';

const meUrl = API_URL + '/me';
const getUserUrl = API_URL + '/login/getUser';

function meCall() {
  return fetch(meUrl, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
    .then(function (response) {
      return response.json();
    })
    .catch(function (error) {
      return error.json();
    });
}

function getUserApiCall(data) {
  const url = `${getUserUrl}?chainId=${data.chainId}&address=${data.address}`;
  return fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  })
    .then(function (response) {
      return response.json();
    })
    .catch(function (error) {
      return error.json();
    });
}

function* me() {
  try {
    const response = yield call(meCall);
    if (!response.success) {
      yield put(authenticatedFailure());
      window.location = response.error.loginUrl
    } else {
      yield put(authenticatedSuccess(response.data));
    }
  }
  catch (err) {
    yield put(authenticatedFailure());
  }
}

function* getUser(action) {
  try {
    const response = yield call(getUserApiCall, action.data);
    yield put(setChainID(action.data.chainId));
    yield put(getUserSuccess(response));
  }
  catch (err) {
    yield put(getUserFailure());
  }
}

export default function* watchLoginSubmit() {
  yield takeLatest(ME, me);
  yield takeLatest(GET_USER, getUser);
}
