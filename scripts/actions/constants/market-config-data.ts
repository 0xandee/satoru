import { } from "starknet";
import { num, ec } from "starknet";
import { BigNumber, BigNumberish, ethers } from "ethers";
const { starkCurve } = ec;
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path';

const contractAddressesPath = path.join(__dirname, 'contractAddresses.json');
const contractAddresses = JSON.parse(fs.readFileSync(contractAddressesPath, 'utf8'));
const ETH = contractAddresses['ETH'];
const BTC = contractAddresses['BTC'];
const USDT = contractAddresses['USDT'];

dotenv.config()

export function bigNumberify(n: any) {
    return ethers.BigNumber.from(n);
  }

function expandDecimals(n: any, decimals: any) {
    return bigNumberify(n).mul(bigNumberify(10).pow(decimals));
  }
  
function decimalToFloat(value: any, decimals = 0) {
    return expandDecimals(value, 30 - decimals);
  }

function hashSingleString(string: string) {
    let value: string = string;
    const isHex = num.isHex(string);
    if (!isHex) {
      // TODO: Khiem, please check string isLong
      // Can use: Buffer.from(string) instead
      value = "0x" + Buffer.from(string).toString("hex")
    }
  
    return num.toHex(starkCurve.poseidonHashMany([num.toBigInt(value)]))
  }

  
const baseMarketConfig = {
    minCollateralFactor: decimalToFloat(1, 2), // 1%

    minCollateralFactorForOpenInterestMultiplierLong: 0,
    minCollateralFactorForOpenInterestMultiplierShort: 0,

    maxLongTokenPoolAmount: expandDecimals(1_000_000_000, 18),
    maxShortTokenPoolAmount: expandDecimals(1_000_000_000, 18),

    maxLongTokenPoolAmountForDeposit: expandDecimals(1_000_000_000, 18),
    maxShortTokenPoolAmountForDeposit: expandDecimals(1_000_000_000, 18),

    maxOpenInterestForLongs: decimalToFloat(1_000_000_000),
    maxOpenInterestForShorts: decimalToFloat(1_000_000_000),

    reserveFactorLongs: decimalToFloat(95, 2), // 95%,
    reserveFactorShorts: decimalToFloat(95, 2), // 95%,

    openInterestReserveFactorLongs: decimalToFloat(9, 1), // 90%,
    openInterestReserveFactorShorts: decimalToFloat(9, 1), // 90%,

    maxPnlFactorForTradersLongs: decimalToFloat(8, 1), // 80%
    maxPnlFactorForTradersShorts: decimalToFloat(8, 1), // 80%

    maxPnlFactorForAdlLongs: decimalToFloat(1, 0), // 100%, no ADL under normal operation
    maxPnlFactorForAdlShorts: decimalToFloat(1, 0), // 100%, no ADL under normal operation

    minPnlFactorAfterAdlLongs: decimalToFloat(8, 1), // 80%, no ADL under normal operation
    minPnlFactorAfterAdlShorts: decimalToFloat(8, 1), // 80%, no ADL under normal operation

    maxPnlFactorForDepositsLongs: decimalToFloat(8, 1), // 80%
    maxPnlFactorForDepositsShorts: decimalToFloat(8, 1), // 80%

    maxPnlFactorForWithdrawalsLongs: decimalToFloat(8, 1), // 80%
    maxPnlFactorForWithdrawalsShorts: decimalToFloat(8, 1), // 80%

    positionFeeFactorForPositiveImpact: decimalToFloat(5, 4), // 0.05%
    positionFeeFactorForNegativeImpact: decimalToFloat(7, 4), // 0.07%

    negativePositionImpactFactor: decimalToFloat(1, 7), // 0.00001%
    positivePositionImpactFactor: decimalToFloat(5, 8), // 0.000005%
    positionImpactExponentFactor: decimalToFloat(2, 0), // 2

    negativeMaxPositionImpactFactor: decimalToFloat(1, 2), // 1%
    positiveMaxPositionImpactFactor: decimalToFloat(1, 2), // 1%
    maxPositionImpactFactorForLiquidations: decimalToFloat(1, 2), // 1%

    swapFeeFactorForPositiveImpact: decimalToFloat(5, 4), // 0.05%,
    swapFeeFactorForNegativeImpact: decimalToFloat(7, 4), // 0.07%,

    negativeSwapImpactFactor: decimalToFloat(1, 5), // 0.001%
    positiveSwapImpactFactor: decimalToFloat(5, 6), // 0.0005%
    swapImpactExponentFactor: decimalToFloat(2, 0), // 2

    minCollateralUsd: decimalToFloat(1, 0), // 1 USD

    // factor in open interest reserve factor 80%
    borrowingFactorForLongs: decimalToFloat(625, 11), // 0.00000000625 * 80% = 0.000000005, 0.0000005% / second, 15.77% per year if the pool is 100% utilized
    borrowingFactorForShorts: decimalToFloat(625, 11), // 0.00000000625 * 80% = 0.000000005, 0.0000005% / second, 15.77% per year if the pool is 100% utilized

    borrowingExponentFactorForLongs: decimalToFloat(1),
    borrowingExponentFactorForShorts: decimalToFloat(1),

    fundingFactor: decimalToFloat(2, 8), // ~63% per year for a 100% skew
    fundingExponentFactor: decimalToFloat(1),

    fundingIncreaseFactorPerSecond: 0,
    fundingDecreaseFactorPerSecond: 0,
    thresholdForStableFunding: 0,
    thresholdForDecreaseFunding: 0,
    minFundingFactorPerSecond: 0,
    maxFundingFactorPerSecond: 0,

    positionImpactPoolDistributionRate: 0,
    minPositionImpactPoolAmount: 0,
};

export const markets_config = {
    [contractAddresses['BTCUSDTMarketToken']]: {
        tokens: { indexToken: "BTC", longToken: "WBTC.e", shortToken: "USDC" },
        virtualTokenIdForIndexToken: hashSingleString("PERP:BTC/USD"),
        virtualMarketId: hashSingleString("SPOT:BTC/USD"),

        ...baseMarketConfig,

        reserveFactorLongs: decimalToFloat(125, 2), // 125%,
        reserveFactorShorts: decimalToFloat(125, 2),

        openInterestReserveFactorLongs: decimalToFloat(120, 2),
        openInterestReserveFactorShorts: decimalToFloat(120, 2),

        maxLongTokenPoolAmount: expandDecimals(2_200_000, 18),
        maxShortTokenPoolAmount: expandDecimals(110_000_000, 18),

        maxLongTokenPoolAmountForDeposit: expandDecimals(2000, 18),
        maxShortTokenPoolAmountForDeposit: expandDecimals(100_000_000, 18),

        negativePositionImpactFactor: decimalToFloat(15, 11), // 0.05% for ~1,600,000 USD of imbalance
        positivePositionImpactFactor: decimalToFloat(9, 11), // 0.05% for ~2,700,000 USD of imbalance

        positionImpactPoolDistributionRate: expandDecimals(552, 30), // 5.5263E+32, 0.4774722066 BTC / day
        minPositionImpactPoolAmount: expandDecimals(95, 6), // 0.95 BTC

        negativeSwapImpactFactor: decimalToFloat(2, 10), // 0.05% for 2,500,000 USD of imbalance
        positiveSwapImpactFactor: decimalToFloat(2, 10), // 0.05% for 2,500,000 USD of imbalance

        // minCollateralFactor of 0.01 (1%) when open interest is 50,000,000 USD
        minCollateralFactorForOpenInterestMultiplierLong: decimalToFloat(2, 10),
        minCollateralFactorForOpenInterestMultiplierShort: decimalToFloat(2, 10),

        maxOpenInterestForLongs: decimalToFloat(90_000_000),
        maxOpenInterestForShorts: decimalToFloat(90_000_000),

        fundingIncreaseFactorPerSecond: decimalToFloat(158, 14), // 0.00000000000158, at least 3.5 hours to reach max funding
        fundingDecreaseFactorPerSecond: decimalToFloat(0), // not applicable if thresholdForDecreaseFunding = 0
        minFundingFactorPerSecond: decimalToFloat(3, 10), // 0.00000003%, 0.000108% per hour, 0.95% per year
        maxFundingFactorPerSecond: decimalToFloat(20, 9), // 0.000002%,  0.1728% per day, ~63% per year
        thresholdForStableFunding: decimalToFloat(5, 2), // 5%
        thresholdForDecreaseFunding: decimalToFloat(0), // 0%

        // factor in open interest reserve factor 120%
        borrowingFactorForLongs: decimalToFloat(915, 14), // 9.15E-12, 50% at 100% utilisation
        borrowingFactorForShorts: decimalToFloat(915, 14), // 9.15E-12, 50% at 100% utilisation

        borrowingExponentFactorForLongs: decimalToFloat(14, 1), // 1.4
        borrowingExponentFactorForShorts: decimalToFloat(14, 1), // 1.4
    },
    [contractAddresses['LINKUSDTMarketToken']]: {
        tokens: { indexToken: "LINK", longToken: "LINK", shortToken: "USDT" },
        virtualTokenIdForIndexToken: hashSingleString("PERP:LINK/USD"),
        virtualMarketId: hashSingleString("SPOT:LINK/USD"),

        ...baseMarketConfig,

        reserveFactorLongs: decimalToFloat(125, 2), // 125%,
        reserveFactorShorts: decimalToFloat(125, 2),

        openInterestReserveFactorLongs: decimalToFloat(120, 2),
        openInterestReserveFactorShorts: decimalToFloat(120, 2),

        maxLongTokenPoolAmount: expandDecimals(2_200_000, 18),
        maxShortTokenPoolAmount: expandDecimals(110_000_000, 18),

        maxLongTokenPoolAmountForDeposit: expandDecimals(2000, 18),
        maxShortTokenPoolAmountForDeposit: expandDecimals(100_000_000, 18),

        negativePositionImpactFactor: decimalToFloat(15, 11), // 0.05% for ~1,600,000 USD of imbalance
        positivePositionImpactFactor: decimalToFloat(9, 11), // 0.05% for ~2,700,000 USD of imbalance

        positionImpactPoolDistributionRate: expandDecimals(552, 30), // 5.5263E+32, 0.4774722066 BTC / day
        minPositionImpactPoolAmount: expandDecimals(95, 6), // 0.95 BTC

        negativeSwapImpactFactor: decimalToFloat(2, 10), // 0.05% for 2,500,000 USD of imbalance
        positiveSwapImpactFactor: decimalToFloat(2, 10), // 0.05% for 2,500,000 USD of imbalance

        // minCollateralFactor of 0.01 (1%) when open interest is 50,000,000 USD
        minCollateralFactorForOpenInterestMultiplierLong: decimalToFloat(2, 10),
        minCollateralFactorForOpenInterestMultiplierShort: decimalToFloat(2, 10),

        maxOpenInterestForLongs: decimalToFloat(12_000_000),
        maxOpenInterestForShorts: decimalToFloat(12_000_000),

        fundingIncreaseFactorPerSecond: decimalToFloat(158, 14), // 0.00000000000158, at least 3.5 hours to reach max funding
        fundingDecreaseFactorPerSecond: decimalToFloat(0), // not applicable if thresholdForDecreaseFunding = 0
        minFundingFactorPerSecond: decimalToFloat(3, 10), // 0.00000003%, 0.000108% per hour, 0.95% per year
        maxFundingFactorPerSecond: decimalToFloat(20, 9), // 0.000002%,  0.1728% per day, ~63% per year
        thresholdForStableFunding: decimalToFloat(5, 2), // 5%
        thresholdForDecreaseFunding: decimalToFloat(0), // 0%

        // factor in open interest reserve factor 120%
        borrowingFactorForLongs: decimalToFloat(915, 14), // 9.15E-12, 50% at 100% utilisation
        borrowingFactorForShorts: decimalToFloat(915, 14), // 9.15E-12, 50% at 100% utilisation

        borrowingExponentFactorForLongs: decimalToFloat(14, 1), // 1.4
        borrowingExponentFactorForShorts: decimalToFloat(14, 1), // 1.4
    },
    [contractAddresses['ETHUSDTMarketToken']]: {
        tokens: { indexToken: "ETH", longToken: "ETH", shortToken: "USDT" },
        virtualTokenIdForIndexToken: hashSingleString("PERP:ETH/USD"),
        virtualMarketId: hashSingleString("SPOT:ETH/USD"),

        ...baseMarketConfig,

        maxLongTokenPoolAmount: expandDecimals(26_700, 18),
        maxShortTokenPoolAmount: expandDecimals(60_000_000, 18),

        maxLongTokenPoolAmountForDeposit: expandDecimals(24_500, 18),
        maxShortTokenPoolAmountForDeposit: expandDecimals(55_000_000, 18),

        negativePositionImpactFactor: decimalToFloat(15, 11), // 0.05% for ~1,600,000 USD of imbalance
        positivePositionImpactFactor: decimalToFloat(9, 11), // 0.05% for ~2,700,000 USD of imbalance

        positionImpactPoolDistributionRate: expandDecimals(256, 41), // ~2.21 ETH/day
        minPositionImpactPoolAmount: expandDecimals(24, 18), // 24 ETH

        negativeSwapImpactFactor: decimalToFloat(2, 10), // 0.05% for 2,500,000 USD of imbalance
        positiveSwapImpactFactor: decimalToFloat(2, 10), // 0.05% for 2,500,000 USD of imbalance

        // minCollateralFactor of 0.01 (1%) when open interest is 50,000,000 USD
        minCollateralFactorForOpenInterestMultiplierLong: decimalToFloat(2, 10),
        minCollateralFactorForOpenInterestMultiplierShort: decimalToFloat(2, 10),

        maxOpenInterestForLongs: decimalToFloat(64_000_000),
        maxOpenInterestForShorts: decimalToFloat(64_000_000),

        fundingIncreaseFactorPerSecond: decimalToFloat(8, 13), // 0.0000000000008, at least 3.5 hours to reach max funding
        fundingDecreaseFactorPerSecond: decimalToFloat(0), // not applicable if thresholdForDecreaseFunding = 0
        minFundingFactorPerSecond: decimalToFloat(3, 10), // 0.00000003%, 0.000108% per hour, 0.95% per year
        maxFundingFactorPerSecond: decimalToFloat(1, 8), // 0.000001%,  0.0036% per hour, 31.5% per year
        thresholdForStableFunding: decimalToFloat(5, 2), // 5%
        thresholdForDecreaseFunding: decimalToFloat(0), // 0%

        borrowingFactorForLongs: decimalToFloat(720, 14), // 7.20e-12, 23.53% at 100% utilisation
        borrowingFactorForShorts: decimalToFloat(720, 14), // 7.20e-12, 23.53% at 100% utilisation

        borrowingExponentFactorForLongs: decimalToFloat(14, 1), // 1.4
        borrowingExponentFactorForShorts: decimalToFloat(14, 1), // 1.4
    }
}