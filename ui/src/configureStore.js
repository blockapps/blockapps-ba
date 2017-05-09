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
import projectsReducer from './scenes/Projects/projects.reducer';

import watchLoginSubmit from './scenes/Login/login.saga';
import watchFetchProjects from './scenes/Projects/projects.saga';

const rootReducer = combineReducers({
  form: formReducer,
  routing: routerReducer,
  login: loginReducer,
  projects: projectsReducer,
});

const rootSaga = function* startForeman() {
  yield fork(watchLoginSubmit);
  yield fork(watchFetchProjects);
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
