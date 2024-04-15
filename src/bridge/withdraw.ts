import { BigInt } from "@graphprotocol/graph-ts";
import { WithdrawalInitiated as WithdrawalInitiatedEvent } from "../../generated/arbitrum-bridge/L2ERC20Bridge";
import { DENOMINATOR, DENOMINATOR_number } from "../utils/constants";
import {
  loadOrCreateWithdrawPoint,
  toLowerCase,
} from "../utils/point";

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

export function handleWithdrawalInitiated(event: WithdrawalInitiatedEvent): void {
  const tokenAddress = event.params.l2Token.toHexString();
  const from = toLowerCase(event.params.l2Sender);
  const timestamp = event.block.timestamp;
  const transferShares = calculateWeightTransferShares(tokenAddress, event.params.amount);

  const increase = timestamp.times(transferShares);

  const withdrawPoint = loadOrCreateWithdrawPoint(from, tokenAddress, timestamp);
  withdrawPoint.timeWeightAmountIn = withdrawPoint.timeWeightAmountIn.plus(increase);
  withdrawPoint.balance = withdrawPoint.balance.plus(transferShares);
  withdrawPoint.weightBalance = withdrawPoint.balance;
  withdrawPoint.save();
}

function calculateWeightTransferShares(token: string, transferShares: BigInt): BigInt{
    const mgpieTokens = [STETH, METH, WBETH, SWETH];
    if(!mgpieTokens.includes(token)){
        // not exist
        return transferShares;
    }
    const weight = LST_PRICE_MAP.get(token.toLowerCase());
    return transferShares.times(weight).div(DENOMINATOR);
}
