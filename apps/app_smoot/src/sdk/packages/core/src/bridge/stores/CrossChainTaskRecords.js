class CrossChainTaskRecords {
  constructor() {
    this.ccTaskRecords = new Map();
  }

  addNewTradeTask(ccTaskData) {
    let ccTask = this.ccTaskRecords.get(ccTaskData.ccTaskId);
    if (ccTask) {
      return;
    }
    this.ccTaskRecords.set(ccTaskData.ccTaskId, ccTaskData);
  }

  modifyTradeTaskStatus(id, ccTaskStatus, errInfo = "") {
    let ccTask = this.ccTaskRecords.get(id);
    if (ccTask) {
      if (!["Failed", "Succeeded", "Error"].includes(ccTask.status)) {
        if (errInfo) { // set errInfo
          ccTask.errInfo = errInfo;
        } else if ((ccTaskStatus === "Converting") && (ccTask.status === "Timeout")) {
          ccTask.errInfo = ""; // clear temporary Timeout status
        }
        ccTask.status = ccTaskStatus;
      }
    }
  }

  // stepData has already been updated, only need to update task info
  updateTaskByStepResult(ccTaskId, stepIndex, txHash, result, errInfo = "") {
    let isLockTx = false, isLocked = false;
    let ccTask = this.ccTaskRecords.get(ccTaskId);
    if (ccTask) {
      for (let i = 0; i < ccTask.stepData.length; i++) {
        if (ccTask.stepData[i].stepIndex === stepIndex) {
          if (["Failed", "Rejected"].includes(result)) {
            ccTask.status = result;
            if (errInfo) {
              ccTask.errInfo = errInfo;
            }
          } else if (["userFastMint", "userFastBurn", "depositForBurn", "smootSend"].includes(ccTask.stepData[i].name)) {
            // on evm both tx and receipt will trigger updateTaskByStepResult, update txHash and notify dapp only once
            if (txHash) {
              isLockTx = !ccTask.lockHash;
              ccTask.lockHash = txHash; // may repriced, always update lockHash
            }
            if (result) { // on evm do not change status until receipt with result
              isLocked = (ccTask.status !== "Converting");
              ccTask.status = "Converting";
            }
          }
        }
      }
    }
    return { isLockTx, isLocked };
  }

  setTaskLockTxHash(ccTaskId, txHash, sentAmount, sender, uniqueId) {
    let ccTask = this.ccTaskRecords.get(ccTaskId);
    if (ccTask) {
      ccTask.lockHash = txHash;
      ccTask.uniqueId = uniqueId || "";
      ccTask.sentAmount = sentAmount;
      if (sender) {
        ccTask.fromAccount = sender;
      }
    }
  }

  setTaskRedeemTxHash(ccTaskId, txHash, receivedAmount) {
    let ccTask = this.ccTaskRecords.get(ccTaskId);
    if (ccTask) {
      if (txHash) { // prevent clearing txHash on repeated redeem
        ccTask.redeemHash = txHash;
      }
      ccTask.receivedAmount = receivedAmount;
    }
  }

  removeTradeTask(ccTaskId) {
    this.ccTaskRecords.delete(ccTaskId);
  }

  loadTradeTask(ccTaskList) {
    for (let i = 0; i < ccTaskList.length; i++) {
      let ccTask = ccTaskList[i];
      this.ccTaskRecords.set(ccTask.ccTaskId, ccTask);
    }
  }

  // should always be called before saving task information
  setExtraInfo(ccTaskId, info, overwrite = false) {
    let ccTask = this.ccTaskRecords.get(ccTaskId);
    if (ccTask) {
      for (let k in info) {
        if (overwrite || !ccTask[k]) {
          ccTask[k] = info[k];
        } else {
          console.error("task %s reject overwrite key %s", ccTaskId, k);
        }
      }
    }
  }

  // maybe only update txHash, not really finished
  finishTaskStep(ccTaskId, stepIndex, txHash, stepResult, errInfo = "") {
    let ccTask = this.ccTaskRecords.get(ccTaskId);
    let steps = ccTask.stepData || [];
    for (let i = 0; i < steps.length; i++) {
      if (stepIndex == steps[i].stepIndex) {
        if (txHash) {
          steps[i].txHash = txHash;
        }
        if (stepResult) {
          steps[i].stepResult = stepResult;
        }
        if (errInfo) {
          steps[i].errInfo = errInfo;
        }
      }
    }
  }

  getTaskById(ccTaskId) {
    return this.ccTaskRecords.get(ccTaskId);
  }

  getTaskNumber(protocols) {
    let allTasks = Array.from(this.ccTaskRecords.values()).filter(v => (protocols === undefined) || protocols.includes(v.protocol));
    return allTasks.length;
  }

  getTaskByPage(page, number, protocols) {
    let skip = page * number, result = [];
    let allTasks = Array.from(this.ccTaskRecords.values()).filter(v => (protocols === undefined) || protocols.includes(v.protocol)); // should already be sorted in ascending order
    let endIndex = allTasks.length - 1 - skip; // include
    let startIndex = endIndex - number + 1; // include
    if (startIndex < 0) {
      startIndex = 0;
    }
    for (let i = endIndex; i >= startIndex; i--) {
      result.push(allTasks[i]);
    }
    return result;
  }
}

export default CrossChainTaskRecords;
