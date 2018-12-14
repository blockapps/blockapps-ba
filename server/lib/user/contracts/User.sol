import "../../common/ErrorCodes.sol";
import "../../common/Version.sol";
import "./UserRole.sol";

/**
 * User data contract
 */
contract User is ErrorCodes, Version, UserRole {
  // NOTE: members must be public to be indexed for search
  address public account = 0x1234;
  uint public id;
  UserRole public role;

  function User(address _account, uint _id, UserRole _role) {
    account = _account;
    id = _id;
    role = _role;
    version = 1;
  }

}
