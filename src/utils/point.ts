import { Point, TotalPoint } from "../../generated/schema";
import { Bytes, crypto } from "@graphprotocol/graph-ts";
import { BIGINT_ZERO } from "./constants";

export function loadOrCreatePoint(address: Bytes, project: string): Point {
  address = toLowerCase(address);

  const id = Bytes.fromByteArray(
    crypto.keccak256(address.concat(Bytes.fromUTF8(project)))
  );
  let point = Point.load(id);

  if (!point) {
    point = new Point(id);
    point.address = address;
    point.balance = BIGINT_ZERO;
    point.project = project;
    point.timeWeightAmountIn = BIGINT_ZERO;
    point.timeWeightAmountOut = BIGINT_ZERO;
    point.save();
  }
  return point;
}

export function loadOrCreateTotalPoint(address: Bytes, project: string): TotalPoint {
  address = toLowerCase(address);

  const id = Bytes.fromByteArray(
    crypto.keccak256(address.concat(Bytes.fromUTF8(project)))
  );
  let totalPoint = TotalPoint.load(id);

  if (!totalPoint) {
    totalPoint = new TotalPoint(id);
    totalPoint.totalBalance = BIGINT_ZERO;
    totalPoint.project = project;
    totalPoint.totalTimeWeightAmountIn = BIGINT_ZERO;
    totalPoint.totalTimeWeightAmountOut = BIGINT_ZERO;
    totalPoint.save();
  }
  return totalPoint;
}

export function toLowerCase(address: Bytes): Bytes {
  return Bytes.fromHexString(address.toHexString().toLowerCase());
}
