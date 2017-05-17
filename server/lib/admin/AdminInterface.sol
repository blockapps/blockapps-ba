import "../user/contracts/UserManager.sol";
import "../project/contracts/ProjectManager.sol";

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
