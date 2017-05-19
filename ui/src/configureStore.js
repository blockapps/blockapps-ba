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
import userMessageReducer from './components/UserMessage/user-message.reducer';
import loginReducer from './scenes/Login/login.reducer.js';
import explorerUrlReducer from './components/ExplorerUrl/explorer.reducer';
import projectListReducer from './scenes/Projects/components/ProjectList/project-list.reducer';
import projectReducer from './scenes/Projects/components/Project/reducers/project.reducer';
import projectBidsReducer from './scenes/Projects/components/Project/components/Bids/components/BidTable/reducers/projectBids.reducer';
import projectCreateReducer from './scenes/Projects/components/ProjectCreate/reducers/project-create.reducer';
import bidModalReducer from './scenes/Projects/components/BidModal/bidModal.reducer';
import userBalanceReducer from './components/App/components/UserBadge/user-badge.reducer';

import watchExplorerUrl from './components/ExplorerUrl/explorer.saga';
import watchLoginSubmit from './scenes/Login/login.saga';
import watchFetchProjectList from './scenes/Projects/components/ProjectList/project-list.saga';
import watchFetchProject from './scenes/Projects/components/Project/sagas/project.saga';
import watchProjectCreate from './scenes/Projects/components/ProjectCreate/sagas/project-create.saga';
import watchProjectEvent from './scenes/Projects/components/Project/sagas/project-event.saga.js';
import watchBidSubmit from './scenes/Projects/components/BidModal/bidModal.saga.js';
import watchBidAccept from './scenes/Projects/components/Project/components/Bids/components/BidTable/sagas/acceptBid.saga.js';
import watchFetchProjectBids from './scenes/Projects/components/Project/components/Bids/components/BidTable/sagas/projectBids.saga.js';
import watchBalanceSubmit from './components/App/components/UserBadge/user-badge.saga';

const rootReducer = combineReducers({
  form: formReducer,
  routing: routerReducer,
  userMessage: userMessageReducer,
  login: loginReducer,
  explorerUrl: explorerUrlReducer,
  projects: projectListReducer,
  bids: projectBidsReducer,
  bidModal: bidModalReducer,
  project: projectReducer,
  createProject: projectCreateReducer,
  loadingBar: loadingBarReducer,
  balance: userBalanceReducer,
});

const rootSaga = function* startForeman() {
  yield [
    fork(watchLoginSubmit),
    fork(watchExplorerUrl),
    fork(watchFetchProjectList),
    fork(watchFetchProject),
    fork(watchProjectCreate),
    fork(watchProjectEvent),
    fork(watchBidSubmit),
    fork(watchBidAccept),
    fork(watchFetchProjectBids),
    fork(watchBalanceSubmit),
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
