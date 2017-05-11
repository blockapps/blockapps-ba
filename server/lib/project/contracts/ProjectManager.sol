import "./Project.sol";
import "./ProjectState.sol";
import "./ProjectEvent.sol";
import "../../bid/contracts/BidState.sol";
import "../../common/ErrorCodes.sol";

/**
* Interface for Project data contracts
*/
contract ProjectManager is ErrorCodes, ProjectState, ProjectEvent {
  Project[] projects;
  /*
    note on mapping to array index:
    a non existing mapping will return 0, so 0 should not be a valid value in a map,
    otherwise exists() will not work
  */
  mapping (uint => uint) projectidToIndexMap;

  /**
  * Constructor
  */
  function ProjectManager() {
    projects.length = 1; // see above note
  }

  function exists(uint id) returns (bool) {
    return projectidToIndexMap[id] != 0;
  }

  function getProject(uint id) returns (address) {
    uint index = projectidToIndexMap[id];
    return projects[index];
  }

  function createProject(uint id, string buyer) returns (ErrorCodes) {
    // fail if username exists
    if (exists(id)) return ErrorCodes.EXISTS;
    // add project
    uint index = projects.length;
    projectidToIndexMap[id] = index;
    projects.push(new Project(id, buyer));
    return ErrorCodes.SUCCESS;
  }

  /**
   * handleEvent - transition project to a new state based on incoming event
   */
  function handleEvent(address projectAddress, ProjectEvent projectEvent) returns (ErrorCodes, ProjectState) {
    Project project = Project(projectAddress);
    ProjectState state = project.getState();
    // check transition
    var (errorCode, newState) = fsm(state, projectEvent);
    // event is not valid in current state
    if (errorCode != ErrorCodes.SUCCESS) {
      return (errorCode, state);
    }
    // use the new state
    project.setState(newState);
    return (ErrorCodes.SUCCESS, newState);
  }

  function fsm(ProjectState state, ProjectEvent projectEvent) returns (ErrorCodes, ProjectState) {
    // NULL
    if (state == ProjectState.NULL)
      return (ErrorCodes.ERROR, state);
    // OPEN
    if (state == ProjectState.OPEN) {
      if (projectEvent == ProjectEvent.ACCEPT)
        return (ErrorCodes.SUCCESS, ProjectState.PRODUCTION);
    }
    // PRODUCTION
    if (state == ProjectState.PRODUCTION) {
      if (projectEvent == ProjectEvent.DELIVER)
        return (ErrorCodes.SUCCESS, ProjectState.INTRANSIT);
    }
    // INTRANSIT
    if (state == ProjectState.INTRANSIT) {
      if (projectEvent == ProjectEvent.RECEIVE)
        return (ErrorCodes.SUCCESS, ProjectState.RECEIVED);
    }
    return (ErrorCodes.ERROR, state);
  }

}
