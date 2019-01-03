require('co-mocha');
const ba = require('blockapps-rest');
const util = ba.common.util;
const common = ba.common;
const assert = ba.common.assert;
const config = common.config;
const rest = ba.rest6;

const dappJs = require('../../../server/dapp/dapp');
const poster = require('../../poster');
const utils = require('../../../server/utils');

const userAccessToken1 = process.env.USER_ACCESS_TOKEN_1;
const userAccessToken2 = process.env.USER_ACCESS_TOKEN_2;

describe("Projects MultiChain Test", function () {
  this.timeout(config.timeout);

  let firstChainId, secoundChainId;
  let firstProjectArgs, secoundProjectArgs;

  before(function* () {
    // decode and create new account
    const userEmail1 = utils.getEmailIdFromToken(userAccessToken1);
    stratoUser1 = yield utils.createUser(userAccessToken1, userEmail1);

    // decode and create new account
    const userEmail2 = utils.getEmailIdFromToken(userAccessToken2);
    stratoUser2 = yield utils.createUser(userAccessToken2, userEmail2);

    const chain = {
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
          balance: 1000000000000000000000000
        },
        {
          address: stratoUser2.address,
          balance: 1000000000000000000000000
        }
      ]
    }

    const chain1 = {
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
          balance: 1000000000000000000000000
        },
        {
          address: stratoUser2.address,
          balance: 1000000000000000000000000
        }
      ]
    }

    firstChainId = yield rest.createChain(chain.label, chain.members, chain.balances, chain.src, chain.args);
    secoundChainId = yield rest.createChain(chain1.label, chain1.members, chain1.balances, chain1.src, chain1.args);

    // NOTE: This will carry mockdata of chains and user
    config.deployFilename = `./tests/mock/chainsMock.deploy.yaml`;

    const dapp = yield dappJs.uploadContract(userAccessToken1, config.libPath, firstChainId);
    yield dapp.deploy(config.dataFilename, config.deployFilename, firstChainId);

    const dapp1 = yield dappJs.uploadContract(userAccessToken2, config.libPath, secoundChainId);
    yield dapp1.deploy(config.dataFilename, config.deployFilename, secoundChainId);

    // Create local users
    yield dapp.createUser({ address: stratoUser1.address, role: 'SUPPLIER' }, firstChainId);
    yield dapp.createUser({ address: stratoUser2.address, role: 'BUYER' }, firstChainId);

    // Create local users
    yield dapp1.createUser({ address: stratoUser1.address, role: 'SUPPLIER' }, secoundChainId);
    yield dapp1.createUser({ address: stratoUser2.address, role: 'BUYER' }, secoundChainId);
  });

  it('should create a project (on first chain)', function* () {
    this.timeout(config.timeout);
    const uid = util.uid();
    firstProjectArgs = createProjectArgs(uid, firstChainId);

    const url = `/projects`;
    const response = yield poster.post(url, firstProjectArgs, userAccessToken1)

    const project = response.project;
    assert.isDefined(project, 'should return new project');
    assert.equal(project.name, firstProjectArgs.name, 'new project should contain name');
    assert.equal(project.buyer, firstProjectArgs.buyer, 'new project should contain buyer');
    assert.equal(project.description, firstProjectArgs.description, 'project desc should be same as in request');
    assert.equal(project.spec, firstProjectArgs.spec, 'project spec should be same as in request');

  });

  it('should create a project (on secound chain)', function* () {
    this.timeout(config.timeout);

    const uid = util.uid();
    secoundProjectArgs = createProjectArgs(uid, secoundChainId);

    const url = `/projects`;
    const response = yield poster.post(url, secoundProjectArgs, userAccessToken2);

    const project = response.project;
    assert.isDefined(project, 'should return new project');
    assert.equal(project.name, secoundProjectArgs.name, 'new project should contain name');
    assert.equal(project.buyer, secoundProjectArgs.buyer, 'new project should contain buyer');
    assert.equal(project.description, secoundProjectArgs.description, 'project desc should be same as in request');
    assert.equal(project.spec, secoundProjectArgs.spec, 'project spec should be same as in request');

  });

  it('should check the projects are not same on multiple chain', function* () {
    this.timeout(config.timeout);

    const firstUrl = `/projects/${encodeURIComponent(firstProjectArgs.name)}?chainId=${firstChainId}`;
    const firstChainResponse = yield poster.get(firstUrl, userAccessToken1)

    const secoundUrl = `/projects/${encodeURIComponent(secoundProjectArgs.name)}?chainId=${secoundChainId}`;
    const secoundChainResponse = yield poster.get(secoundUrl, userAccessToken2)

    let firstChainProject = firstChainResponse.project;
    let secoundChainProject = secoundChainResponse.project;

    assert.isDefined(firstChainProject, 'should return project');
    assert.isDefined(secoundChainProject, 'should return project');

    assert.notEqual(firstChainProject.name, secoundChainProject.name);
    assert.notEqual(firstChainProject.chainId, secoundChainProject.chainId);
    assert.equal(firstChainProject.state, secoundChainProject.state);
  });

});

function createProjectArgs(uid, chainId) {
  const projectArgs = {
    name: 'Project_ ? ' + uid,
    buyer: 'Buyer1',
    description: 'description_ ? % ' + uid,
    spec: 'spec_ ? % ' + uid,
    price: 1234,
    created: new Date().getTime(),
    targetDelivery: new Date().getTime() + 3 * 24 * 60 * 60 * 1000, // 3 days
    chainId: chainId
  };

  return projectArgs;
}
