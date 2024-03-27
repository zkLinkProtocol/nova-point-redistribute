import { Point } from "../../generated/schema";
import { Address, BigInt, Bytes, log, store } from "@graphprotocol/graph-ts";
import { BIGINT_ZERO } from "./constants";

export function loadOrCreatePoint(address: Bytes): Point {
  address = toLowerCase(address);
  let point = Point.load(address);

  if (!point) {
    point = new Point(address);
    point.address = address;
    point.balance = BIGINT_ZERO;
    point.timeWeightAmountIn = BIGINT_ZERO;
    point.timeWeightAmountOut = BIGINT_ZERO;
    point.save();
  }
  return point;
}

export function toLowerCase(address: Bytes): Bytes {
  return Bytes.fromHexString(address.toHexString().toLowerCase());
}
