require('co-mocha');
const ba = require('blockapps-rest');
const rest = ba.rest;
const common = ba.common;
const config = common.config;
const util = common.util;
const should = common.should;
const assert = common.assert;
const Promise = common.Promise;

const projectJs = require('../project');
const jwtDecode = require('jwt-decode');
const utils = require('../../../utils');

const accessToken = process.env.ADMIN_TOKEN;

describe('Project tests', function () {
  this.timeout(config.timeout);

  let userCreated;
  let chainID;

  before(function* () {
    // decode and create new account
    const decodedToken = jwtDecode(accessToken);
    const userEmail = decodedToken['email'];
    userCreated = yield utils.createUser(accessToken, userEmail);

    const chain = {
      label: 'test airline',
      src: 'contract Governance { }',
      args: {},
      members: [
        {
          address: userCreated.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        }
      ],
      balances: [
        {
          address: userCreated.address,
          balance: 1000000000000000000000000
        }
      ]
    }

    chainID = yield rest.createChain(chain.label, chain.members, chain.balances, chain.src, chain.args);
  });

  /**
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

    }
    */

  it('Create Contract', function* () {
    const name = util.uid('Project ? % # ');
    const buyer = 'Buyer1 ? % # ';
    const description = 'description ? % # ';
    const spec = 'spec ? % # ';
    const price = 1234;

    const created = new Date().getTime();
    const targetDelivery = created + 3 * 24 * 60 * 60 * 1000; // 3 days

    const addressStreet = 'addressStreet';
    const addressCity = 'addressCity';
    const addressState = 'addressState';
    const addressZip = 'addressZip';

    const args = {
      _name: name,
      _buyer: buyer,
      _description: description,
      _spec: spec,
      _price: price,

      _created: created,
      _targetDelivery: targetDelivery,

      // _addressStreet: addressStreet,
      // _addressCity: addressCity,
      // _addressState: addressState,
      // _addressZip: addressZip,
    };

    const contract = yield projectJs.uploadContract(accessToken, args, chainID);
    // state
    {
      const project = yield contract.getState(chainID);
      assert.equal(project.name, name, 'name');
      assert.equal(project.buyer, buyer, 'buyer');
      assert.equal(project.description, description, 'description');
      assert.equal(project.spec, spec, 'spec');
      assert.equal(project.price, price, 'price');
      assert.equal(project.created, created, 'created');
      assert.equal(project.targetDelivery, targetDelivery, 'targetDelivery');
    }
    // query
    {
      const project = yield projectJs.getProjectByName(name, chainID);
      assert.equal(project.name, name, 'name');
      assert.equal(project.buyer, buyer, 'buyer');
      assert.equal(project.description, description, 'description');
      assert.equal(project.spec, spec, 'spec');
      assert.equal(project.price, price, 'price');
      assert.equal(project.created, created, 'created');
      assert.equal(project.targetDelivery, targetDelivery, 'targetDelivery');
    }

  });
});
