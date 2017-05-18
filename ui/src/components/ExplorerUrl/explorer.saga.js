import { takeLatest, put, call } from 'redux-saga/effects';
import {
  GET_EXPLORER_URL,
  getExplorerUrlSuccess,
  getExplorerUrlFailure
} from './explorer.actions';
import { API_URL } from '../../environment';
import { handleApiError } from '../../lib/apiErrorHandler';

const apiUrl = API_URL + '/system/explorer-url';

function getExplorerUrlCall() {
  return fetch(apiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Accept': 'application/json'
    }
  })
  .then(handleApiError)
  .then(function(response) {
    return response.json();
  })
  .catch(function(error){
    throw error;
  });
}

function* getExplorerUrl(action) {
  try {
    const response = yield call(getExplorerUrlCall);
    if(response.data.explorerUrl) {
      yield put(getExplorerUrlSuccess(response.data.explorerUrl));
    }
  }
  catch(err)
  {
    yield put(getExplorerUrlFailure(err));
  }
}

export default function* watchLoginSubmit() {
  yield takeLatest(GET_EXPLORER_URL, getExplorerUrl);
}
