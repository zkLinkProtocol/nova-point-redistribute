import { Point, TotalPoint, WithdrawPoint } from "../../generated/schema";
import { BigInt, Bytes, crypto } from "@graphprotocol/graph-ts";
import { BIGINT_ZERO } from "./constants";

function getProjectId(projectId: string, tokenAddress: string): string {
  return `${projectId}-${tokenAddress}`;
}
export function loadOrCreatePoint(
  address: Bytes,
  projectId: string,
  tokenAddress: string
): Point {
  address = toLowerCase(address);
  projectId = getProjectId(projectId, tokenAddress);
  const id = Bytes.fromByteArray(
    crypto.keccak256(address.concat(Bytes.fromUTF8(projectId)))
  );
  let point = Point.load(id);

  if (!point) {
    point = new Point(id);
    point.address = address;
    point.balance = BIGINT_ZERO;
    point.weightBalance = BIGINT_ZERO;
    point.project = projectId;
    point.timeWeightAmountIn = BIGINT_ZERO;
    point.timeWeightAmountOut = BIGINT_ZERO;
    point.save();
  }
  return point;
}

export function loadOrCreateTotalPoint(
  projectId: string,
  tokenAddress: string
): TotalPoint {
  projectId = getProjectId(projectId, tokenAddress);
  const id = Bytes.fromByteArray(crypto.keccak256(Bytes.fromUTF8(projectId)));
  let totalPoint = TotalPoint.load(id);
  if (!totalPoint) {
    totalPoint = new TotalPoint(id);
    totalPoint.totalBalance = BIGINT_ZERO;
    totalPoint.totalWeightBalance = BIGINT_ZERO;
    totalPoint.project = projectId;
    totalPoint.totalTimeWeightAmountIn = BIGINT_ZERO;
    totalPoint.totalTimeWeightAmountOut = BIGINT_ZERO;
    totalPoint.save();
  }
  return totalPoint;
}

export function loadOrCreateWithdrawPoint(
  address: Bytes,
  tokenAddress: string,
  blockTimestamp: BigInt
): WithdrawPoint {
  address = toLowerCase(address);
  const projectId = `${tokenAddress}-${blockTimestamp}`;
  const id = Bytes.fromByteArray(
    crypto.keccak256(address.concat(Bytes.fromUTF8(projectId)))
  );
  let withdrawPoint = WithdrawPoint.load(id);

  if (!withdrawPoint) {
    withdrawPoint = new WithdrawPoint(id);
    withdrawPoint.address = address;
    withdrawPoint.balance = BIGINT_ZERO;
    withdrawPoint.weightBalance = BIGINT_ZERO;
    withdrawPoint.project = projectId;
    withdrawPoint.timeWeightAmountIn = BIGINT_ZERO;
    withdrawPoint.timeWeightAmountOut = BIGINT_ZERO;
    withdrawPoint.blockTimestamp = blockTimestamp;

    withdrawPoint.save();
  }
  return withdrawPoint;
}

export function toLowerCase(address: Bytes): Bytes {
  return Bytes.fromHexString(address.toHexString().toLowerCase());
}
