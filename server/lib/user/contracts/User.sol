import "../../common/ErrorCodes.sol";
import "../../common/Version.sol";
import "./UserRole.sol";

/**
 * User data contract
 */
contract User is ErrorCodes, Version, UserRole {
  // NOTE: members must be public to be indexed for search
  string public email;
  string public firstName;
  string public lastName;
  bytes32 public pwHash;
  uint public id;
  UserRole public role;

  function User(string _email, string _firstName, string _lastName, bytes32 _pwHash, uint _id, UserRole _role) {
    email = _email;
    firstName = _firstName;
    lastName = _lastName;
    pwHash = _pwHash;
    id = _id;
    role = _role;
    version = 1;
  }

  function authenticate(bytes32 _pwHash) returns (bool) {
    return pwHash == _pwHash;
  }
}
