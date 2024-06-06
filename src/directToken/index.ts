import { BigInt, dataSource, log } from "@graphprotocol/graph-ts";
import { handleTransfer as defaultHandleTransfer } from "../default/index";
import { Transfer as TransferEvent } from "../../generated/magpie-mmETH/ERC20";

export function handleTransfer(event: TransferEvent): void {
  const context = dataSource.context();
  const dataSourceName = context.getString("name");
  if (!dataSourceName) {
    log.warning("DATASOURCE_NAME is null for transaction: {}", [
      event.transaction.hash.toHex(),
    ]);
    return;
  }
  return defaultHandleTransfer(event, dataSourceName);
}
