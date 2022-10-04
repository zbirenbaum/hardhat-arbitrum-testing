import { JsonRpcSigner, JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from 'ethers';
import '@nomiclabs/hardhat-ethers';
import { Contract } from 'ethers';
import {
  getDefaultAccount,
  getProvider,
  getTokenInfo,
  createContract,
} from './utils/util';
import hre = require('hardhat');
const { ethers } = hre;

const fundWalletWithEth = async(from: Wallet, to: JsonRpcSigner, amount=1) => {
  console.log('Funding wallet with Eth');
  await from.sendTransaction({
    to: to._address,
    value: ethers.utils.parseEther(amount.toString()),
  });
}

const impersonateAccount = async (address: string, provider: JsonRpcProvider) => {
  await hre.network.provider.request({
    method: 'hardhat_impersonateAccount',
    params: [ address ]
  });
  return await provider.getSigner(address);
}

export const fundImpersonatedAccount = async (spender: Wallet, reciever: JsonRpcSigner, provider: JsonRpcProvider) => {
  console.log('Funding impersonated account with eth:')

  let balance = await provider.getBalance(reciever._address)
  console.log('Eth balance before funding: ', ethers.utils.formatEther(balance))

  await fundWalletWithEth(spender, reciever, 2000);

  balance = await provider.getBalance(reciever._address)
  console.log('Eth balance after funding: ', ethers.utils.formatEther(balance))
}

const tests: { [index: string]: (account: JsonRpcSigner, tTokenContract: Contract, uTokenContract: Contract) => Promise<void> } = {
  mint: async (
    account: JsonRpcSigner,
    tTokenContract: Contract,
    uTokenContract: Contract
  ) => {
    await uTokenContract.approve(tTokenContract.address, 100)
    await tTokenContract.mint(100);
  },
  redeemUnderlying: async (
    account: JsonRpcSigner,
    tTokenContract: Contract,
    uTokenContract: Contract
  ) => {
    await uTokenContract.approve(tTokenContract.address, 100);
    await tTokenContract.redeemUnderlying(100);
  },
}

const runTest = async (testName: string, account: JsonRpcSigner, uTokenContract: Contract, tTokenContract: Contract) => {
  console.log(`\nStarting ${testName} Test:`)
  let uBalance = Number(await uTokenContract.balanceOf(account._address))
  console.log(`  uToken balance before ${testName}:`, uBalance)
  let tBalance = Number(await tTokenContract.balanceOf(account._address))
  console.log(`  tToken balance before ${testName}:`, tBalance)

  // execute test
  await tests[testName](account, tTokenContract, uTokenContract);

  uBalance = Number(await uTokenContract.balanceOf(account._address))
  console.log(`  uToken balance after ${testName}:`, uBalance)
  tBalance = Number(await tTokenContract.balanceOf(account._address))
  console.log(`  tToken balance after ${testName}:`, tBalance)
}

const testToken = async (tTokenName: string, impersonateAddress: string) => {
  // await initHardhatFork();
  const tTokenInfo = getTokenInfo(tTokenName);
  const uTokenInfo = tTokenInfo.underlying;

  const provider = await getProvider('http://localhost:8545');
  console.log('Impersonating Account: ', impersonateAddress, '\n')

  const wallet = await impersonateAccount(impersonateAddress, provider);
  const ethAccount = await getDefaultAccount(provider);
  await fundImpersonatedAccount(ethAccount, wallet, provider);

  console.log('Initializing Token Contracts', '\n')
  const tTokenContract = await createContract(tTokenInfo, wallet)
  const uTokenContract = await createContract(uTokenInfo, wallet)
  for (const testName in tests) {
    await runTest(testName, wallet, uTokenContract, tTokenContract);
  }
}
testToken('tusdc', '0xf66468Ed50D9d635964DaEfa1AC3901A6faa4220');
