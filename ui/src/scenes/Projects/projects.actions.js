export const FETCH_PROJECTS = 'FETCH_PROJECTS';
export const FETCH_PROJECTS_SUCCESS = 'FETCH_PROJECTS_SUCCESS';
export const FETCH_PROJECTS_FAILURE = 'FETCH_PROJECTS_FAILURE';

export const fetchProjects = function () {
  return {
    type: FETCH_PROJECTS
  }
};

export const fetchProjectsSuccess = function (projects) {
  return {
    type: FETCH_PROJECTS_SUCCESS,
    projects: projects
  }
};

export const fetchProjectsFailure = function (message) {
  return {
    type: FETCH_PROJECTS_FAILURE,
    message: message
  }
};

