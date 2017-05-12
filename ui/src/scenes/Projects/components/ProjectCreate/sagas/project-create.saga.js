import { takeLatest, put, call } from 'redux-saga/effects';
import {
  PROJECT_CREATE,
  projectCreateSuccess,
  projectCreateFailure
} from '../actions/project-create.actions';
import { browserHistory } from 'react-router';
import { API_URL } from '../../../../../environment';
import { handleApiError } from '../../../../../lib/apiErrorHandler';

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
    const response = yield call(projectCreateApiCall, action.project);
    console.log('>>>> response >>>>',response);
    if(response.data.project) {
      yield put(projectCreateSuccess(response.data.project));
      browserHistory.push('/projects');
    }
  }
  catch(err)
  {
    yield put(projectCreateFailure(err));
  }
}

export default function* watchProjectCreate() {
  yield takeLatest(PROJECT_CREATE, submitProjectCreate);
}
