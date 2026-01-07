import processErc20Approve from "./ProcessErc20Approve.js";
import ProcessSmootBridgeDeposit from "./ProcessSmootBridgeDeposit.js";

export default [
  {
    "name": "ProcessErc20Approve",
    "handle": processErc20Approve
  },
  {
    "name": "ProcessSmootBridgeDeposit",
    "handle": ProcessSmootBridgeDeposit
  }
];
