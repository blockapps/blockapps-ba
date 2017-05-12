import React from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory } from 'react-router';
import routes from './routes';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import configureStore from './configureStore';
import './index.css';
import { IntlProvider } from 'react-intl'

const store = configureStore();
const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
  <Provider store={store}>
    <IntlProvider locale="en">
      <Router history={history} routes={routes} />
    </IntlProvider>
  </Provider>,
  document.getElementById('root')
);
