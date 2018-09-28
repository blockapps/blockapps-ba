import { takeLatest, put, call } from 'redux-saga/effects';
import { API_URL } from '../../environment';
import { setUserMessage } from '../../components/UserMessage/user-message.action';
import { CREATE_USER_REQUEST, createUserSuccess, createUserFailure } from './user.actions';

const createUserUrl = API_URL + '/users/create';

function createUserApiCall(payload) {
  return fetch(
    createUserUrl,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(function (response) {
      return response.json();
    })
    .catch(function (error) {
      throw error;
    })
}

function* createUser(action) {
  try {
    const response = yield call(createUserApiCall, action.payload);
    if (response.error) {
      yield put(setUserMessage(response.error));
      yield put(createUserFailure(response.error));  
    } else {
      yield put(createUserSuccess(response));
    }
  }
  catch (err) {
    yield put(setUserMessage(err));
    yield put(createUserFailure(err));
  }
}

export default function* watchCreateUser() {
  yield takeLatest(CREATE_USER_REQUEST, createUser);
}
