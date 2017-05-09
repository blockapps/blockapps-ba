import "./User.sol";
import "../../common/ErrorCodes.sol";
import "../../common/Util.sol";

/**
* Interface for User data contracts
*/
contract UserManager is ErrorCodes, Util {
  User[] users;
  mapping (bytes32 => uint) usernameToIdMap;

  /**
  * Constructor
  */
  function UserManager() {
    users.length = 1;
  }

  function exists(string username) returns (bool) {
    return usernameToIdMap[b32(username)] != 0;
  }

  function getUser(string username) returns (address) {
    uint userId = usernameToIdMap[b32(username)];
    return users[userId];
  }

  function createUser(string username, bytes32 pwHash) returns (ErrorCodes) {
    // fail if username exists
    if (exists(username)) return ErrorCodes.EXISTS;
    // add user
    uint userId = users.length;
    usernameToIdMap[b32(username)] = userId;
    users.push(new User(username, pwHash, userId));
    return ErrorCodes.SUCCESS;
  }
}
