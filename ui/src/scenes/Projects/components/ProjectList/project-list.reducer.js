import {
  FETCH_PROJECT_LIST,
  FETCH_PROJECT_LIST_SUCCESS,
  FETCH_PROJECT_LIST_FAILURE,
} from './project-list.actions';

const initialState = {
  projects: {
    open: [],
    supplier: [],
    buyer: []
  },
  error: null,
};

const reducer = function (state = initialState, action) {
  switch (action.type) {
    case FETCH_PROJECT_LIST:
      return {
        projects: state.projects,
        error: null,
      };
    case FETCH_PROJECT_LIST_SUCCESS:
      let projects = state.projects;
      projects[action.listType] = action.projects;
      return {
        projects: projects,
        error: null,
      };
    case FETCH_PROJECT_LIST_FAILURE:
      return {
        projects: state.projects,
        error: action.error
      };
    default:
      return state;
  }
};

export default reducer;
