import "../user/contracts/UserManager.sol";

/**
  * Interface to global contracts
*/
contract AdminInterface {
  // NOTE: variable name must match contract name
  UserManager public userManager;

  /**
    * Constructor. Initialize global contracts and pointers
  */
  function AdminInterface() {
    userManager = new UserManager();
  }
}
