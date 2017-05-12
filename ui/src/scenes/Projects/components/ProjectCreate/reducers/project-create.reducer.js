import {
  PROJECT_CREATE,
  PROJECT_CREATE_SUCCESS,
  PROJECT_CREATE_FAILURE,
} from '../actions/project-create.actions';

const initialState = {
  project: null,
  error: null,
};

const reducer = function (state=initialState, action) {
  // console.log('########################', action.type, state.nodes);
  switch (action.type) {
    case PROJECT_CREATE:
      return initialState;
    case PROJECT_CREATE_SUCCESS:
      return {
        project: action.project,
        error: null,
      };
    case PROJECT_CREATE_FAILURE:
      return {
        project: state.project,
        error: action.error
      };
    default:
      return state;
  }
};

export default reducer;
