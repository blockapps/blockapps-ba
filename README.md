Blockapps BA
------------
[![BlockApps logo](http://blockapps.net/img/logo_cropped.png)](http://blockapps.net)

### Supply Chain Demo App
This demo app uses STRATO blockchain platform and Smart Contracts to demonstrate a solution for a basic 2-party Supply Chain Workflow.

![Alt text](SupplyChain-Workflow.png?raw=true "Supply Chain Workflow")

![Alt text](Demo_Application_Stack.png?raw=true "Demo Application Stack")

![Alt text](Production_Architecture.png?raw=true "Production Architecture")

### Pre Requisites

Node v7.2 or more recent.

This application requires a [BlockApps Strato](http://blockapps.net/blockapps-strato-blockchain-application-development/) node. Follow the instruction in the [Strato getting started guide](https://github.com/blockapps/strato-getting-started) to install a local instance.

Once you have a functional strato node, you can clone this project and deploy it to the strato instance using the instructions below.

### Dependencies


Install the dependencies

```
npm i
```

Install the UI dependencies

```
cd ui
npm i
```

### Deployment

If you are deploying using STRATO on `localhost` (Linux and Mac users only):
Run the following from the **project root**:
```
npm run deploy
```

If you are deploying using STRATO on the remote server:
Make sure there is a config file under `./server/config` with the naming convention `<server-name>.config.yaml`. The contents of the file should be as follows:

```
apiDebug: true
password: '1234'
timeout: 600000
libPath: ./server/lib
contractsPath: ./contracts/
dataFilename: ./server/dapp/dapp.presets.yaml
deployFilename: ./server/config/<server-name>.deploy.yaml

# WARNING - extra strict syntax
# DO NOT change the nodes order
# node 0 is the default url for all single node api calls
nodes:
  - id: 0
    explorerUrl: 'http://<your-ip-or-dns>:9000'
    stratoUrl: 'http://<your-ip-or-dns>/strato-api'
    blocUrl: 'http://<your-ip-or-dns>/bloc/v2.1'
    searchUrl: 'http://<your-ip-or-dns>/cirrus'
```

Replace <server-name> with your actual server name in the above file and then run the following from the **project root**:

```
SERVER=<server-name> npm run deploy
```
**On Windows:**
```
set "SERVER=<server-name>" & npm run deploy-windows
```

### Launch the API

from the **project root** (Linux, Mac and Windows):

```
npm run start
```

### Launch the UI
If you are deploying using STRATO on `localhost` (Linux and Mac users only):
```
cd ui
npm run start
```
If you are deploying using STRATO on the remote server:
```
cd ui
API_URL="<api-server-url>" npm run start
```
On Windows:
```
cd ui
set "REACT_APP_API_URL=<api-server-url>" & set "PORT=3030" & npm run start-windows
```
where `<api-server-url>` - broadcasted API URL in format http://url:port (e.g. http://example.com:3031)

### Testing

```
npm run test
```
On Windows:
```
set "SERVER=<server-name>" & npm run test-windows
```
<!--MKDOCS_DOC_DIVIDER_USAGE-->
## Using the Blockapps Supply Chain Demo App

Open the app in the browser.

By default, application is running at http://localhost:3030/

### Logins for the app
The app comes pre loaded with four different users: `Buyer1`, `Buyer2`, `Supplier1`, `Supplier2`. All these users have the same password: `1234`.

### Bidding Flow Guide

- Buyer Logs in
![Bidding1](http://i.imgur.com/kKVZkZO.gif)

-Buyer creates a project for suppliers to bid on
![Bidding2](http://i.imgur.com/xADXnrX.gif)

-Supplier logs in
![Bidding3](http://i.imgur.com/jNke2we.gif)

-Supplier makes a bid on the earlier project
![Bidding4](http://i.imgur.com/4msxzoR.gif)

-Buyer accepts early supplier bid
![Bidding5](http://i.imgur.com/WmK3lO4.gif)

Note: After the buyer accepts the bid, 20 dollars from the buyer's account is taken and held by the smart contract but is still not disbursed until the product is accepted

-Supplier marks that the product is shipped
![Bidding6](http://i.imgur.com/qYSeMAk.gif)

-Buyer confirms that they recieved the product
![Bidding7](http://i.imgur.com/xD5g7dE.gif)


<!--![Bidding](http://i.imgur.com/3GdKBMj.gif)


![Bidding2](http://i.imgur.com/rQF6oK6.gif)


![Bidding3](http://i.imgur.com/RnCXrSO.gif)


![Bidding4](http://i.imgur.com/54TVkKh.gif)-->
