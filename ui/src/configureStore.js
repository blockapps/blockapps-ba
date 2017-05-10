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
import projectReducer from './scenes/Projects/components/Project/project.reducer';

import watchLoginSubmit from './scenes/Login/login.saga';
import watchFetchProjects from './scenes/Projects/projects.saga';
import watchFetchProject from './scenes/Projects/components/Project/project.saga';

const rootReducer = combineReducers({
  form: formReducer,
  routing: routerReducer,
  login: loginReducer,
  projects: projectsReducer,
  project: projectReducer,
});

const rootSaga = function* startForeman() {
  yield fork(watchLoginSubmit);
  yield fork(watchFetchProjects);
  yield fork(watchFetchProject);
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
