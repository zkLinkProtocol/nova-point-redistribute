import { Point } from "../../generated/schema";
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

export function toLowerCase(address: Bytes): Bytes {
  return Bytes.fromHexString(address.toHexString().toLowerCase());
}
