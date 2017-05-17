export const PROJECT_EVENT = 'PROJECT_EVENT';
export const PROJECT_EVENT_SUCCESS = 'PROJECT_EVENT_SUCCESS';
export const PROJECT_EVENT_FAILURE = 'PROJECT_EVENT_FAILURE';

export const projectEvent = function(projectName, projectEvent, username) {
  return {
    type: PROJECT_EVENT,
    projectName: projectName,
    projectEvent: projectEvent,
    username: username
  }
};

export const projectEventSuccess= function() {
  return {
    type: PROJECT_EVENT_SUCCESS
  }
};

export const projectEventFailure = function(err) {
  return {
    type: PROJECT_EVENT_FAILURE,
    err: err
  }
};
