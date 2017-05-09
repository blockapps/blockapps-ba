import { takeLatest, put } from 'redux-saga/effects';
import {
  USER_LOGIN_SUBMIT,
  userLoginSuccess
} from './login.actions';
import { browserHistory } from 'react-router';

function* submitLogin() {
  // MOCK LOGIN
  yield put(userLoginSuccess('ff4bed658b6c69297f8b76aa5800eb40ef2fd8d7', "Supplier"));
  browserHistory.push('/dashboard');

}

export default function* watchLoginSubmit() {
  yield takeLatest(USER_LOGIN_SUBMIT, submitLogin);
}
