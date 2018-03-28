contract ErrorCodes {

    enum ErrorCodes {
        NULL,
        SUCCESS,
        ERROR,
        NOT_FOUND,
        EXISTS,
        RECURSIVE,
        INSUFFICIENT_BALANCE
    }
}

contract Version {
  uint version;
}

contract UserRole {

    enum UserRole {
        NULL,
        ADMIN,
        BUYER,
        SUPPLIER
    }
}

/**
 * User data contract
 */
contract User is ErrorCodes, Version, UserRole {
  // NOTE: members must be public to be indexed for search
  address public account = 0x1234;
  string public username;
  bytes32 public pwHash;
  uint public id;
  UserRole public role;

  function User(address _account, string _username, bytes32 _pwHash, uint _id, UserRole _role) {
    account = _account;
    username = _username;
    pwHash = _pwHash;
    id = _id;
    role = _role;
    version = 1;
  }

  function authenticate(bytes32 _pwHash) returns (bool) {
    return pwHash == _pwHash;
  }
}

/**
 * Util contract
 */
contract Util {
  function stringToBytes32(string memory source) returns (bytes32 result) {
      assembly {
          result := mload(add(source, 32))
      }
  }

  function b32(string memory source) returns (bytes32) {
    return stringToBytes32(source);
  }
}

/**
* Interface for User data contracts
*/
contract UserManager is ErrorCodes, Util, UserRole {
  User[] users;
  /*
    note on mapping to array index:
    a non existing mapping will return 0, so 0 should not be a valid value in a map,
    otherwise exists() will not work
  */
  mapping (bytes32 => uint) usernameToIdMap;

  /**
  * Constructor
  */
  function UserManager() {
    users.length = 1; // see above note
  }

  function exists(string username) returns (bool) {
    return usernameToIdMap[b32(username)] != 0;
  }

  function getUser(string username) returns (address) {
    uint userId = usernameToIdMap[b32(username)];
    return users[userId];
  }

  function createUser(address account, string username, bytes32 pwHash, UserRole role) returns (ErrorCodes) {
    // name must be < 32 bytes
    if (bytes(username).length > 32) return ErrorCodes.ERROR;
    // fail if username exists
    if (exists(username)) return ErrorCodes.EXISTS;
    // add user
    uint userId = users.length;
    usernameToIdMap[b32(username)] = userId;
    users.push(new User(account, username, pwHash, userId, role));
    return ErrorCodes.SUCCESS;
  }

  function login(string username, bytes32 pwHash) returns (bool) {
    // fail if username doesnt exists
    if (!exists(username)) return false;
    // get the user
    address a = getUser(username);
    User user = User(a);
    return user.authenticate(pwHash);
  }
}

contract ProjectState {

    enum ProjectState {
        NULL,
        OPEN,
        PRODUCTION,
        INTRANSIT,
        RECEIVED
    }
}

/*

{
    created: '2017-05-09T16:47:49.016Z',
    buyer: 'buyer1',
    name: 'T-Shirts with logo',
    description: 'The T-Shirts with our company\'s logo on the chest, Qty: 50',
    priceDesired: 800.10,
    desiredDeliveryDate: '2017-05-20T16:47:49.016Z',
    addressStreet: '109 S 5th street',
    addresscity: 'Brooklyn',
    addressstate: 'New York',
    addresszip: '11249',
    spec: 'Lorem ipsum dolor sit amet, eam molestie singulis referrentur',
    state: 'OPEN',
    deliveredDate: null // filled when the 'RECEIVED' button clicked
  }
*/

/**
 * Project data contract
 */
contract Project is ErrorCodes, ProjectState {
  // NOTE: members must be public to be indexed for search
  string public name;
  string public buyer;
  string public description;
  string public spec;
  uint public price; // in cents

  uint public created; // date
  uint public targetDelivery; // date
  uint public delivered; // date

  string public addressStreet;
  string public addressCity;
  string public addressState;
  string public addressZip;

  ProjectState public state;

  function Project(
    string _name,
    string _buyer,
    string _description,
    string _spec,
    uint _price,
    uint _created,
    uint _targetDelivery
  ) {
    name = _name;
    buyer = _buyer;
    description = _description;
    spec = _spec;
    price = _price;
    created = _created;
    targetDelivery = _targetDelivery;

    state = ProjectState.OPEN;
  }

  function setShippingAddress(
    string _addressStreet,
    string _addressCity,
    string _addressState,
    string _addressZip
  ) {
    addressStreet = _addressStreet;
    addressCity = _addressCity;
    addressState = _addressState;
    addressZip = _addressZip;
  }

  function getState() returns (ProjectState) {
    return state;
  }

  function setState(ProjectState _state) {
    state = _state;
  }
}

contract ProjectEvent {

    enum ProjectEvent {
        NULL,
        ACCEPT,
        DELIVER,
        RECEIVE
    }
}

contract BidState {

    enum BidState {
        NULL,
        OPEN,
        ACCEPTED,
        REJECTED
    }
}

/**
 * Bid data contract
 */
contract Bid is ErrorCodes, BidState {
  // NOTE: members must be public to be indexed for search
  uint public id;
  string public name;
  string public supplier;
  uint public amount;
  BidState public state;

  function Bid(uint _id, string _name, string _supplier, uint _amount) {
    id = _id;
    name = _name;
    supplier = _supplier;
    amount = _amount;
    state = BidState.OPEN;
  }

  function getState() returns (BidState) {
    return state;
  }

  function setState(BidState _state) {
    state = _state;
  }

  function setBidState(BidState newState) payable returns (ErrorCodes) {
    if (state == BidState.OPEN  &&  newState == BidState.ACCEPTED) {
      setState(newState);
      return ErrorCodes.SUCCESS;
    }
    if (state == BidState.OPEN  &&  newState == BidState.REJECTED) {
      setState(newState);
      return ErrorCodes.SUCCESS;
    }
    return ErrorCodes.ERROR;
  }

  function settle(address supplierAddress) returns (ErrorCodes) {
    // confirm balance, to return error
    if (this.balance < amount) {
      return ErrorCodes.INSUFFICIENT_BALANCE;
    }
    uint fee = 10000000 wei; // supplier absorbs the fee
    uint amountWei = amount * 1 ether;

    // transfer will throw
    supplierAddress.send(amountWei-fee);
    return ErrorCodes.SUCCESS;
  }
}

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
    // name must be < 32 bytes
    if (bytes(name).length > 32) return ErrorCodes.ERROR;
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

  function settleProject(string name, address supplierAddress, address bidAddress) returns (ErrorCodes) {
    // validity
    if (!exists(name)) return (ErrorCodes.NOT_FOUND);
    // set project state
    address projectAddress = getProject(name);
    var (errorCode, state) = handleEvent(projectAddress, ProjectEvent.RECEIVE);
    if (errorCode != ErrorCodes.SUCCESS) return errorCode;
    // settle
    Bid bid = Bid(bidAddress);
    return bid.settle(supplierAddress);
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


/**
  * Interface to global contracts
*/
contract AdminInterface {
  // NOTE: variable name must match contract name
  UserManager public userManager;
  ProjectManager public projectManager;

  /**
    * Constructor. Initialize global contracts and pointers
  */
  function AdminInterface() {
    userManager = new UserManager();
    projectManager = new ProjectManager();
  }
}
