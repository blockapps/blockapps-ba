import {
  takeLatest,
  put,
  call
} from 'redux-saga/effects';
import {
  API_URL,
  API_MOCK
} from '../../environment';
import {
  handleApiError
} from '../../lib/apiErrorHandler';
import {
  FETCH_PROJECTS,
  fetchProjectsSuccess,
  fetchProjectsFailure
} from './projects.actions';

// TODO: define API endpoint for projects
const url = API_URL + '/projects';

function getProjectsMock() {
  return new Promise(function(resolve, reject) {
    resolve(
      [
        {
          id: 132,
          created: '2017-05-09T16:47:49.016Z',
          buyerId: 5,
          name: 'T-Shirts with logo', // todo: do we need name?
          description: 'The T-Shirts with our company\'s logo on the chest, Qty: 50',
          priceDesired: 800,
          desiredDeliveryDate: '2017-05-20T16:47:49.016Z',
          deliveryAddress: {
            street: '109 S 5th street',
            city: 'Brooklyn',
            state: 'New York',
            zip: '11249'
          },
          // todo: do we need contacts? phone, email?
          specFileURL: 'http://bucket.s3.amazonaws.com/specs/132',
          contractName: '45003a173bc74ee7c25c7798e6748a106fac4a72',
          status: {
            id: 1,
            name: 'open'
          }, // todo: statuses ?
          acceptedBidId: null
        },
        {
          id: 14,
          created: '2017-05-08T13:42:45.016Z',
          buyerId: 5,
          name: 'NY Yankees sleeve fast',
          description: 'Sleeve with New York Yankees logos all over it',
          priceDesired: 10.1,
          desiredDeliveryDate: '2017-05-18T12:00:00.000Z',
          deliveryAddress: {
            street: '109 S 5th st.',
            city: 'Brooklyn',
            state: 'NY',
            zip: '11249'
          },
          specFileURL: 'http://bucket.s3.amazonaws.com/specs/14',
          contractName: '32003a173bc74ee7c25c7798e6748a106fac4a14',
          status: {
            id: 1,
            name: 'processing'
          },
          acceptedBidId: 12
        }
      ]
    );
  });
}

function getProjects() {
  if (API_MOCK) {
    return getProjectsMock();
  }
  return fetch(url, {
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

function* fetchProjects(action) {
  try {
    let projects = yield call(getProjects);

    yield put(fetchProjectsSuccess(projects));
  } catch (err) {
    yield put(fetchProjectsFailure(err.message));
  }
}

export default function* watchFetchProjects() {
  yield takeLatest(FETCH_PROJECTS, fetchProjects);
}
