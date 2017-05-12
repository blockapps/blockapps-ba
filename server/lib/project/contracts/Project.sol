import "../../common/ErrorCodes.sol";
import "./ProjectState.sol";

/**
 * Project data contract
 */
contract Project is ErrorCodes, ProjectState {
  // NOTE: members must be public to be indexed for search
  string public name;
  string public buyer;
  ProjectState public state;

  function Project(string _name, string _buyer) {
    name = _name;
    buyer = _buyer;
    state = ProjectState.OPEN;
  }

  function getState() returns (ProjectState) {
    return state;
  }

  function setState(ProjectState _state) {
    state = _state;
  }
}
