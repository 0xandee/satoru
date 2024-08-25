import { Account, Contract, json, Calldata, CallData, RpcProvider, shortString, uint256, CairoCustomEnum, ec } from "starknet"
import fs from 'fs'
import dotenv from 'dotenv'
import path from 'path';
import { tryInvoke } from "./constants/utils";

const contractAddressesPath = path.join(__dirname, 'constants', 'contractAddresses.json');
const contractAddresses = JSON.parse(fs.readFileSync(contractAddressesPath, 'utf8'));
const ETH = contractAddresses['ETH'];
const BTC = contractAddresses['BTC'];
const USDT = contractAddresses['USDT'];

dotenv.config()

async function create_market() {
    // connect provider
    const providerUrl = process.env.PROVIDER_URL
    const provider = new RpcProvider({ nodeUrl: providerUrl! })
    // connect your account. To adapt to your own account :
    const privateKey0: string = process.env.ACCOUNT_PRIVATE as string
    const account0Address: string = process.env.ACCOUNT_PUBLIC as string
    const account0 = new Account(provider, account0Address!, privateKey0!)

    const marketFactoryAddress = contractAddresses['MarketFactory'];
    const compiledMarketFactorySierra = json.parse(fs.readFileSync("./target/dev/satoru_MarketFactory.contract_class.json").toString("ascii"))
    const abi = compiledMarketFactorySierra.abi
    const marketFactoryContract = new Contract(abi, marketFactoryAddress, provider);
    marketFactoryContract.connect(account0)

    console.log("Creating ETH-USDT and BTC-USDT Markets...")
    const myCall = marketFactoryContract.populate("create_market", [
        ETH,
        ETH,
        USDT,
        "market_type"
    ]);
    const res = await marketFactoryContract.create_market(myCall.calldata);
    const marketTokenAddress = (await provider.waitForTransaction(res.transaction_hash) as any).events[0].data[1];

    const myCall1 = marketFactoryContract.populate("create_market", [
        BTC,
        BTC,
        USDT,
        "market_type"
    ]);
    const res1 = await marketFactoryContract.create_market(myCall1.calldata);
    const marketTokenAddress1 = (await provider.waitForTransaction(res1.transaction_hash) as any).events[0].data[1];

    contractAddresses.ETHUSDTMarketToken = marketTokenAddress;
    fs.writeFileSync(contractAddressesPath, JSON.stringify(contractAddresses, null, 4), 'utf8');

    contractAddresses.BTCUSDTMarketToken = marketTokenAddress1;
    fs.writeFileSync(contractAddressesPath, JSON.stringify(contractAddresses, null, 4), 'utf8');

    console.log('Markets created ✅')
}

create_market()