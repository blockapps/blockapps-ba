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
          deliveredDate: null,
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
        },
        {
          id: 1431,
          created: '2017-05-09T16:47:49.016Z',
          buyer: 'buyer2',
          name: 'NY Yankees sleeve',
          description: 'Sleeve with New York Yankees logos all over it',
          priceDesired: 10.2,
          desiredDeliveryDate: '2017-05-17T10:32:01.016Z',
          deliveryAddress: {
            street: '109 South 5th st.',
            city: 'Brooklyn',
            state: 'NY',
            zip: '11249'
          },
          specFileURL: 'http://bucket.s3.amazonaws.com/specs/1431',
          status: 'closed',
          deliveredDate: '2017-05-18T12:35:00.000Z',
          bids: [
            {
              price: 10.2,
              projectPlanFileURL: 'http://bucket.s3.amazonaws.com/plans/sdfswerf3rgv3wrfwfgh3ed',
              accepted: true
            },
            {
              price: 10,
              projectPlanFileURL: 'http://bucket.s3.amazonaws.com/plans/qwasdqasdf2erg3rhedfgh4th4r',
              accepted: false
            }
          ]
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
