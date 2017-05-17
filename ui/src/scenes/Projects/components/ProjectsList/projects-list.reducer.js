import {
  FETCH_PROJECTS_LIST,
  FETCH_PROJECTS_LIST_SUCCESS,
  FETCH_PROJECTS_LIST_FAILURE,
} from './projects-list.actions';

const initialState = {
  projects: [],
  error: null,
};

const reducer = function (state = initialState, action) {
  switch (action.type) {
    case FETCH_PROJECTS_LIST:
      return {
        projects: state.projects,
        error: null,
      };
    case FETCH_PROJECTS_LIST_SUCCESS:
      return {
        projects: action.projects,
        error: null,
      };
    case FETCH_PROJECTS_LIST_FAILURE:
      return {
        projects: state.projects,
        error: action.error
      };
    default:
      return state;
  }
};

export default reducer;
