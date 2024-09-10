import { num, ec } from "starknet";
const { starkCurve } = ec;

export function hashSingleString(string: string) {
  let value: string = string;
  const isHex = num.isHex(string);
  if (!isHex) {
    // TODO: Khiem, please check string isLong
    // Can use: Buffer.from(string) instead
    value = "0x" + Buffer.from(string).toString("hex")
  }

  return num.toHex(starkCurve.poseidonHashMany([num.toBigInt(value)]))
}

export function hashManyString(strings: (string | boolean | BigInt)[]) {
  // TODO, please coverage 100%
  const value = strings.map(s => {
    if (typeof s === "string") {
      const isHex = num.isHex(s);
      if (!isHex) {
        // TODO: Khiem, please check string isLong
        // Can use: Buffer.from(string) instead
        return num.toBigInt("0x" + Buffer.from(s).toString("hex"));
      }
      return num.toBigInt(s);
    }
    if (typeof s === "boolean") {
      return num.toBigInt(s ? "0x1" : "0x0");
    }
    if (typeof s === "bigint") {
      return num.toBigInt(s);
    }

    return num.toBigInt(0);

  });

  return num.toHex(starkCurve.poseidonHashMany(value))
}

export const POSITION_IMPACT_FACTOR_KEY = hashSingleString("POSITION_IMPACT_FACTOR");
export const MAX_POSITION_IMPACT_FACTOR_KEY = hashSingleString("MAX_POSITION_IMPACT_FACTOR");
export const POSITION_IMPACT_EXPONENT_FACTOR_KEY = hashSingleString("POSITION_IMPACT_EXPONENT_FACTOR");
export const POSITION_FEE_FACTOR_KEY = hashSingleString("POSITION_FEE_FACTOR");
export const SWAP_IMPACT_FACTOR_KEY = hashSingleString("SWAP_IMPACT_FACTOR");
export const SWAP_IMPACT_EXPONENT_FACTOR_KEY = hashSingleString("SWAP_IMPACT_EXPONENT_FACTOR");
export const SWAP_FEE_FACTOR_KEY = hashSingleString("SWAP_FEE_FACTOR");
export const OPEN_INTEREST_KEY = hashSingleString("OPEN_INTEREST");
export const OPEN_INTEREST_IN_TOKENS_KEY = hashSingleString("OPEN_INTEREST_IN_TOKENS");
export const POOL_AMOUNT_KEY = hashSingleString("POOL_AMOUNT");
export const MAX_POOL_AMOUNT_FOR_DEPOSIT_KEY = hashSingleString("MAX_POOL_AMOUNT_FOR_DEPOSIT");
export const MAX_POOL_AMOUNT_KEY = hashSingleString("MAX_POOL_AMOUNT");
export const RESERVE_FACTOR_KEY = hashSingleString("RESERVE_FACTOR");
export const OPEN_INTEREST_RESERVE_FACTOR_KEY = hashSingleString("OPEN_INTEREST_RESERVE_FACTOR");
export const MAX_OPEN_INTEREST_KEY = hashSingleString("MAX_OPEN_INTEREST");
export const NONCE_KEY = hashSingleString("NONCE");
export const BORROWING_FACTOR_KEY = hashSingleString("BORROWING_FACTOR");
export const BORROWING_EXPONENT_FACTOR_KEY = hashSingleString("BORROWING_EXPONENT_FACTOR");
export const FUNDING_FACTOR_KEY = hashSingleString("FUNDING_FACTOR");
export const FUNDING_EXPONENT_FACTOR_KEY = hashSingleString("FUNDING_EXPONENT_FACTOR");
export const FUNDING_INCREASE_FACTOR_PER_SECOND = hashSingleString("FUNDING_INCREASE_FACTOR_PER_SECOND");
export const FUNDING_DECREASE_FACTOR_PER_SECOND = hashSingleString("FUNDING_DECREASE_FACTOR_PER_SECOND");
export const MIN_FUNDING_FACTOR_PER_SECOND = hashSingleString("MIN_FUNDING_FACTOR_PER_SECOND");
export const MAX_FUNDING_FACTOR_PER_SECOND = hashSingleString("MAX_FUNDING_FACTOR_PER_SECOND");
export const THRESHOLD_FOR_STABLE_FUNDING = hashSingleString("THRESHOLD_FOR_STABLE_FUNDING");
export const THRESHOLD_FOR_DECREASE_FUNDING = hashSingleString("THRESHOLD_FOR_DECREASE_FUNDING");
export const MAX_PNL_FACTOR_KEY = hashSingleString("MAX_PNL_FACTOR");
export const MAX_PNL_FACTOR_FOR_WITHDRAWALS_KEY = hashSingleString("MAX_PNL_FACTOR_FOR_WITHDRAWALS");
export const MAX_PNL_FACTOR_FOR_DEPOSITS_KEY = hashSingleString("MAX_PNL_FACTOR_FOR_DEPOSITS");
export const MAX_PNL_FACTOR_FOR_TRADERS_KEY = hashSingleString("MAX_PNL_FACTOR_FOR_TRADERS");
export const MAX_POSITION_IMPACT_FACTOR_FOR_LIQUIDATIONS_KEY = hashSingleString(
  "MAX_POSITION_IMPACT_FACTOR_FOR_LIQUIDATIONS"
);
export const MAX_PNL_FACTOR_FOR_ADL = hashSingleString("MAX_PNL_FACTOR_FOR_ADL");
export const MIN_PNL_FACTOR_AFTER_ADL = hashSingleString("MIN_PNL_FACTOR_AFTER_ADL");

export const POSITION_IMPACT_POOL_AMOUNT_KEY = hashSingleString("POSITION_IMPACT_POOL_AMOUNT");
export const MIN_POSITION_IMPACT_POOL_AMOUNT_KEY = hashSingleString("MIN_POSITION_IMPACT_POOL_AMOUNT");
export const POSITION_IMPACT_POOL_DISTRIBUTION_RATE_KEY = hashSingleString("POSITION_IMPACT_POOL_DISTRIBUTION_RATE");
export const SWAP_IMPACT_POOL_AMOUNT_KEY = hashSingleString("SWAP_IMPACT_POOL_AMOUNT");
export const MIN_COLLATERAL_USD_KEY = hashSingleString("MIN_COLLATERAL_USD");
export const MIN_COLLATERAL_FACTOR_KEY = hashSingleString("MIN_COLLATERAL_FACTOR");
export const MIN_COLLATERAL_FACTOR_FOR_OPEN_INTEREST_MULTIPLIER_KEY = hashSingleString(
  "MIN_COLLATERAL_FACTOR_FOR_OPEN_INTEREST_MULTIPLIER"
);
export const MIN_POSITION_SIZE_USD_KEY = hashSingleString("MIN_POSITION_SIZE_USD");
export const DEPOSIT_GAS_LIMIT_KEY = hashSingleString("DEPOSIT_GAS_LIMIT");
export const WITHDRAWAL_GAS_LIMIT_KEY = hashSingleString("WITHDRAWAL_GAS_LIMIT");
export const INCREASE_ORDER_GAS_LIMIT_KEY = hashSingleString("INCREASE_ORDER_GAS_LIMIT");
export const DECREASE_ORDER_GAS_LIMIT_KEY = hashSingleString("DECREASE_ORDER_GAS_LIMIT");
export const SWAP_ORDER_GAS_LIMIT_KEY = hashSingleString("SWAP_ORDER_GAS_LIMIT");
export const SINGLE_SWAP_GAS_LIMIT_KEY = hashSingleString("SINGLE_SWAP_GAS_LIMIT");
export const ESTIMATED_GAS_FEE_BASE_AMOUNT = hashSingleString("ESTIMATED_GAS_FEE_BASE_AMOUNT");
export const ESTIMATED_GAS_FEE_MULTIPLIER_FACTOR = hashSingleString("ESTIMATED_GAS_FEE_MULTIPLIER_FACTOR");
export const ACCOUNT_POSITION_LIST_KEY = hashSingleString("ACCOUNT_POSITION_LIST");
export const ACCOUNT_ORDER_LIST_KEY = hashSingleString("ACCOUNT_ORDER_LIST");
export const CLAIMABLE_FUNDING_AMOUNT = hashSingleString("CLAIMABLE_FUNDING_AMOUNT");
export const VIRTUAL_TOKEN_ID_KEY = hashSingleString("VIRTUAL_TOKEN_ID");
export const VIRTUAL_MARKET_ID_KEY = hashSingleString("VIRTUAL_MARKET_ID");
export const POOL_AMOUNT_ADJUSTMENT_KEY = hashSingleString("POOL_AMOUNT_ADJUSTMENT");
export const AFFILIATE_REWARD_KEY = hashSingleString("AFFILIATE_REWARD");
export const IS_MARKET_DISABLED_KEY = hashSingleString("IS_MARKET_DISABLED");
export const UI_FEE_FACTOR = hashSingleString("UI_FEE_FACTOR");

export const PRICE_FEED = hashSingleString("PRICE_FEED");
export const PRICE_FEED_MULTIPLIER = hashSingleString("PRICE_FEED_MULTIPLIER");
export const PRICE_FEED_HEARTBEAT_DURATION = hashSingleString("PRICE_FEED_HEARTBEAT_DURATION");

export const STABLE_PRICE = hashSingleString("STABLE_PRICE");
export const MAX_ORAC_REF_PRICE_DEV_FACTOR = hashSingleString("MAX_ORAC_REF_PRICE_DEV_FACTOR");
export const MIN_ORACLE_SIGNERS = hashSingleString("MIN_ORACLE_SIGNERS");
export const FEE_TOKEN = hashSingleString("FEE_TOKEN");

// Oracle
export const MAX_ORACLE_PRICE_AGE = hashSingleString("MAX_ORACLE_PRICE_AGE");




export function positionImpactFactorKey(market: string, isPositive: boolean) {
  return hashManyString([POSITION_IMPACT_FACTOR_KEY, market, isPositive]);
}

export function positionImpactExponentFactorKey(market: string) {
  return hashManyString([POSITION_IMPACT_EXPONENT_FACTOR_KEY, market]);
}

export function maxPositionImpactFactorKey(market: string, isPositive: boolean) {
  return hashManyString([MAX_POSITION_IMPACT_FACTOR_KEY, market, isPositive]);
}

export function positionFeeFactorKey(market: string, forPositiveImpact: boolean) {
  return hashManyString([POSITION_FEE_FACTOR_KEY, market, forPositiveImpact]);
}

export function swapImpactFactorKey(market: string, isPositive: boolean) {
  return hashManyString([SWAP_IMPACT_FACTOR_KEY, market, isPositive]);
}

export function swapImpactExponentFactorKey(market: string) {
  return hashManyString([SWAP_IMPACT_EXPONENT_FACTOR_KEY, market]);
}

export function swapFeeFactorKey(market: string, forPositiveImpact: boolean) {
  return hashManyString([SWAP_FEE_FACTOR_KEY, market, forPositiveImpact]);
}

export function openInterestKey(market: string, collateralToken: string, isLong: boolean) {
  return hashManyString([OPEN_INTEREST_KEY, market, collateralToken, isLong]);
}

export function openInterestInTokensKey(market: string, collateralToken: string, isLong: boolean) {
  return hashManyString([OPEN_INTEREST_IN_TOKENS_KEY, market, collateralToken, isLong]);
}

export function poolAmountKey(market: string, token: string) {
  return hashManyString([POOL_AMOUNT_KEY, market, token]);
}

export function reserveFactorKey(market: string, isLong: boolean) {
  return hashManyString([RESERVE_FACTOR_KEY, market, isLong]);
}

export function openInterestReserveFactorKey(market: string, isLong: boolean) {
  return hashManyString([OPEN_INTEREST_RESERVE_FACTOR_KEY, market, isLong]);
}

export function maxOpenInterestKey(market: string, isLong: boolean) {
  return hashManyString([MAX_OPEN_INTEREST_KEY, market, isLong]);
}

export function borrowingFactorKey(market: string, isLong: boolean) {
  return hashManyString([BORROWING_FACTOR_KEY, market, isLong]);
}

export function borrowingExponentFactorKey(market: string, isLong: boolean) {
  return hashManyString([BORROWING_EXPONENT_FACTOR_KEY, market, isLong]);
}

export function fundingFactorKey(market: string) {
  return hashManyString([FUNDING_FACTOR_KEY, market]);
}

export function fundingExponentFactorKey(market: string) {
  return hashManyString([FUNDING_EXPONENT_FACTOR_KEY, market]);
}

export function fundingIncreaseFactorPerSecondKey(market: string) {
  return hashManyString([FUNDING_INCREASE_FACTOR_PER_SECOND, market]);
}

export function fundingDecreaseFactorPerSecondKey(market: string) {
  return hashManyString([FUNDING_DECREASE_FACTOR_PER_SECOND, market]);
}

export function minFundingFactorPerSecondKey(market: string) {
  return hashManyString([MIN_FUNDING_FACTOR_PER_SECOND, market]);
}

export function maxFundingFactorPerSecondKey(market: string) {
  return hashManyString([MAX_FUNDING_FACTOR_PER_SECOND, market]);
}

export function thresholdForStableFundingKey(market: string) {
  return hashManyString([THRESHOLD_FOR_STABLE_FUNDING, market]);
}

export function thresholdForDecreaseFundingKey(market: string) {
  return hashManyString([THRESHOLD_FOR_DECREASE_FUNDING, market]);
}

export function maxPnlFactorKey(pnlFactorType: string, market: string, isLong: boolean) {
  return hashManyString([MAX_PNL_FACTOR_KEY, pnlFactorType, market, isLong]);
}

export function positionImpactPoolAmountKey(market: string) {
  return hashManyString([POSITION_IMPACT_POOL_AMOUNT_KEY, market]);
}

export function minPositionImpactPoolAmountKey(market: string) {
  return hashManyString([MIN_POSITION_IMPACT_POOL_AMOUNT_KEY, market]);
}

export function positionImpactPoolDistributionRateKey(market: string) {
  return hashManyString([POSITION_IMPACT_POOL_DISTRIBUTION_RATE_KEY, market]);
}

export function maxPositionImpactFactorForLiquidationsKey(market: string) {
  return hashManyString([MAX_POSITION_IMPACT_FACTOR_FOR_LIQUIDATIONS_KEY, market]);
}

export function swapImpactPoolAmountKey(market: string, token: string) {
  return hashManyString([SWAP_IMPACT_POOL_AMOUNT_KEY, market, token]);
}

export function orderKey(dataStoreAddress: string, nonce: BigInt) {
  return hashManyString([dataStoreAddress, nonce]);
}

export function depositGasLimitKey(singleToken: boolean) {
  return hashManyString([DEPOSIT_GAS_LIMIT_KEY, singleToken]);
}

export function withdrawalGasLimitKey() {
  return hashManyString([WITHDRAWAL_GAS_LIMIT_KEY]);
}

export function singleSwapGasLimitKey() {
  return SINGLE_SWAP_GAS_LIMIT_KEY;
}

export function increaseOrderGasLimitKey() {
  return INCREASE_ORDER_GAS_LIMIT_KEY;
}

export function decreaseOrderGasLimitKey() {
  return DECREASE_ORDER_GAS_LIMIT_KEY;
}

export function swapOrderGasLimitKey() {
  return SWAP_ORDER_GAS_LIMIT_KEY;
}

export function accountOrderListKey(account: string) {
  return hashManyString([ACCOUNT_ORDER_LIST_KEY, account]);
}

export function accountPositionListKey(account: string) {
  return hashManyString([ACCOUNT_POSITION_LIST_KEY, account]);
}

export function minCollateralFactorKey(market: string) {
  return hashManyString([MIN_COLLATERAL_FACTOR_KEY, market]);
}

export function minCollateralFactorForOpenInterest(market: string, isLong: boolean) {
  return hashManyString([MIN_COLLATERAL_FACTOR_FOR_OPEN_INTEREST_MULTIPLIER_KEY, market, isLong]);
}

export function hashedPositionKey(account: string, market: string, collateralToken: string, isLong: boolean) {
  return hashManyString([account, market, collateralToken, isLong]);
}

export function claimableFundingAmountKey(market: string, token: string, account: string) {
  return hashManyString([CLAIMABLE_FUNDING_AMOUNT, market, token, account]);
}
export function virtualTokenIdKey(token: string) {
  return hashManyString([VIRTUAL_TOKEN_ID_KEY, token]);
}

export function virtualMarketIdKey(market: string) {
  return hashManyString([VIRTUAL_MARKET_ID_KEY, market]);
}

export function poolAmountAdjustmentKey(market: string, token: string) {
  return hashManyString([POOL_AMOUNT_ADJUSTMENT_KEY, market, token]);
}

export function affiliateRewardKey(market: string, token: string, account: string) {
  return hashManyString([AFFILIATE_REWARD_KEY, market, token, account]);
}

export function isMarketDisabledKey(market: string) {
  return hashManyString([IS_MARKET_DISABLED_KEY, market]);
}

export function maxPoolAmountForDepositKey(market: string, token: string) {
  return hashManyString([MAX_POOL_AMOUNT_FOR_DEPOSIT_KEY, market, token]);
}

export function maxPoolAmountKey(market: string, token: string) {
  return hashManyString([MAX_POOL_AMOUNT_KEY, market, token]);
}

export function uiFeeFactorKey(address: string) {
  return hashManyString([UI_FEE_FACTOR, address]);
}

export function minPnlFactorAfterAdl(market: string, isLong: boolean) {
  return hashManyString([MIN_PNL_FACTOR_AFTER_ADL, market, isLong]);
}

export function priceFeedKey(token: string) {
  return hashManyString([PRICE_FEED, token]);
}

export function priceFeedMultiplierKey(token: string) {
  return hashManyString([PRICE_FEED_MULTIPLIER, token]);
}

export function priceFeedHeartbeatDurationKey(token: string) {
  return hashManyString([PRICE_FEED_HEARTBEAT_DURATION, token]);
}

export function stablePriceToken(token: string) {
  return hashManyString([STABLE_PRICE, token]);
}

export function getPositionKey(account: string, market: string, collateral_token: string, is_long: boolean) {
  return hashManyString([account, market, collateral_token, is_long]);
}