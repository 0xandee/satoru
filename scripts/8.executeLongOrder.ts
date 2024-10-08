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

// connect provider
const providerUrl = process.env.PROVIDER_URL
const provider = new RpcProvider({ nodeUrl: providerUrl! })
// connect your account. To adapt to your own account :
const privateKey0: string = process.env.ACCOUNT_PRIVATE as string
const account0Address: string = process.env.ACCOUNT_PUBLIC as string
const account0 = new Account(provider, account0Address!, privateKey0!)

async function getDataStoreContract() {
    // read abi of DataStore contract
    const { abi: dataStoreAbi } = await provider.getClassAt(contractAddresses['DataStore']);
    if (dataStoreAbi === undefined) { throw new Error("no abi.") };
    const dataStoreContract = new Contract(dataStoreAbi, contractAddresses['DataStore'], provider);
    return dataStoreContract;
}

// Read account order keys count
export async function getAccountOrderCount(accountAddress: string) {
    const dataStoreContract = await getDataStoreContract();
    const accountOrderCount = await dataStoreContract.get_account_order_count(accountAddress);
    return Number(accountOrderCount);
}

// Get all account order keys
export async function getAccountOrderKeys(accountAddress: string) {
    const dataStoreContract = await getDataStoreContract();
    const accountOrderCount = await getAccountOrderCount(accountAddress);
    console.log("Account Order Count:", accountOrderCount)
    const accountOrderKeys = await dataStoreContract.get_account_order_keys(accountAddress, 0, Number(accountOrderCount));
    return accountOrderKeys;
}

// Get latest account order key
export async function getAccountLatestOrderKeys(accountAddress: string) {
    const accountOrderKeys = await getAccountOrderKeys(accountAddress);
    return accountOrderKeys[accountOrderKeys.length - 1];
}


async function execute_ordeer() {
    const key = await getAccountLatestOrderKeys(account0Address);

    const compiledOrderHandlerSierra = json.parse(fs.readFileSync("./target/dev/satoru_OrderHandler.contract_class.json").toString("ascii"))

    const orderHandlerContract = new Contract(compiledOrderHandlerSierra.abi, contractAddresses['OrderHandler'] as string, provider);

    const compiledRoleStoreSierra = json.parse(fs.readFileSync("./target/dev/satoru_RoleStore.contract_class.json").toString("ascii"))
    const roleStoreContract = new Contract(compiledRoleStoreSierra.abi, contractAddresses['RoleStore'] as string, provider)
    roleStoreContract.connect(account0);

    // const compiledDataStoreSierra = json.parse(fs.readFileSync( "./target/dev/satoru_DataStore.contract_class.json").toString( "ascii"))
    // const dataStoreContract = new Contract(compiledDataStoreSierra.abi, contractAddresses.DataStore as string, provider)
    // dataStoreContract.connect(account0)
    // const dataCall8 = dataStoreContract.populate(
    //     "remove_position",
    //     [
    //         "0x5985ad845114a848d9cffdf9124a029e1d3fe1e704ed8230e42872f80f88cd1",
    //         "0x4eaaccd6d2a2d9d1c0404cd2fea8485d62b437415948309736fdfd2542aee3"
    //     ]
    // )
    // const setAddressTx8 = await dataStoreContract.remove_position(dataCall8.calldata)
    // await provider.waitForTransaction(setAddressTx8.transaction_hash)

    const current_block = await provider.getBlockNumber();
    const current_block_data = await provider.getBlock(current_block);
    const block0 = 0;
    const block1 = current_block - 1;

    const setPricesParams = {
        signer_info: 1,
        tokens: [contractAddresses['ETH'], contractAddresses['USDT']],
        compacted_min_oracle_block_numbers: [block0, block0],
        compacted_max_oracle_block_numbers: [block1, block1],
        compacted_oracle_timestamps: [current_block_data.timestamp, current_block_data.timestamp],
        compacted_decimals: [18, 6],
        compacted_min_prices: [2700, 1], // 500000, 10000 compacted
        compacted_min_prices_indexes: [0],
        compacted_max_prices: [2700, 1], // 500000, 10000 compacted
        compacted_max_prices_indexes: [0],
        signatures: [
            ['signatures1', 'signatures2'], ['signatures1', 'signatures2']
        ],
        price_feed_tokens: []
    };

    orderHandlerContract.connect(account0)

    const executeOrderCall = orderHandlerContract.populate("execute_order", [
        key,
        setPricesParams
    ])
    let tx = await orderHandlerContract.execute_order(executeOrderCall.calldata)
    console.log("Order executed: https://sepolia.starkscan.co/tx/" + tx.transaction_hash);
}

execute_ordeer()