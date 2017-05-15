import * as ActionTypes from './error-message.action';

// Updates error message to notify about the failed fetches.
const errorMessageReducer = function(state = null, action) {
  const { type, error } = action;

  if (type === ActionTypes.RESET_ERROR_MESSAGE) {
    return null
  } else if (error) {
    return action.error
  }

  return state
};

export default errorMessageReducer;
