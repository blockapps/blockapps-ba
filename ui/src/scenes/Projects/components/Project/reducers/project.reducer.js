import {
  FETCH_PROJECT,
  FETCH_PROJECT_SUCCESS,
  FETCH_PROJECT_FAILURE,
} from '../actions/project.actions';

const initialState = {
  project: {},
  isUpdating: false,
  message: ''
};

const reducer = function (state=initialState, action) {
  // console.log('########################', action.type, state.nodes);
  switch (action.type) {
    case FETCH_PROJECT:
      return {
        project: {},
        isUpdating: true,
        message: ''
      };
    case FETCH_PROJECT_SUCCESS:
      return {
        project: action.project,
        isUpdating: false,
        message: ''
      };
    case FETCH_PROJECT_FAILURE:
      return {
        project: state.project,
        isUpdating: false,
        message: action.message
      };
    default:
      return state;
  }
};

export default reducer;
