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
  mapping (address => uint) accountToIdMap;

  /**
  * Constructor
  */
  function UserManager() {
    users.length = 1; // see above note
  }

  function exists(address account) returns (bool) {
    return accountToIdMap[account] != 0;
  }

  function getUser(address account) returns (address) {
    uint userId = accountToIdMap[account];
    return users[userId];
  }

  function createUser(address account, UserRole role) returns (ErrorCodes) {
    // fail if account exists
    if (exists(account)) return ErrorCodes.EXISTS;
    // add user
    uint userId = users.length;
    accountToIdMap[account] = userId;
    users.push(new User(account, userId, role));
    return ErrorCodes.SUCCESS;
  }

}
