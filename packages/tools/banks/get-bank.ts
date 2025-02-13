import dotenv from "dotenv";
import { PublicKey } from "@solana/web3.js";
import { wrappedI80F48toBigNumber } from "@mrgnlabs/mrgn-common";
import { getDefaultYargsOptions, getMarginfiProgram } from "../lib/config";
import { Environment } from "../lib/types";
import { formatNumber } from "../lib/utils";

dotenv.config();

type BankMetadata = {
  bankAddress: string;
  tokenSymbol: string;
};

async function main() {
  const argv = getDefaultYargsOptions()
    .option("address", {
      alias: "a",
      type: "string",
      description: "Bank public key",
    })
    .option("symbol", {
      alias: "s",
      type: "string",
      description: "Token symbol (e.g., 'USDC')",
    })
    .check((argv) => {
      if (!argv.address && !argv.symbol) {
        throw new Error("Either --address or --symbol must be provided");
      }
      if (argv.address && argv.symbol) {
        throw new Error("Please provide either --address or --symbol, not both");
      }
      return true;
    })
    .parseSync();

  const program = getMarginfiProgram(argv.env as Environment);

  const bankMetadataResponse = await fetch("https://storage.googleapis.com/mrgn-public/mrgn-bank-metadata-cache.json");
  const bankMetadata = (await bankMetadataResponse.json()) as BankMetadata[];

  let bankPubkey: PublicKey;
  if (argv.address) {
    bankPubkey = new PublicKey(argv.address);
  } else {
    const bankMeta = bankMetadata.find((meta) => meta.tokenSymbol.toLowerCase() === argv.symbol.toLowerCase());
    if (!bankMeta) {
      throw new Error(`No bank found for symbol: ${argv.symbol}`);
    }
    bankPubkey = new PublicKey(bankMeta.bankAddress);
  }

  const acc = await program.account.bank.fetch(bankPubkey);
  const bankMeta = bankMetadata.find((meta) => meta.bankAddress === bankPubkey.toString());

  const oraclePriceResponse = await fetch(`https://app.marginfi.com/api/oracle/price?banks=${bankPubkey.toString()}`, {
    headers: {
      Referer: "https://app.marginfi.com",
    },
  });
  const oraclePriceData = await oraclePriceResponse.json();

  const totalAssetShares = wrappedI80F48toBigNumber(acc.totalAssetShares);
  const totalLiabilityShares = wrappedI80F48toBigNumber(acc.totalLiabilityShares);
  const assetShareValue = wrappedI80F48toBigNumber(acc.assetShareValue);
  const liabilityShareValue = wrappedI80F48toBigNumber(acc.liabilityShareValue);

  const scaleFactor = Math.pow(10, acc.mintDecimals);
  const totalAssetQuantity = totalAssetShares.times(assetShareValue).div(scaleFactor);
  const totalLiabilityQuantity = totalLiabilityShares.times(liabilityShareValue).div(scaleFactor);

  const bankData = {
    Address: bankPubkey.toString(),
    Mint: acc.mint.toString(),
    Symbol: bankMeta?.tokenSymbol,
    Decimals: acc.mintDecimals,
    Price: `$${formatNumber(Number(oraclePriceData[0].priceRealtime.price))}`,
    "Asset Tag": acc.config.assetTag,
    "Asset Share Value": formatNumber(assetShareValue),
    "Liability Share Value": formatNumber(liabilityShareValue),
    "Asset Quantity": formatNumber(totalAssetQuantity),
    "Asset Value (USD)": `$${formatNumber(totalAssetQuantity.times(oraclePriceData[0].priceRealtime.price))}`,
    "Liability Quantity": formatNumber(totalLiabilityQuantity),
    "Liability Value (USD)": `$${formatNumber(totalLiabilityQuantity.times(oraclePriceData[0].priceRealtime.price))}`,
  };

  console.log(`\r\nBank: ${bankPubkey.toString()}`);
  console.table(bankData);
}

main().catch((err) => {
  console.error(err);
});
