require('co-mocha');
const chai = require('chai');
const chaiHttp = require('chai-http');
const ba = require('blockapps-rest');
const common = ba.common;
const config = common.config;
const util = common.util;
const assert = ba.common.assert;
const poster = require('../poster');
const jwtDecode = require('jwt-decode');
const utils = require('../../server/utils');

const accessToken = process.env.ADMIN_TOKEN;
const accessToken1 = process.env.ADMIN_TOKEN1;

chai.use(chaiHttp);

describe("User Test", function () {
  this.timeout(config.timeout);

  let stratoUser1, stratoUser2, chain;

  before(function* () {
    this.timeout(config.timeout);

    // decode and create new account
    const decodedToken = jwtDecode(accessToken);
    const userEmail = decodedToken['email'];
    stratoUser1 = yield utils.createUser(accessToken, userEmail);

    // decode and create new account
    const decodedToken1 = jwtDecode(accessToken1);
    const userEmail1 = decodedToken1['email'];
    stratoUser2 = yield utils.createUser(accessToken1, userEmail1);

    chain = {
      label: `test airline ${util.uid()}`,
      src: 'contract Governance { }',
      args: {},
      members: [
        {
          address: stratoUser1.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        },
        {
          address: stratoUser2.address,
          enode: "enode://6d8a80d14311c39f35f516fa664deaaaa13e85b2f7493f37f6144d86991ec012937307647bd3b9a82abe2974e1407241d54947bbb39763a4cac9f77166ad92a0@171.16.0.4:30303?discport=30303"
        }
      ],
      balances: [
        {
          address: stratoUser1.address,
          balance: 100000000000000000000000000000000000000
        },
        {
          address: stratoUser2.address,
          balance: 100000000000000000000000000000000000000
        }
      ],
      users: [
        { address: stratoUser1.address, role: 'SUPPLIER' },
        { address: stratoUser2.address, role: 'BUYER' }
      ]
    }
    this.timeout(config.timeout);
  });

  it('should create chain and deploy contracts', function* () {
    this.timeout(config.timeout);
    const url = `/chains`;
    const response = yield poster.post(url, { chain }, accessToken);
    assert.equal(response, 'Chain Created Successfully', "chain and contracts must be deployed");
  });

  it('should return chain list', function* () {
    this.timeout(config.timeout);
    const url = `/chains`;
    const response = yield poster.get(url, accessToken);
    assert.isArray(response, "must be array");
  });

});
