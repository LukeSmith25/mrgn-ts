import { Transaction, VersionedTransaction } from "@solana/web3.js";

import { ExtendedBankInfo, AccountSummary, ActionType } from "@mrgnlabs/marginfi-v2-ui-state";
import { nativeToUi } from "@mrgnlabs/mrgn-common";
import { ActionMessageType, ActionTxns, handleSimulationError } from "@mrgnlabs/mrgn-utils";
import { MarginfiAccountWrapper, SimulationResult } from "@mrgnlabs/marginfi-client-v2";

import {
  ActionSummary,
  SimulatedActionPreview,
  calculateSimulatedActionPreview,
  ActionPreview,
} from "~/components/action-box-v2/utils";
import { QuoteResponse } from "@jup-ag/api";

export interface CalculatePreviewProps {
  simulationResult?: SimulationResult;
  bank: ExtendedBankInfo;
  accountSummary: AccountSummary;
  actionTxns: ActionTxns;
  actionQuote?: QuoteResponse | null;
}

export interface SimulateRepayActionProps {
  txns: (VersionedTransaction | Transaction)[];
  account: MarginfiAccountWrapper;
  bank: ExtendedBankInfo;
}

export function calculateSummary({
  simulationResult,
  bank,
  accountSummary,
  actionTxns,
  actionQuote,
}: CalculatePreviewProps): ActionSummary {
  let simulationPreview: SimulatedActionPreview | null = null;

  if (simulationResult) {
    simulationPreview = calculateSimulatedActionPreview(simulationResult, bank);
  }

  const actionPreview = calculateActionPreview(bank, accountSummary, actionTxns, actionQuote);

  return {
    actionPreview,
    simulationPreview,
  } as ActionSummary;
}

export const getRepaySimulationResult = async (props: SimulateRepayActionProps) => {
  let actionMethod: ActionMessageType | undefined = undefined;
  let simulationResult: SimulationResult | null = null;

  try {
    simulationResult = await simulateFlashLoan(props);
  } catch (error: any) {
    const actionString = "Repaying Collateral";
    actionMethod = handleSimulationError(error, props.bank, false, actionString);
  }

  return { simulationResult, actionMethod };
};

function calculateActionPreview(
  bank: ExtendedBankInfo,
  accountSummary: AccountSummary,
  actionTxns: ActionTxns,
  actionQuote?: QuoteResponse | null
): ActionPreview {
  const positionAmount = bank?.isActive ? bank.position.amount : 0;
  const health = accountSummary.balance && accountSummary.healthFactor ? accountSummary.healthFactor : 1;
  const liquidationPrice =
    bank.isActive && bank.position.liquidationPrice && bank.position.liquidationPrice > 0.01
      ? bank.position.liquidationPrice
      : null;

  const bankCap = nativeToUi(
    false ? bank.info.rawBank.config.depositLimit : bank.info.rawBank.config.borrowLimit,
    bank.info.state.mintDecimals
  );

  const priceImpactPct = actionQuote?.priceImpactPct;
  const slippageBps = actionQuote?.slippageBps;

  return {
    positionAmount,
    health,
    liquidationPrice,
    bankCap,
    priceImpactPct,
    slippageBps,
  } as ActionPreview;
}

async function simulateFlashLoan({ account, bank, txns }: SimulateRepayActionProps) {
  let simulationResult: SimulationResult;

  if (txns.length > 0) {
    simulationResult = await account.simulateBorrowLendTransaction(txns, [bank.address]);
    return simulationResult;
  } else {
    console.error("Failed to simulate flashloan");
    throw new Error("Failed to simulate flashloan");
  }
}
