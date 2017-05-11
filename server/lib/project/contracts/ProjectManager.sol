import "./Project.sol";
import "../../common/ErrorCodes.sol";

/**
* Interface for Project data contracts
*/
contract ProjectManager is ErrorCodes {
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

  function createPtoject(uint id, string buyer) returns (ErrorCodes) {
    // fail if username exists
    if (exists(id)) return ErrorCodes.EXISTS;
    // add project
    uint index = projects.length;
    projectidToIndexMap[id] = index;
    projects.push(new Project(id, buyer));
    return ErrorCodes.SUCCESS;
  }
}
