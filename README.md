# Setup
Create a .env file in the root of the project with the following variables:
```
export ARBISCAN_KEY="your key here"
export INFURA_API_KEY="your key here"
```

```shell
yarn install
npm run compile
npx hardhat node #Start the server
npx hardhat run --network localhost scripts/deposit.js #Run the testing script
```
