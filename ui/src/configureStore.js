import { fork } from 'redux-saga/effects';
import {
  createStore,
  applyMiddleware,
  combineReducers
} from 'redux';
import createSagaMiddleware from 'redux-saga';

import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';
import loginReducer from './scenes/Login/login.reducer.js';
import projectListReducer from './scenes/Projects/components/ProjectsList/projects-list.reducer';
import projectReducer from './scenes/Projects/components/Project/reducers/project.reducer';
import projectBidsReducer from './scenes/Projects/components/BidTable/reducers/projectBids.reducer';
import projectCreateReducer from './scenes/Projects/components/ProjectCreate/reducers/project-create.reducer';

import watchLoginSubmit from './scenes/Login/login.saga';
import watchFetchProjectList from './scenes/Projects/components/ProjectsList/projects-list.saga';
import watchFetchProject from './scenes/Projects/components/Project/sagas/project.saga';
import watchProjectCreate from './scenes/Projects/components/ProjectCreate/sagas/project-create.saga';
import watchBidSubmit from './scenes/Projects/components/Bid/bid.saga.js';
import watchBidAccept from './scenes/Projects/components/BidTable/sagas/acceptBid.saga.js';
import watchFetchProjectBids from './scenes/Projects/components/BidTable/sagas/projectBids.saga.js';

const rootReducer = combineReducers({
  form: formReducer,
  routing: routerReducer,
  login: loginReducer,
  projects: projectListReducer,
  bids: projectBidsReducer,
  project: projectReducer,
  createProject: projectCreateReducer,
});

const rootSaga = function* startForeman() {
  yield fork(watchLoginSubmit);
  yield fork(watchFetchProjectList);
  yield fork(watchFetchProject);
  yield fork(watchProjectCreate);
  yield fork(watchBidSubmit);
  yield fork(watchBidAccept);
  yield fork(watchFetchProjectBids);
};

const configureStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  return {
    ...createStore(rootReducer,
      window.devToolsExtension ? window.devToolsExtension() : f => f,
      applyMiddleware(sagaMiddleware)),
    runSaga: sagaMiddleware.run(rootSaga)
  };
};

export default configureStore;
