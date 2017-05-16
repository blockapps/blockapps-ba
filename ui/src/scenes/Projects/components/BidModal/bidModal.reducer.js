import {
  BID_OPEN_MODAL,
  BID_CLOSE_MODAL
} from './bidModal.actions';

const initialState = {
  isOpen: false,
};

const reducer = function (state = initialState, action) {
  switch (action.type) {
    case BID_OPEN_MODAL:
      return {
        isOpen: true,
      };
    case BID_CLOSE_MODAL:
      return {
        isOpen: false
      };
    default:
      return state;
  }
};

export default reducer;
