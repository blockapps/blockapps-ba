import { takeLatest, put, call } from 'redux-saga/effects';
import {
  BID_SUBMIT,
  bidSuccess,
  bidFailure
} from './bid.actions';
import { browserHistory } from 'react-router';
import { API_URL, API_MOCK } from '../../../../environment';
import { handleApiError } from '../../../../lib/apiErrorHandler';

const bidUrl = API_URL + '/projects/:name/bids';

function submitBidApiCall(
  name,
  supplier,
  amount
){

  if(API_MOCK) {
    return new Promise(function(resolve,reject){
      resolve({});
    });
  }
  else {
    const apiUrl = bidUrl.replace(':name',name);

    return fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ supplier, amount })
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

function* submitBid(action){
  try {
    yield call(
      submitBidApiCall,
      action.name,
      action.supplier,
      action.amount);
    yield put(bidSuccess());
    browserHistory.goBack();
  }
  catch(err) {
    yield put(bidFailure(err));
  }
}

export default function* watchBidSubmit() {
  yield takeLatest(BID_SUBMIT, submitBid);
}
