import { Transfer as TransferEvent } from "../../generated/magpie-mmETH/ERC20";
import { ADDRESS_ZERO } from "../utils/constants";
import { loadOrCreatePoint, toLowerCase, loadOrCreateTotalPoint } from "../utils/point";

export function handleTransfer(event: TransferEvent, project: string): void {
  const transferShares = event.params.value;
  const from = toLowerCase(event.params.from);
  const to = toLowerCase(event.params.to);
  const timestamp = event.block.timestamp;

  const increase = timestamp.times(transferShares);
  // process for sender
  if (from.notEqual(ADDRESS_ZERO)) {
    // burn or transfer to others
    const point = loadOrCreatePoint(from, project);
    const totalPoint = loadOrCreateTotalPoint(from, project);
    point.timeWeightAmountOut = point.timeWeightAmountOut.plus(increase);
    totalPoint.totalTimeWeightAmountOut = totalPoint.totalTimeWeightAmountOut.plus(increase);
    point.balance = point.balance.minus(transferShares);
    totalPoint.totalBalance = totalPoint.totalBalance.minus(transferShares);
    point.save();
  }

  if (to.notEqual(ADDRESS_ZERO)) {
    // mint or receive token from others
    const point = loadOrCreatePoint(to, project);
    const totalPoint = loadOrCreateTotalPoint(from, project);
    point.timeWeightAmountIn = point.timeWeightAmountIn.plus(increase);
    totalPoint.totalTimeWeightAmountIn = totalPoint.totalTimeWeightAmountIn.plus(increase);
    point.balance = point.balance.plus(transferShares);
    totalPoint.totalBalance = totalPoint.totalBalance.plus(transferShares);
    point.save();
  }
}
