import * as ActionTypes from './user-message.action';

// Updates error message to notify about the failed fetches OR user notification message
const userMessageReducer = function(state = null, action) {
  const { type, error } = action;

  if (type === ActionTypes.RESET_USER_MESSAGE) {
    return null;
  }
  else if (error) {
    return action.error.message;
  }
  else if (type === ActionTypes.SET_USER_MESSAGE) {
    return action.message;
  }
  return state;
};

export default userMessageReducer;
