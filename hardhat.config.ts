import '@nomicfoundation/hardhat-toolbox';
import { task } from "hardhat/config";
import { HardhatUserConfig } from 'hardhat/config';
import dotenv = require('dotenv');
dotenv.config();

import '@nomiclabs/hardhat-ethers'
import { TASK_NODE_SERVER_READY, } from "hardhat/builtin-tasks/task-names";
const INFURA_API_KEY = process.env.INFURA_API_KEY;
const jsonRpcUrl = `https://arbitrum-mainnet.infura.io/v3/${INFURA_API_KEY}`

const config: HardhatUserConfig = {
  defaultNetwork: "localhost",
  networks: {
    localhost: {
      forking: {
        url: jsonRpcUrl,
        enabled: true,
        ignoreUnknownTxType: true,
      }
    }
  },
  solidity: '0.8.9',
};

task(TASK_NODE_SERVER_READY).setAction(async (taskArgs, hre, runSuper) => {
  await hre.network.provider.request({
    method: 'hardhat_reset',
    params: [
      {
        forking: {
          jsonRpcUrl: jsonRpcUrl,
          enabled: true,
          ignoreUnknownTxType: true,
        },
      },
    ],
  })
  console.log('Set up forked network');
  runSuper(taskArgs);
});

export default config;
