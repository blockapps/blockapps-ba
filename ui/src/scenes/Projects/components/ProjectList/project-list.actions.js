export const FETCH_PROJECT_LIST = 'FETCH_PROJECTS';
export const FETCH_PROJECT_LIST_SUCCESS = 'FETCH_PROJECTS_SUCCESS';
export const FETCH_PROJECT_LIST_FAILURE = 'FETCH_PROJECTS_FAILURE';

export const fetchProjectList = function (listType, username=null) {
  return {
    type: FETCH_PROJECT_LIST,
    listType: listType,
    username: username,
  }
};

export const fetchProjectListSuccess = function (listType, projects) {
  return {
    type: FETCH_PROJECT_LIST_SUCCESS,
    listType: listType,
    projects: projects,
  }
};

export const fetchProjectListFailure = function (error) {
  return {
    type: FETCH_PROJECT_LIST_FAILURE,
    error: error,
  }
};
