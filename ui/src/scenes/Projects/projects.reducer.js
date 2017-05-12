import {
  FETCH_PROJECTS,
  FETCH_PROJECTS_SUCCESS,
  FETCH_PROJECTS_FAILURE,
} from './projects.actions';

const initialState = {
  projects: [],
  isUpdating: false,
  message: ''
};

const reducer = function (state = initialState, action) {
  // console.log('########################', action.type, state.nodes);
  switch (action.type) {
    case FETCH_PROJECTS:
      return {
        projects: state.projects,
        isUpdating: true,
        message: ''
      };
    case FETCH_PROJECTS_SUCCESS:
      return {
        projects: action.projects,
        isUpdating: false,
        message: ''
      };
    case FETCH_PROJECTS_FAILURE:
      return {
        projects: state.projects,
        isUpdating: false,
        message: action.message
      };
    default:
      return state;
  }
};

export default reducer;
