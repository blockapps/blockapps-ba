import {
  takeLatest,
  put,
  call
} from 'redux-saga/effects';
import {
  FETCH_ACCOUNTS_REQUEST,
  fetchAccountsSuccess,
  fetchAccountsFailure,
  fetchUserAddressesSuccess,
  fetchUserAddressesFailure,
  FETCH_ACCOUNT_ADDRESS_REQUEST
} from "./accounts.actions";
import { bloc_url } from "../../environment";

const addressUrl = bloc_url + '/users/:user';
const usernameUrl = bloc_url + "/users";

export function getAccountsApi() {
  return fetch(
    usernameUrl,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
    })
    .then(function (response) {
      return response.json()
    })
    .catch(function (error) {
      throw error;
    })
}

export function getAccountAddressesApi(username) {
  return fetch(
    addressUrl.replace(':user', username),
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
    })
    .then(function (response) {
      return response.json()
    })
    .catch(function (error) {
      throw error;
    })
}

export function* getAccounts() {
  try {
    const response = yield call(getAccountsApi);
    yield put(fetchAccountsSuccess(response));
  }
  catch (err) {
    yield put(fetchAccountsFailure(err));
  }
}

export function* getAccountAddresses(action) {
  try {
    const response = yield call(getAccountAddressesApi, action.username);
    yield put(fetchUserAddressesSuccess(response));
  }
  catch (err) {
    yield put(fetchUserAddressesFailure(err));
  }
}

export default function* watcAccounts() {
  yield [
    takeLatest(FETCH_ACCOUNTS_REQUEST, getAccounts),
    takeLatest(FETCH_ACCOUNT_ADDRESS_REQUEST, getAccountAddresses),
  ];
}
