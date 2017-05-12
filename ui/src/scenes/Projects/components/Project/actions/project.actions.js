export const FETCH_PROJECT = 'FETCH_PROJECT';
export const FETCH_PROJECT_SUCCESS = 'FETCH_PROJECT_SUCCESS';
export const FETCH_PROJECT_FAILURE = 'FETCH_PROJECT_FAILURE';


export const fetchProject = function (projectId) {
  return {
    type: FETCH_PROJECT,
    projectId: projectId
  }
};

export const fetchProjectSuccess = function (project) {
  return {
    type: FETCH_PROJECT_SUCCESS,
    project: project
  }
};

export const fetchProjectFailure = function (message) {
  return {
    type: FETCH_PROJECT_FAILURE,
    message: message
  }
};
