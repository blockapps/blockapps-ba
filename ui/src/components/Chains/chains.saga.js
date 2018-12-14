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
import { strato_url, bloc_url, API_URL } from '../../environment';

const chainUrl = strato_url + "/chain";
const url = API_URL + "/uploadContracts/createData";

export function getChainsApi() {
  return fetch(
    chainUrl,
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
    url,
    {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({chain: args})
    }
  )
    .then(function (response) {
      return response;
    })
    .catch(function (error) {
      throw error;
    });
}


export function* getChains() {
  try {
    const response = yield call(getChainsApi);
    yield put(fetchChainsSuccess(response));
  }
  catch (err) {
    yield put(fetchChainsFailure(err));
  }
}

export function* createChain(action) {
  try {
    let response = yield call(createChainApiCall, action.args);
    if (response.status === 200) {
      yield put(createChainSuccess(response));
    } else {
      yield put(createChainFailure(response.statusText));
    }
  }
  catch (err) {
    yield put(createChainFailure(err));
  }
}

export default function* watchFetchChains() {
  yield [
    takeLatest(FETCH_CHAINS_REQUEST, getChains),
    takeLatest(CREATE_CHAIN_REQUEST, createChain)
  ];
}
