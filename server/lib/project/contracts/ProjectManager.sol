import "./Project.sol";
import "./ProjectState.sol";
import "./ProjectEvent.sol";
import "../../bid/contracts/Bid.sol";
import "../../bid/contracts/BidState.sol";
import "../../common/ErrorCodes.sol";
import "../../common/Util.sol";

/**
* Interface for Project data contracts
*/
contract ProjectManager is ErrorCodes, Util, ProjectState, ProjectEvent, BidState {

  Project[] projects;
  uint bidId; // unique identifier for bids

  /*
    note on mapping to array index:
    a non existing mapping will return 0, so 0 should not be a valid value in a map,
    otherwise exists() will not work
  */
  mapping (bytes32 => uint) nameToIndexMap;

  /**
  * Constructor
  */
  function ProjectManager() {
    projects.length = 1; // see above note
    bidId = block.number;
  }

  function exists(string name) returns (bool) {
    return nameToIndexMap[b32(name)] != 0;
  }

  function getProject(string name) returns (address) {
    uint index = nameToIndexMap[b32(name)];
    return projects[index];
  }

  /*
  string addressStreet,
  string addressCity,
  string addressState,
  string addressZip
  */
  //      addressStreet,
  //      addressCity,
  //      addressState,
  //      addressZip

  function createProject(
    string name,
    string buyer,
    string description,
    string spec,
    uint price,
    uint created,
    uint targetDelivery
  ) returns (ErrorCodes) {
    // fail if username exists
    if (exists(name)) return ErrorCodes.EXISTS;
    // add project
    uint index = projects.length;
    nameToIndexMap[b32(name)] = index;
    projects.push(new Project(
      name,
      buyer,
      description,
      spec,
      price,
      created,
      targetDelivery
    ));
    return ErrorCodes.SUCCESS;
  }

  function createBid(string name, string supplier, uint amount) returns (ErrorCodes, uint) {
    // fail if project name not found
    if (!exists(name)) return (ErrorCodes.NOT_FOUND, 0);
    // create bid
    bidId++; // increment the unique id
    Bid bid = new Bid(bidId, name, supplier, amount);
    return (ErrorCodes.SUCCESS, bidId);
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

  function setBidState(address bidAddress, BidState state) returns (ErrorCodes) {
    Bid bid = Bid(bidAddress);
    BidState currentState = bid.getState();
    if (currentState == BidState.OPEN  &&  state == BidState.ACCEPTED) {
      bid.setState(state);
      return ErrorCodes.SUCCESS;
    }
    if (currentState == BidState.OPEN  &&  state == BidState.REJECTED) {
      bid.setState(state);
      return ErrorCodes.SUCCESS;
    }
    return ErrorCodes.ERROR;
  }
}
