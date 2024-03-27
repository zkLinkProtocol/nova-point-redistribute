import { BigInt } from "@graphprotocol/graph-ts";
import { Transfer as TransferEvent } from "../../generated/magpie-mmETH/ERC20";
import {
  ADDRESS_ZERO,
  DENOMINATOR,
  DENOMINATOR_number,
} from "../utils/constants";
import {
  loadOrCreatePoint,
  loadOrCreateTotalPoint,
  toLowerCase,
} from "../utils/point";
const PROJECT_ID = "magpie";
export const LST_PRICE_MAP = new Map<string, BigInt>();

export const STETH = "0x7b1fcd81F8b91C5eF3743c4d56bf7C1E52c93360".toLowerCase();
export const METH = "0xB5B8C247C740d53b6Fbab10f1C17922788baeD54".toLowerCase();
export const WBETH = "0x7F62B7a0A9848D5e261960Ff4B4009206aD00bd5".toLowerCase();
export const SWETH = "0xBB68f4548A1c26B6611cbB8087c25A616eDd8569".toLowerCase();

LST_PRICE_MAP.set(STETH, DENOMINATOR);
LST_PRICE_MAP.set(
  METH,
  BigInt.fromI32(1024 * DENOMINATOR_number).div(BigInt.fromI32(1000))
);
LST_PRICE_MAP.set(
  WBETH,
  BigInt.fromI32(1033 * DENOMINATOR_number).div(BigInt.fromI32(1000))
);
LST_PRICE_MAP.set(
  SWETH,
  BigInt.fromI32(1053 * DENOMINATOR_number).div(BigInt.fromI32(1000))
);

export function handleTransfer(event: TransferEvent): void {
  const stakeToken = toLowerCase(event.address);
  const tokenAddress = stakeToken.toHexString();
  const weight = LST_PRICE_MAP.get(stakeToken.toHexString().toLowerCase());
  const transferShares = event.params.value;
  const from = toLowerCase(event.params.from);
  const to = toLowerCase(event.params.to);
  const timestamp = event.block.timestamp;

  const weightTransferShares = transferShares.times(weight).div(DENOMINATOR);
  const increase = timestamp.times(weightTransferShares);

  const totalPoint = loadOrCreateTotalPoint(PROJECT_ID, tokenAddress);

  // process for sender
  if (from.notEqual(ADDRESS_ZERO)) {
    // burn or transfer to others
    const point = loadOrCreatePoint(from, PROJECT_ID, tokenAddress);
    point.timeWeightAmountOut = point.timeWeightAmountOut.plus(increase);
    point.balance = point.balance.minus(transferShares);
    point.weightBalance = point.weightBalance.minus(weightTransferShares);

    totalPoint.totalTimeWeightAmountOut =
      totalPoint.totalTimeWeightAmountOut.plus(increase);
    totalPoint.totalBalance = totalPoint.totalBalance.minus(transferShares);
    totalPoint.totalWeightBalance =
      totalPoint.totalWeightBalance.minus(weightTransferShares);

    point.save();
  }

  if (to.notEqual(ADDRESS_ZERO)) {
    // mint or receive token from others
    const point = loadOrCreatePoint(to, PROJECT_ID, tokenAddress);
    point.timeWeightAmountIn = point.timeWeightAmountIn.plus(increase);
    point.balance = point.balance.plus(weightTransferShares);
    point.weightBalance = point.weightBalance.plus(weightTransferShares);

    totalPoint.totalTimeWeightAmountIn =
      totalPoint.totalTimeWeightAmountIn.plus(increase);
    totalPoint.totalBalance = totalPoint.totalBalance.plus(transferShares);
    totalPoint.totalWeightBalance =
      totalPoint.totalWeightBalance.plus(weightTransferShares);

    point.save();
  }

  totalPoint.save();
}
