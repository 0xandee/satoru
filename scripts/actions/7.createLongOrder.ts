import { Account, Contract, json, Calldata, CallData, RpcProvider, shortString, uint256, CairoCustomEnum, ec } from "starknet"
import fs from 'fs'
import dotenv from 'dotenv'
import path from 'path';
import { tryInvoke } from "./constants/utils";

const contractAddressesPath = path.join(__dirname, 'constants', 'contractAddresses.json');
const contractAddresses = JSON.parse(fs.readFileSync(contractAddressesPath, 'utf8'));

dotenv.config()

async function create_order() {
    // connect provider
    const providerUrl = process.env.PROVIDER_URL
    const provider = new RpcProvider({ nodeUrl: providerUrl! })
    // connect your account. To adapt to your own account :
    const privateKey0: string = process.env.ACCOUNT_PRIVATE as string
    const account0Address: string = process.env.ACCOUNT_PUBLIC as string
    const marketTokenAddress = contractAddresses['ETHUSDTMarketToken']
    const eth: string = contractAddresses['ETH']
    const usdt: string = contractAddresses['USDT']
    const account0 = new Account(provider, account0Address!, privateKey0!)
    const createOrderCalls: Array<{ contractAddress: string, entrypoint: string, calldata: any[] }> = [
        {
            contractAddress: eth,
            entrypoint: "transfer",
            calldata: [contractAddresses['OrderVault'] as string, uint256.bnToUint256(1000000000000000n)]
        },
        {
            contractAddress: contractAddresses['OrderHandler'] as string,
            entrypoint: "create_order",
            calldata: [
                account0.address,
                {
                    receiver: account0.address,
                    callback_contract: 0,
                    ui_fee_receiver: 0,
                    market: marketTokenAddress,
                    initial_collateral_token: eth,
                    swap_path: [],
                    size_delta_usd: uint256.bnToUint256(10000000000000000000000n),
                    initial_collateral_delta_amount: uint256.bnToUint256(2000000000000000000n),
                    trigger_price: uint256.bnToUint256(5000),
                    acceptable_price: uint256.bnToUint256(5500),
                    execution_fee: uint256.bnToUint256(0),
                    callback_gas_limit: uint256.bnToUint256(0),
                    min_output_amount: uint256.bnToUint256(0),
                    order_type: new CairoCustomEnum({ MarketIncrease: {} }),
                    decrease_position_swap_type: new CairoCustomEnum({ NoSwap: {} }),
                    is_long: 1,
                    referral_code: 0
                }
            ]
        }
    ]

    await tryInvoke("Create Order", createOrderCalls);
}

create_order()