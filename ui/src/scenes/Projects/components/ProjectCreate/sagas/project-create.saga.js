import { takeLatest, put, call } from 'redux-saga/effects';
import {
  PROJECT_CREATE,
  projectCreateSuccess,
  projectCreateFailure
} from '../actions/project-create.actions';
import { browserHistory } from 'react-router';
import { API_URL } from '../../../../../environment';
import { handleApiError } from '../../../../../lib/apiErrorHandler';
import { showLoading, hideLoading } from 'react-redux-loading-bar';
import { setUserMessage } from '../../../../../components/UserMessage/user-message.action';

const projectsUrl = API_URL + '/projects';

function projectCreateApiCall(project) {
  return fetch(projectsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Accept': 'application/json'
    },
    body: JSON.stringify(project)
  })
    .then(handleApiError)
    .then(function(response) {
      return response.json();
    })
    .catch(function(error){
      throw error;
    });
}

function* submitProjectCreate(action) {
  try {
    yield put(showLoading());
    const response = yield call(projectCreateApiCall, action.project);
    yield put(hideLoading());
    if(response.data.project) {
      yield put(projectCreateSuccess(response.data.project));
      yield put(setUserMessage('Contract Created Successfully'));
      browserHistory.push('/projects');
      yield put(setUserMessage('Contract Created Successfully'));
    }
  }
  catch(err)
  {
    yield put(projectCreateFailure(err));
    yield put(hideLoading());
  }
}

export default function* watchProjectCreate() {
  yield takeLatest(PROJECT_CREATE, submitProjectCreate);
}
