import {
  createStore,
  applyMiddleware,
  combineReducers
} from 'redux';
import createSagaMiddleware from 'redux-saga';
import { routerReducer } from 'react-router-redux';

const rootReducer = combineReducers({
  routing: routerReducer,
});

const rootSaga = function* startForeman() {
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
