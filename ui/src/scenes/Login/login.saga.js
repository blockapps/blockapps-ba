import { takeLatest, put } from 'redux-saga/effects';
import {
  USER_LOGIN_SUBMIT,
  userLoginSuccess
} from './login.actions';
import { browserHistory } from 'react-router';

function* submitLogin() {
  // MOCK LOGIN
  yield put(userLoginSuccess('Supplier1', "Supplier"));
  browserHistory.push('/dashboard');

}

export default function* watchLoginSubmit() {
  yield takeLatest(USER_LOGIN_SUBMIT, submitLogin);
}
