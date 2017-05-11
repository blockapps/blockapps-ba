import "../../common/ErrorCodes.sol";
import "./ProjectState.sol";

/**
 * Project data contract
 */
contract Project is ErrorCodes, ProjectState {
  // NOTE: members must be public to be indexed for search
  string public buyer;
  uint public id;
  ProjectState public state;

  function Project(uint _id, string _buyer) {
    id = _id;
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
