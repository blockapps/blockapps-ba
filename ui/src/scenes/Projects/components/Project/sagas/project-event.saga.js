import {
  takeLatest, put, call
} from 'redux-saga/effects';
import {
  PROJECT_EVENT,
  projectEventSuccess,
  projectEventFailure
} from '../actions/project-event.actions';
import { browserHistory } from 'react-router';
import { API_URL, API_MOCK } from '../../../../../environment';
import { handleApiError } from '../../../../../lib/apiErrorHandler';
import { PROJECT_EVENTS } from '../../../../../constants';
import { showLoading, hideLoading } from 'react-redux-loading-bar';
import { setUserMessage } from '../../../../../components/UserMessage/user-message.action'
import { userBalanceSubmit } from '../../../../../components/App/components/UserBadge/user-badge.actions';

const url = API_URL + '/projects/:projectName/events';

function projectEventCall(projectName, projectEvent, username) {

  if(API_MOCK) {
    return new Promise(function(resolve,reject){
      resolve({});
    });
  }
  else {
    const apiUrl = url.replace(':projectName', projectName);

    return fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json'
      },
      body: JSON.stringify({projectEvent: projectEvent, username: username})
    })
      .then(handleApiError)
      .then(function(response) {
        return response.json();
      })
      .catch(function(error){
        throw error;
      });
  }
}

function* projectEvent(action){
  try {
    yield put(showLoading());
    yield call(projectEventCall, action.projectName, action.projectEvent, action.username);
    yield put(projectEventSuccess());
    yield put(userBalanceSubmit(action.username));
    yield put(hideLoading());
    yield put(setUserMessage('Item ' + PROJECT_EVENTS[action.projectEvent]));
    browserHistory.goBack(); // todo: update current project data on the page instead?
  }
  catch(err) {
    yield put(projectEventFailure(err));
  }
}

export default function* watchProjectEvent() {
  yield takeLatest(PROJECT_EVENT, projectEvent);
}
