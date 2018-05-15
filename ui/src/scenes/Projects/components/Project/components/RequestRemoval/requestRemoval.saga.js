import {
  takeEvery,
  put,
  call
} from 'redux-saga/effects';
import {
  FETCH_ENTITES_REQUEST,
  fetchEntitiesSuccess,
  fetchEntitiesFailure,
  VOTE_REQUEST,
  voteFailure,
  voteSuccess
} from './requestRemoval.actions';
import { APEX_URL } from '../../../../../../environment';

const entitiesUrl = APEX_URL + "/entities/members?username=:username";
const voteUrl = APEX_URL + "/entities/:id/vote";

export function getEntitiesApi(username) {
  return fetch(
    entitiesUrl.replace(':username', username),
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

function voteEntity(data) {
  return fetch(
    voteUrl.replace(":id", data.entityID),
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ entity: data.entity, password: data.password, voteType: data.voteType })
    })
    .then(function (response) {
      return response.json()
    })
    .catch(function (error) {
      throw error;
    })
}

export function* getEntites(action) {
  try {
    const response = yield call(getEntitiesApi, action.username);
    yield put(fetchEntitiesSuccess(response));
  }
  catch (err) {
    yield put(fetchEntitiesFailure(err));
  }
}

function* voteRequest(action) {
  try {
    let response = yield voteEntity(action.data);
    if (response && response.success) {
      yield put(voteSuccess(response.success));
    } else {
      yield put(voteFailure(response.error.message));
    }
  } catch (error) {
    yield put(voteFailure(error.message));
  }
}

export default function* watchRequestRemovalActions() {
  yield [
    takeEvery(FETCH_ENTITES_REQUEST, getEntites),
    takeEvery(VOTE_REQUEST, voteRequest)
  ];
}
