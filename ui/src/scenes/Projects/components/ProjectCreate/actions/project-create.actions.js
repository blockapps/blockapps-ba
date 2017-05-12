export const PROJECT_CREATE = 'PROJECT_CREATE';
export const PROJECT_CREATE_SUCCESS = 'PROJECT_CREATE_SUCCESS';
export const PROJECT_CREATE_FAILURE = 'PROJECT_CREATE_FAILURE';


export const projectCreate = function (project) {
  return {
    type: PROJECT_CREATE,
    project: project
  }
};

export const projectCreateSuccess = function (project) {
  return {
    type: PROJECT_CREATE_SUCCESS,
    project: project
  }
};

export const projectCreateFailure = function (message) {
  return {
    type: PROJECT_CREATE_FAILURE,
    message: message
  }
};
