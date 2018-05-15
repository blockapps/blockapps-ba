import {
  takeEvery,
  put,
  call
} from 'redux-saga/effects';
import { inviteEntitySuccess, inviteEntityFailure, INVITE_ENTITY_REQUEST } from './inviteEntity.actions';
import { APEX_URL } from '../../../../../../../../environment';

const inviteEntityUrl = APEX_URL + "/entities";

function inviteEntity(entity) {
  return fetch(
    inviteEntityUrl,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        adminEmail: entity.adminEmail,
        adminEthereumAddress: entity.adminEthereumAddress,
        adminName: entity.adminName,
        enodeUrl: entity.eNodeUrl,
        name: entity.name,
        tokenAmount: entity.tokenAmount
      })
    })
    .then(function (response) {
      return response.json()
    })
    .catch(function (error) {
      throw error;
    })
}

function* inviteEntityRequest(action) {
  try {
    let response = yield call(inviteEntity, action.entity);
    if (response && response.success) {
      yield put(inviteEntitySuccess(response.success));
    } else {
      yield put(inviteEntityFailure(response.error.message));
    }
  }
  catch (error) {
    yield put(inviteEntityFailure(error.message));
  }
}

export default function* watchEntitiesActions() {
  yield [
    takeEvery(INVITE_ENTITY_REQUEST, inviteEntityRequest)
  ];
}
