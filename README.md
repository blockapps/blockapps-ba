# blockapps-ba

Blockapps BA
------------
[![BlockApps logo](http://blockapps.net/img/logo_cropped.png)](http://blockapps.net)

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

##### If you are deploying using STRATO on `localhost` (Linux and Mac users only):
Run the following from the **project root**:
```
npm run deploy
```

##### If you are deploying using STRATO on the remote server:
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
    blocUrl: 'http://<your-ip-or-dns>/bloc/'
    searchUrl: 'http://<your-ip-or-dns>/cirrus'
```

Replace <server-name> with your actual server name in the above file and then run the following from the **project root**:

```
SERVER=<server-name> npm run deploy
```
on Windows:
```
set "SERVER=<server-name>" & npm run deploy-windows
```

### Launch the API

from the **project root**:

```
npm run start
```

### Launch the UI
##### If you are deploying using STRATO on `localhost` (Linux and Mac users only):
```
cd ui
npm run start
```
##### If you are deploying using STRATO on the remote server:
```
cd ui
API_URL="<api-server-url>" npm run start
```
On Windows:
```
cd ui
set "REACT_APP_API_MOCK=<api-server-url>" & set "PORT=3030" & npm run start-windows
```
where <api-server-url> - broadcasted API URL in format http://url:port (e.g. http://example.com:3031)

### Testing

```
npm run test
```
On Windows:
```
set "SERVER=<server-name>" & npm run test-windows
```