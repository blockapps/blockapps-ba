import {
  takeLatest,
  put,
  call
} from 'redux-saga/effects';
import {
  UPLOAD_CONTRACTS_REQUEST,
  uploadContractsSuccess,
  uploadContractsFailure
} from './uploadContracts.actions';
import { API_URL } from '../../environment';
import { setUserMessage } from '../UserMessage/user-message.action';
import { showLoading, hideLoading } from 'react-redux-loading-bar';

const uploadContractsUrl = API_URL + "/uploadContracts";

export function uploadContractsApi(username, address, password, chainId) {
  return fetch(
    uploadContractsUrl,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, address, password, chainId })
    })
    .then(function (response) {
      return response.json()
    })
    .catch(function (error) {
      throw error;
    })
}

export function* uploadContracts(action) {
  try {
    yield put(showLoading());
    const response = yield call(uploadContractsApi, action.data.admin_username, action.data.admin_address, action.data.password, action.data.chainId);
    yield put(hideLoading());
    if (response.error) {
      yield put(setUserMessage(response.error));
      yield put(uploadContractsFailure(response.error));
    } else {
      yield put(setUserMessage(response.data));
      yield put(uploadContractsSuccess(response));
    }
  }
  catch (err) {
    yield put(uploadContractsFailure(err));
  }
}

export default function* watchUploadContracts() {
  yield [
    takeLatest(UPLOAD_CONTRACTS_REQUEST, uploadContracts)
  ];
}
