import "../../common/ErrorCodes.sol";
import "./ProjectState.sol";

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
