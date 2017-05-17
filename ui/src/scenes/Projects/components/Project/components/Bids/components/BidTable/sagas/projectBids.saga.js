import {
  takeLatest, put, call
} from 'redux-saga/effects';
import {
  API_URL,
  API_MOCK
} from '../../../../../../../../../environment';
import {
  handleApiError
} from '../../../../../../../../../lib/apiErrorHandler';
import {
  FETCH_PROJECT_BIDS,
  fetchProjectBidsSuccess,
  fetchProjectBidsFailure
} from '../actions/projectBids.actions';
import { showLoading, hideLoading } from 'react-redux-loading-bar';

// TODO: define API endpoint for projects
const url = API_URL + '/projects/:name/bids';

function getBids(name){
  if(API_MOCK) {
    return new Promise(function(resolve, reject){
      resolve({
        data: {
          bids: [
            {
              price: 790,
              planDescription: 'Lorem ipsum dolor sit amet, eam molestie singulis referrentur at, ei malis clita scripta mel. Et qui altera assentior reformidans, cum case augue te. Ius te dicit probatus intellegebat, no minimum molestiae delicatissimi cum. Omnium officiis instructior ne mel, nam id fugit minim interesset.',
              accepted: false
            },
            {
              price: 795,
              planDescription: 'Et qui altera assentior reformidans, cum case augue te. Ius te dicit probatus intellegebat, no minimum molestiae delicatissimi cum. Omnium officiis instructior ne mel, nam id fugit minim interesset.',
              accepted: false
            }
          ]
        }
      });
    });
  }

  return fetch(
    url.replace(':name',name),
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json'
      }
    })
    .then(handleApiError)
    .then(function(response) {
      return response.json();
    })
    .catch(function(error){
      throw error;
    });

}


function* fetchProjectBids(action){
  try {
    yield put(showLoading());
    let response = yield call(getBids, action.name);
    yield put(hideLoading());
    yield put(fetchProjectBidsSuccess(response.data.bids));
  }
  catch(err) {
    yield put(hideLoading());
    yield put(fetchProjectBidsFailure(err));
  }
}

export default function* watchFetchProjectBids() {
  yield takeLatest(FETCH_PROJECT_BIDS, fetchProjectBids);
}
