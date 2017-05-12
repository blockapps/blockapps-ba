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
  FETCH_PROJECTS_LIST,
  fetchProjectsListSuccess,
  fetchProjectsListFailure
} from './projects-list.actions';

const url = API_URL + '/projects';


// TODO: move to utils and use it everywhere
function getProjectsMock() {
  return new Promise(function(resolve, reject) {
    resolve({
      data: {
        projects: [
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
            spec: 'Lorem ipsum dolor sit amet, eam molestie singulis referrentur',
            state: 'open',
            deliveredDate: null
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
            spec: 'Et qui altera assentior reformidans, cum case augue te. Ius te dicit probatus intellegebat, no minimum',
            state: 'closed',
            deliveredDate: '2017-05-18T12:35:00.000Z'
          }
        ]
      }
    });
  });
}

function getProjectsList(listType, username) {
  if (API_MOCK) {
    return getProjectsMock();
  }

  let query;
  switch (listType) {
    case 'buyerList':
      query = '?filter=buyer&buyer=' + username;
      break;
    case 'allOpenList':
      query = '?filter=state&state=1'; // state 1 is 'OPEN'
      break;
    default:
      query = '';
  }

  return fetch(
    url + query,
    {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
    },
  })
    .then(handleApiError)
    .then(function(response) {
      return response.json();
    })
    .catch(function(error) {
      throw error;
    });
}

function* fetchProjectsList(action) {
  try {
    let response = yield call(getProjectsList, action.listType, action.username);

    yield put(fetchProjectsListSuccess(response.data['projects']));
  }
  catch (err) {
    yield put(fetchProjectsListFailure(err.message));
  }
}

export default function* watchFetchProjectsList() {
  yield takeLatest(FETCH_PROJECTS_LIST, fetchProjectsList);
}
