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

const uploadContractsUrl = API_URL + "/uploadContracts";

export function uploadContractsApi(chainId) {
  return fetch(
    uploadContractsUrl,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ chainId })
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
    const response = yield call(uploadContractsApi, action.chainId);
    yield put(uploadContractsSuccess(response));
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
