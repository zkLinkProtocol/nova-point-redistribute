import { Transfer as TransferEvent } from "../../generated/magpie-mmETH/ERC20";
import { ADDRESS_ZERO } from "../utils/constants";
import { loadOrCreatePoint, toLowerCase } from "../utils/point";

export function handleTransfer(event: TransferEvent): void {
  const transferShares = event.params.value;
  const from = toLowerCase(event.params.from);
  const to = toLowerCase(event.params.to);
  const timestamp = event.block.timestamp;

  const increase = timestamp.times(transferShares);
  // process for sender
  if (from.notEqual(ADDRESS_ZERO)) {
    // burn or transfer to others
    const point = loadOrCreatePoint(from);
    point.timeWeightAmountOut = point.timeWeightAmountOut.plus(increase);
    point.balance = point.balance.minus(transferShares);
    point.save();
  }

  if (to.notEqual(ADDRESS_ZERO)) {
    // mint or receive token from others
    const point = loadOrCreatePoint(to);
    point.timeWeightAmountIn = point.timeWeightAmountIn.plus(increase);
    point.balance = point.balance.plus(transferShares);
    point.save();
  }
}