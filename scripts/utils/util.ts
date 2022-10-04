import { Token, BaseToken } from '../../types/types';
import { JsonRpcProvider } from '@ethersproject/providers';
import { JsonRpcSigner } from '@ethersproject/providers';
import { TokenInfo } from '../../types/types';
import { readFileSync } from 'fs';
import axios, { AxiosResponse } from 'axios';
import { join } from 'path';
import hre = require('hardhat');
import dotenv = require('dotenv');
dotenv.config();
const { ethers  } = hre;

const arbiscanKey = process.env.ARBISCAN_KEY;
const arbiscanUrl = 'https://api.arbiscan.io/api?module=contract&action=getabi&apikey=' + arbiscanKey + '&address=';

const tokenInfoMap: TokenInfo = {
  tusdc: {
    address: '0x0BdF3cb0D390ce8d8ccb6839b1CfE2953983b5f1',
    implementation: '0x8765B2266ebCd935c8c781d93F2e3BFA0da34c6e',
    underlying: {
      address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
      implementation: '0x1eFB3f88Bc88f03FD1804A5C53b7141bbEf5dED8'
    },
  }
}

export const getTokenInfo = (tokenName: string) => {
  return tokenInfoMap[tokenName];
}

export const getProvider = async (providerUrl: string) => {
  return await new ethers.providers.JsonRpcProvider(providerUrl);
};

export const getDefaultAccount= async (provider: JsonRpcProvider) => {
  const privKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
  const account = new ethers.Wallet(privKey, provider);
  const balance = ethers.utils.formatEther(await account.getBalance());
  console.log('Wallet Balance: ' + balance.toString());
  return account;
}

export const getDeployments = () => {
  const deploymentPath = join(__dirname, '../../deployments.json')
  return JSON.parse(readFileSync(deploymentPath, 'utf8'));
}

export const getContractAbi = async (address: string) => {
  const url = arbiscanUrl + address;
  const response: AxiosResponse = await axios.get(url);
  try {
    return JSON.parse(response.data.result);
  } catch (e) {
    console.error(e);
  }
};


export const createContract = async (tokenInfo: Token | BaseToken<Token>, signer: JsonRpcSigner, tokenContractAbi="") => {
  const tokenAddress = tokenInfo.address;
  if (tokenContractAbi == "") {
    tokenContractAbi = await getContractAbi(tokenInfo.implementation);
  }
  return new ethers.Contract(tokenAddress, tokenContractAbi, signer);
}


