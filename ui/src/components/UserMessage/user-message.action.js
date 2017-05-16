export const RESET_USER_MESSAGE = 'RESET_USER_MESSAGE';
export const SET_USER_MESSAGE = 'SET_USER_MESSAGE';

// Resets the currently visible user message.
export const resetUserMessage = () => ({
  type: RESET_USER_MESSAGE
});

export const setUserMessage = (message) => ({
  type: SET_USER_MESSAGE,
  message: message
});
