import { Transfer as TransferEvent } from "../../generated/magpie-mmETH/ERC20";
import { ADDRESS_ZERO } from "../utils/constants";
import {
  loadOrCreatePoint,
  toLowerCase,
  loadOrCreateTotalPoint,
} from "../utils/point";

/**
 * 
 return (
      BigInt(weightBalance) * BigInt(timestamp) -
      (BigInt(timeWeightAmountIn) - BigInt(timeWeightAmountOut))
    );
    => Sum{(Time_current - Time_n) * Amount_n}
 * @param event 
 * @param projectId 
 */
export function handleTransfer(event: TransferEvent, projectId: string): void {
  const stakeToken = toLowerCase(event.address);
  const tokenAddress = stakeToken.toHexString();
  const transferShares = event.params.value;
  const from = toLowerCase(event.params.from);
  const to = toLowerCase(event.params.to);
  const timestamp = event.block.timestamp;

  const increase = timestamp.times(transferShares);

  const totalPoint = loadOrCreateTotalPoint(projectId, tokenAddress);

  // process for sender
  if (from.notEqual(ADDRESS_ZERO)) {
    // burn or transfer to others
    const point = loadOrCreatePoint(from, projectId, tokenAddress);

    point.timeWeightAmountOut = point.timeWeightAmountOut.plus(increase);
    point.balance = point.balance.minus(transferShares);
    point.weightBalance = point.balance;

    point.save();
  } else if(to.notEqual(ADDRESS_ZERO)){
    // mint
    totalPoint.totalTimeWeightAmountIn =
      totalPoint.totalTimeWeightAmountIn.plus(increase);
    totalPoint.totalBalance = totalPoint.totalBalance.plus(transferShares);
    totalPoint.totalWeightBalance = totalPoint.totalBalance;
  }

  if (to.notEqual(ADDRESS_ZERO)) {
    // mint or receive token from others
    const point = loadOrCreatePoint(to, projectId, tokenAddress);
    point.timeWeightAmountIn = point.timeWeightAmountIn.plus(increase);
    point.balance = point.balance.plus(transferShares);
    point.weightBalance = point.balance;
    
    point.save();
  } else if (from.notEqual(ADDRESS_ZERO)){
    // burn
    totalPoint.totalTimeWeightAmountOut =
      totalPoint.totalTimeWeightAmountOut.plus(increase);
    totalPoint.totalBalance = totalPoint.totalBalance.minus(transferShares);
    totalPoint.totalWeightBalance = totalPoint.totalBalance;
  }

  totalPoint.save();
}
