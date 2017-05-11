import {
  takeLatest,
  put,
  call
} from 'redux-saga/effects';
import {
  API_URL,
  API_MOCK
} from '../../../../environment';
import {
  handleApiError
} from '../../../../lib/apiErrorHandler';
import {
  FETCH_PROJECT,
  fetchProjectSuccess,
  fetchProjectFailure
} from './project.actions';

// TODO: define API endpoint for projects
const url = API_URL + '/projects/{0}';

function getProjectMock(projectId) {
  return new Promise(function(resolve, reject) {
    resolve(
      {
        id: projectId,
        created: '2017-05-09T16:47:49.016Z',
        buyer: 'buyer1',
        name: 'T-Shirts with logo',
        description: 'The T-Shirts with our company\'s logo on the chest, Qty: 50',
        priceDesired: 800.10,
        desiredDeliveryDate: '2017-05-20T16:47:49.016Z',
        deliveryAddress: {
          street: '109 S 5th street',
          city: 'Brooklyn',
          state: 'New York',
          zip: '11249'
        },
        specFileURL: 'http://bucket.s3.amazonaws.com/specs/7878u7e4hf83h28fh83uehr83uh8eujf',
        status: 'open',
        deliveredDate: '2017-05-20T16:47:49.016Z',
        bids: [
          {
            price: 790,
            projectPlanFileURL: 'http://bucket.s3.amazonaws.com/plans/ij93ij9ij39irjf9ie3jrfvg9i39r',
            accepted: false
          },
          {
            price: 795,
            projectPlanFileURL: 'http://bucket.s3.amazonaws.com/plans/asdasdqa3rf2erg3rhedfgh4th4r',
            accepted: false
          }
        ]
      }
    );
  });
}

function getProject(projectId) {
  if (API_MOCK) {
    return getProjectMock(projectId);
  }
  return fetch(url.replace('{0}', projectId), {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
    .then(handleApiError)
    .then(function(response) {
      return response.json();
    })
    .catch(function(error) {
      throw error;
    });
}

function* fetchProject(action) {
  try {
    const project = yield call(getProject,action.projectId);
    yield put(fetchProjectSuccess(project));
  } catch (err) {
    yield put(fetchProjectFailure(err.message));
  }
}

export default function* watchFetchProject() {
  yield takeLatest(FETCH_PROJECT, fetchProject);
}
