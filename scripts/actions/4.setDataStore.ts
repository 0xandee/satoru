import { Account, AllowArray, Call, Contract, num, RpcProvider } from "starknet";
import * as dataStoreKeys from "./constants/dataStoreKeys";
import { markets_config } from "./constants/market-config-data";
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path';
import { tryInvoke } from "./constants/utils";

const contractAddressesPath = path.join(__dirname, 'constants', 'contractAddresses.json');
const contractAddresses = JSON.parse(fs.readFileSync(contractAddressesPath, 'utf8'));

dotenv.config()

// connect provider
const providerUrl = process.env.PROVIDER_URL
const provider = new RpcProvider({ nodeUrl: providerUrl! })
// connect your account. To adapt to your own account :
const privateKey0: string = process.env.ACCOUNT_PRIVATE as string
const account0Address: string = process.env.ACCOUNT_PUBLIC as string
const account = new Account(provider, account0Address!, privateKey0!)

async function getReaderContract() {
   // read abi of DataStore contract
   const { abi: readerAbi } = await account.getClassAt(contractAddresses['Reader']);
   if (readerAbi === undefined) { throw new Error("no abi.") };
   const readerContract = new Contract(readerAbi, contractAddresses['Reader'], account);
   return readerContract;
}

async function getDataStoreContract() {
   // read abi of DataStore contract
   const { abi: dataStoreAbi } = await account.getClassAt(contractAddresses['DataStore']);
   if (dataStoreAbi === undefined) { throw new Error("no abi.") };
   const dataStoreContract = new Contract(dataStoreAbi, contractAddresses['DataStore'], account);
   return dataStoreContract;
}

/// Create a new market.
export async function setDataStore(

) {
   const dataStore = await getDataStoreContract();
   const reader = await getReaderContract();
   const market = contractAddresses['BTCUSDTMarketToken'];
   const tokensInMarket = await reader.functions.get_market({
      contract_address: dataStore.address
   }, market);
   const index_token = num.toHex(tokensInMarket.index_token);
   const long_token = num.toHex(tokensInMarket.long_token);
   const short_token = num.toHex(tokensInMarket.short_token);

   const configData = markets_config[market];

   const setDataStoreCalls: Array<{ contractAddress: string, entrypoint: string, calldata: any[] }> = [];

   const virtualTokenIdForIndexTokenKey = dataStoreKeys.virtualTokenIdKey(configData.virtualTokenIdForIndexToken);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_felt252",
      calldata: [virtualTokenIdForIndexTokenKey, configData.virtualTokenIdForIndexToken]
   });
   const virtualTokenIdForMarketToken = dataStoreKeys.virtualMarketIdKey(configData.virtualTokenIdForIndexToken);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_felt252",
      calldata: [virtualTokenIdForMarketToken, configData.virtualMarketId]
   });

   // minPositionImpactPoolAmount
   const minPositionImpactPoolAmountKey = dataStoreKeys.minPositionImpactPoolAmountKey(market);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [minPositionImpactPoolAmountKey, configData.minPositionImpactPoolAmount.toBigInt(), "0"]
   });

   // // positionImpactPoolDistributionRate
   // const minPositionImpactPoolAmountRateCalls: Call[] = []
   // const positionImpactPoolDistributionRateKey = dataStoreKeys.positionImpactPoolDistributionRateKey(market);
   // minPositionImpactPoolAmountRateCalls.push({
   //    contractAddress: dataStore.address,
   //    entrypoint: "set_u256",
   //    calldata: [positionImpactPoolDistributionRateKey, configData.positionImpactPoolDistributionRate.toBigInt(), "0"]
   // });
   // await tryInvoke("minPositionImpactPoolAmountRateCalls", minPositionImpactPoolAmountRateCalls);

   // maxLongTokenPoolAmount
   const maxLongTokenPoolAmountKey = dataStoreKeys.maxPoolAmountKey(market, long_token);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [maxLongTokenPoolAmountKey, configData.maxLongTokenPoolAmount.toBigInt(), "0"]
   });

   // maxShortTokenPoolAmount
   const maxShortTokenPoolAmountKey = dataStoreKeys.maxPoolAmountKey(market, short_token);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [maxShortTokenPoolAmountKey, configData.maxShortTokenPoolAmount.toBigInt(), "0"]
   });

   // maxLongTokenPoolAmountForDeposit => maxPoolAmountForDepositKey()
   const maxLongTokenPoolAmountForDepositKey = dataStoreKeys.maxPoolAmountForDepositKey(market, long_token);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [maxLongTokenPoolAmountForDepositKey, configData.maxLongTokenPoolAmountForDeposit.toBigInt(), "0"]
   });
   // maxShortTokenPoolAmountForDeposit => maxPoolAmountForDepositKey()
   const maxShortTokenPoolAmountForDepositKey = dataStoreKeys.maxPoolAmountForDepositKey(market, short_token);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [maxShortTokenPoolAmountForDepositKey, configData.maxShortTokenPoolAmountForDeposit.toBigInt(), "0"]
   });

   // negativePositionImpactFactor
   const negativePositionImpactFactorKey = dataStoreKeys.positionImpactFactorKey(market, false);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [negativePositionImpactFactorKey, configData.negativePositionImpactFactor.toBigInt(), "0"]
   });

   // positivePositionImpactFactor
   const positivePositionImpactFactorKey = dataStoreKeys.positionImpactFactorKey(market, false);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [positivePositionImpactFactorKey, configData.positivePositionImpactFactor.toBigInt(), "0"]
   });

   // minCollateralFactorForOpenInterestMultiplierLong
   const minCollateralFactorForOpenInterestMultiplierLongKey = dataStoreKeys.minCollateralFactorForOpenInterest(market, true);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [minCollateralFactorForOpenInterestMultiplierLongKey, configData.minCollateralFactorForOpenInterestMultiplierLong.toBigInt(), "0"]
   });

   // minCollateralFactorForOpenInterestMultiplierShort
   const minCollateralFactorForOpenInterestMultiplierShortKey = dataStoreKeys.minCollateralFactorForOpenInterest(market, false);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [minCollateralFactorForOpenInterestMultiplierShortKey, configData.minCollateralFactorForOpenInterestMultiplierShort.toBigInt(), "0"]
   });

   // negativeSwapImpactFactor
   const negativeSwapImpactFactorKey = dataStoreKeys.swapImpactFactorKey(market, false);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [negativeSwapImpactFactorKey, configData.negativeSwapImpactFactor.toBigInt(), "0"]
   });

   // positiveSwapImpactFactor
   const positiveSwapImpactFactorKey = dataStoreKeys.swapImpactFactorKey(market, true);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [positiveSwapImpactFactorKey, configData.positiveSwapImpactFactor.toBigInt(), "0"]
   });

   // maxOpenInterestForLongs
   const maxOpenInterestForLongsKey = dataStoreKeys.maxOpenInterestKey(market, true);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [maxOpenInterestForLongsKey, configData.maxOpenInterestForLongs.toBigInt(), "0"]
   });

   // maxOpenInterestForShorts
   const maxOpenInterestForShortsKey = dataStoreKeys.maxOpenInterestKey(market, false);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [maxOpenInterestForShortsKey, configData.maxOpenInterestForShorts.toBigInt(), "0"]
   });

   // fundingIncreaseFactorPerSecond
   const fundingIncreaseFactorPerSecondKey = dataStoreKeys.fundingIncreaseFactorPerSecondKey(market);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [fundingIncreaseFactorPerSecondKey, configData.fundingIncreaseFactorPerSecond.toBigInt(), "0"]
   });

   // fundingDecreaseFactorPerSecond
   const fundingDecreaseFactorPerSecondKey = dataStoreKeys.fundingDecreaseFactorPerSecondKey(market);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [fundingDecreaseFactorPerSecondKey, configData.fundingDecreaseFactorPerSecond.toBigInt(), "0"]
   });

   // minFundingFactorPerSecond
   const minFundingFactorPerSecondKey = dataStoreKeys.minFundingFactorPerSecondKey(market);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [minFundingFactorPerSecondKey, configData.minFundingFactorPerSecond.toBigInt(), "0"]
   });

   // maxFundingFactorPerSecond
   const maxFundingFactorPerSecondKey = dataStoreKeys.maxFundingFactorPerSecondKey(market);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [maxFundingFactorPerSecondKey, configData.maxFundingFactorPerSecond.toBigInt(), "0"]
   });

   // thresholdForStableFunding
   const thresholdForStableFundingKey = dataStoreKeys.thresholdForStableFundingKey(market);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [thresholdForStableFundingKey, configData.thresholdForStableFunding.toBigInt(), "0"]
   });

   // thresholdForDecreaseFunding
   const thresholdForDecreaseFundingKey = dataStoreKeys.thresholdForDecreaseFundingKey(market);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [thresholdForDecreaseFundingKey, configData.thresholdForDecreaseFunding.toBigInt(), "0"]
   });

   // borrowingFactorForLongs
   const borrowingFactorForLongsKey = dataStoreKeys.borrowingFactorKey(market, true);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [borrowingFactorForLongsKey, configData.borrowingFactorForLongs.toBigInt(), "0"]
   });
   // borrowingFactorForShorts
   const borrowingFactorForShortsKey = dataStoreKeys.borrowingFactorKey(market, false);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [borrowingFactorForShortsKey, configData.borrowingFactorForShorts.toBigInt(), "0"]
   });

   // borrowingExponentFactorForLongs
   const borrowingExponentFactorForLongsKey = dataStoreKeys.borrowingExponentFactorKey(market, true);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [borrowingExponentFactorForLongsKey, configData.borrowingExponentFactorForLongs.toBigInt(), "0"]
   });
   // borrowingExponentFactorForShorts
   const borrowingExponentFactorForShortsKey = dataStoreKeys.borrowingExponentFactorKey(market, false);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [borrowingExponentFactorForShortsKey, configData.borrowingExponentFactorForShorts.toBigInt(), "0"]
   });

   // reserveFactorLongs
   const reserveFactorLongsKey = dataStoreKeys.reserveFactorKey(market, true);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [reserveFactorLongsKey, configData.reserveFactorLongs.toBigInt(), "0"]
   });

   // reserveFactorShorts
   const reserveFactorShortsKey = dataStoreKeys.reserveFactorKey(market, false);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [reserveFactorShortsKey, configData.reserveFactorShorts.toBigInt(), "0"]
   });

   // openInterestReserveFactorLongs
   const openInterestReserveFactorLongsKey = dataStoreKeys.openInterestReserveFactorKey(market, true);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [openInterestReserveFactorLongsKey, configData.openInterestReserveFactorLongs.toBigInt(), "0"]
   });

   // openInterestReserveFactorShorts
   const openInterestReserveFactorShortsKey = dataStoreKeys.openInterestReserveFactorKey(market, false);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [openInterestReserveFactorShortsKey, configData.openInterestReserveFactorShorts.toBigInt(), "0"]
   });

   // maxPnlFactorForTradersLongs
   const maxPnlFactorForTradersLongsKey = dataStoreKeys.maxPnlFactorKey(dataStoreKeys.MAX_PNL_FACTOR_FOR_TRADERS_KEY, market, true);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [maxPnlFactorForTradersLongsKey, configData.maxPnlFactorForTradersLongs.toBigInt(), "0"]
   });

   // maxPnlFactorForTradersShorts
   const maxPnlFactorForTradersShortsKey = dataStoreKeys.maxPnlFactorKey(dataStoreKeys.MAX_PNL_FACTOR_FOR_TRADERS_KEY, market, false);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [maxPnlFactorForTradersShortsKey, configData.maxPnlFactorForTradersShorts.toBigInt(), "0"]
   });

   // maxPnlFactorForAdlLongs
   const maxPnlFactorForAdlLongsKey = dataStoreKeys.maxPnlFactorKey(dataStoreKeys.MAX_PNL_FACTOR_FOR_ADL, market, true);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [maxPnlFactorForAdlLongsKey, configData.maxPnlFactorForAdlLongs.toBigInt(), "0"]
   });

   // maxPnlFactorForAdlShorts
   const maxPnlFactorForAdlShortsKey = dataStoreKeys.maxPnlFactorKey(dataStoreKeys.MAX_PNL_FACTOR_FOR_ADL, market, false);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [maxPnlFactorForAdlShortsKey, configData.maxPnlFactorForAdlShorts.toBigInt(), "0"]
   });

   // minPnlFactorAfterAdlLongs
   const minPnlFactorAfterAdlLongsKey = dataStoreKeys.minPnlFactorAfterAdl(market, true);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [minPnlFactorAfterAdlLongsKey, configData.minPnlFactorAfterAdlLongs.toBigInt(), "0"]
   });

   // minPnlFactorAfterAdlShorts
   const minPnlFactorAfterAdlShortsKey = dataStoreKeys.minPnlFactorAfterAdl(market, false);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [minPnlFactorAfterAdlShortsKey, configData.minPnlFactorAfterAdlShorts.toBigInt(), "0"]
   });

   // maxPnlFactorForDepositsLongs
   const maxPnlFactorForDepositsLongsKey = dataStoreKeys.maxPnlFactorKey(dataStoreKeys.MAX_PNL_FACTOR_FOR_DEPOSITS_KEY, market, true);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [maxPnlFactorForDepositsLongsKey, configData.maxPnlFactorForDepositsLongs.toBigInt(), "0"]
   });

   // maxPnlFactorForDepositsShorts
   const maxPnlFactorForDepositsShortsKey = dataStoreKeys.maxPnlFactorKey(dataStoreKeys.MAX_PNL_FACTOR_FOR_DEPOSITS_KEY, market, false);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [maxPnlFactorForDepositsShortsKey, configData.maxPnlFactorForDepositsShorts.toBigInt(), "0"]
   });

   // maxPnlFactorForWithdrawalsLongs
   const maxPnlFactorForWithdrawalsLongsKey = dataStoreKeys.maxPnlFactorKey(dataStoreKeys.MAX_PNL_FACTOR_FOR_WITHDRAWALS_KEY, market, true);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [maxPnlFactorForWithdrawalsLongsKey, configData.maxPnlFactorForWithdrawalsLongs.toBigInt(), "0"]
   });

   // maxPnlFactorForWithdrawalsShorts
   const maxPnlFactorForWithdrawalsShortsKey = dataStoreKeys.maxPnlFactorKey(dataStoreKeys.MAX_PNL_FACTOR_FOR_WITHDRAWALS_KEY, market, false);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [maxPnlFactorForWithdrawalsShortsKey, configData.maxPnlFactorForWithdrawalsShorts.toBigInt(), "0"]
   });

   // positiveMaxPositionImpactFactor
   const positiveMaxPositionImpactFactorKey = dataStoreKeys.maxPositionImpactFactorKey(market, true);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [positiveMaxPositionImpactFactorKey, configData.positiveMaxPositionImpactFactor.toBigInt(), "0"]
   });

   // negativeMaxPositionImpactFactor
   const negativeMaxPositionImpactFactorKey = dataStoreKeys.maxPositionImpactFactorKey(market, false);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [negativeMaxPositionImpactFactorKey, configData.negativeMaxPositionImpactFactor.toBigInt(), "0"]
   });

   // maxPositionImpactFactorForLiquidations
   const maxPositionImpactFactorForLiquidationsKey = dataStoreKeys.maxPositionImpactFactorForLiquidationsKey(market);
   setDataStoreCalls.push({
      contractAddress: dataStore.address,
      entrypoint: "set_u256",
      calldata: [maxPositionImpactFactorForLiquidationsKey, configData.maxPositionImpactFactorForLiquidations.toBigInt(), "0"]
   });

   await tryInvoke("setDataStoreCalls", setDataStoreCalls);
}


(async () => {
   setDataStore();
})()