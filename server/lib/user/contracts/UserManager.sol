import "./User.sol";
import "./UserRole.sol";
import "../../common/ErrorCodes.sol";
import "../../common/Util.sol";

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
