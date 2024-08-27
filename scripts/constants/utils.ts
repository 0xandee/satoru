import { Account, AllowArray, Call, RpcProvider } from "starknet";
import dotenv from 'dotenv'
dotenv.config()
const providerUrl = process.env.PROVIDER_URL
const provider = new RpcProvider({ nodeUrl: providerUrl! })
const account0Address: string = process.env.ACCOUNT_PUBLIC as string
const privateKey0: string = process.env.ACCOUNT_PRIVATE as string
const account = new Account(provider, account0Address!, privateKey0!)

export async function tryInvoke(functionName: string, calldata: Call[]) {
   try {
      console.log(`\x1b[32m🚀 INVOKE ${functionName}...`);
      const txCall = await account.execute(calldata);
      console.log(`\x1b[32m✅ https://sepolia.starkscan.co/tx/` + txCall.transaction_hash);
      await provider.waitForTransaction(txCall.transaction_hash);
   } catch (e) {
      console.log(`\x1b[31m❌ ERROR ${functionName}: \n`, e);
   } finally {
      // Reset the console color
      console.log('\x1b[0m');
   }
}

export const sleep = (seconds: number) => {
   return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}