import { fork } from 'redux-saga/effects';
import {
  createStore,
  applyMiddleware,
  combineReducers
} from 'redux';
import createSagaMiddleware from 'redux-saga';
import { loadingBarMiddleware } from 'react-redux-loading-bar';

import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';
import { loadingBarReducer } from 'react-redux-loading-bar';
import loginReducer from './scenes/Login/login.reducer.js';
import projectListReducer from './scenes/Projects/components/ProjectList/project-list.reducer';
import projectReducer from './scenes/Projects/components/Project/reducers/project.reducer';
import projectBidsReducer from './scenes/Projects/components/Project/components/Bids/components/BidTable/reducers/projectBids.reducer';
import projectCreateReducer from './scenes/Projects/components/ProjectCreate/reducers/project-create.reducer';
import bidModalReducer from './scenes/Projects/components/BidModal/bidModal.reducer';

import watchLoginSubmit from './scenes/Login/login.saga';
import watchFetchProjectList from './scenes/Projects/components/ProjectList/project-list.saga';
import watchFetchProject from './scenes/Projects/components/Project/sagas/project.saga';
import watchProjectCreate from './scenes/Projects/components/ProjectCreate/sagas/project-create.saga';
import watchProjectEvent from './scenes/Projects/components/Project/sagas/project-event.saga.js';
import watchBidSubmit from './scenes/Projects/components/BidModal/bidModal.saga.js';
import watchBidAccept from './scenes/Projects/components/Project/components/Bids/components/BidTable/sagas/acceptBid.saga.js';
import watchFetchProjectBids from './scenes/Projects/components/Project/components/Bids/components/BidTable/sagas/projectBids.saga.js';

const rootReducer = combineReducers({
  form: formReducer,
  routing: routerReducer,
  login: loginReducer,
  projects: projectListReducer,
  bids: projectBidsReducer,
  bidModal: bidModalReducer,
  project: projectReducer,
  createProject: projectCreateReducer,
  loadingBar: loadingBarReducer,
});

const rootSaga = function* startForeman() {
  yield [
    fork(watchLoginSubmit),
    fork(watchFetchProjectList),
    fork(watchFetchProject),
    fork(watchProjectCreate),
    fork(watchProjectEvent),
    fork(watchBidSubmit),
    fork(watchBidAccept),
    fork(watchFetchProjectBids)
  ]
};

const configureStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  return {
    ...createStore(rootReducer,
      window.devToolsExtension ? window.devToolsExtension() : f => f,
      applyMiddleware(sagaMiddleware,loadingBarMiddleware())
    ),
    runSaga: sagaMiddleware.run(rootSaga)
  };
};

export default configureStore;
