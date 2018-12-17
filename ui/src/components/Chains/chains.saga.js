import {
  takeLatest,
  put,
  call
} from 'redux-saga/effects';
import {
  FETCH_CHAINS_REQUEST,
  fetchChainsSuccess,
  fetchChainsFailure,
  CREATE_CHAIN_REQUEST,
  createChainSuccess,
  createChainFailure
} from './chains.actions';
import { setUserMessage } from '../../components/UserMessage/user-message.action';
import { API_URL } from '../../environment';
import { showLoading, hideLoading } from 'react-redux-loading-bar';
import { browserHistory } from 'react-router';

const getChainUrl = API_URL + "/chains";
const createChainUrl = API_URL + "/chains";

export function getChainsApi() {
  return fetch(
    getChainUrl,
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

export function createChainApiCall(args) {
  return fetch(
    createChainUrl,
    {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ chain: args })
    }
  )
    .then(function (response) {
      return response.json();
    })
    .catch(function (error) {
      throw error;
    });
}


export function* getChains() {
  try {
    const response = yield call(getChainsApi);
    yield put(fetchChainsSuccess(response.data.chains));
  }
  catch (err) {
    yield put(fetchChainsFailure(err));
  }
}

export function* createChain(action) {
  try {
    yield put(showLoading());
    let response = yield call(createChainApiCall, action.args);
    yield put(hideLoading());
    if (response.success) {
      yield put(createChainSuccess(response));
      yield put(setUserMessage(response.data));
      browserHistory.replace('/welcome');
    } else {
      yield put(createChainFailure(response.error));
      yield put(setUserMessage(response.error));
    }
  }
  catch (err) {
    yield put(hideLoading());
    yield put(createChainFailure(err));
    yield put(setUserMessage(err.data));
  }
}

export default function* watchFetchChains() {
  yield [
    takeLatest(FETCH_CHAINS_REQUEST, getChains),
    takeLatest(CREATE_CHAIN_REQUEST, createChain)
  ];
}
