import {
  takeEvery,
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
  FETCH_PROJECT_LIST,
  fetchProjectListSuccess,
  fetchProjectListFailure
} from './project-list.actions';
import { showLoading, hideLoading } from 'react-redux-loading-bar';

const url = API_URL + '/projects?{0}';


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
            state: 'OPEN',
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
            state: 'RECEIVED',
            deliveredDate: '2017-05-18T12:35:00.000Z'
          }
        ]
      }
    });
  });
}

function getProjectList(listType, username) {
  if (API_MOCK) {
    return getProjectsMock();
  }
  let query;
  switch (listType) {
    case 'buyer':
      query = 'filter=buyer&buyer=' + username;
      break;
    case 'open':
      query = 'filter=state&state=1'; // state 1 is 'OPEN'
      break;
    case 'supplier':
      query = 'filter=supplier&supplier=' + username;
      break;
    default:
      query = '';
  }

  return fetch(
    url.replace('{0}', query),
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

function* fetchProjectList(action) {
  try {
    yield put(showLoading());
    let response = yield call(getProjectList, action.listType, action.username);
    yield put(hideLoading());
    yield put(fetchProjectListSuccess(action.listType, response.data['projects']));
  }
  catch (err) {
    yield put(fetchProjectListFailure(err));
    yield put(hideLoading());
  }
}

export default function* watchFetchProjectList() {
  yield takeEvery(FETCH_PROJECT_LIST, fetchProjectList);
}
