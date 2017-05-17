export const FETCH_PROJECTS_LIST = 'FETCH_PROJECTS';
export const FETCH_PROJECTS_LIST_SUCCESS = 'FETCH_PROJECTS_SUCCESS';
export const FETCH_PROJECTS_LIST_FAILURE = 'FETCH_PROJECTS_FAILURE';

export const fetchProjectsList = function (listType, username=null) {
  return {
    type: FETCH_PROJECTS_LIST,
    listType: listType,
    username: username,
  }
};

export const fetchProjectsListSuccess = function (projects) {
  return {
    type: FETCH_PROJECTS_LIST_SUCCESS,
    projects: projects,
  }
};

export const fetchProjectsListFailure = function (error) {
  return {
    type: FETCH_PROJECTS_LIST_FAILURE,
    error: error,
  }
};

