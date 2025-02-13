import React from "react";
import Image from "next/image";
import Link from "next/link";

import { percentFormatter, dynamicNumeralFormatter, shortenAddress } from "@mrgnlabs/mrgn-common";
import { cn } from "@mrgnlabs/mrgn-utils";

import { useTradeStoreV2 } from "~/store";
import { ArenaPoolSummary } from "~/types/trade-store.types";
import { mfiAddresses } from "~/utils/arenaUtils";

import { Button } from "~/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { minidenticon } from "minidenticons";

type PoolListItemProps = {
  poolData: ArenaPoolSummary;
  last?: boolean;
};

export const PoolListItem = ({ poolData, last }: PoolListItemProps) => {
  const [tokenDataByMint, groupsByGroupPk] = useTradeStoreV2((state) => [state.tokenDataByMint, state.groupsByGroupPk]);

  const { tokenData, quoteTokenData } = React.useMemo(() => {
    const tokenData = tokenDataByMint[poolData.tokenSummary.mint.toBase58()];
    const quoteTokenData = tokenDataByMint[poolData.quoteSummary.mint.toBase58()];
    return { tokenData, quoteTokenData };
  }, [poolData, tokenDataByMint]);

  const fundingRate = React.useMemo(() => {
    const fundingRateShort =
      (poolData.tokenSummary.bankData.borrowRate - poolData.quoteSummary.bankData.depositRate) / 100;
    const fundingRateLong =
      (poolData.quoteSummary.bankData.borrowRate - poolData.tokenSummary.bankData.depositRate) / 100;
    return `${percentFormatter.format(fundingRateLong)} / ${percentFormatter.format(fundingRateShort)}`;
  }, [
    poolData.tokenSummary.bankData.borrowRate,
    poolData.tokenSummary.bankData.depositRate,
    poolData.quoteSummary.bankData.depositRate,
    poolData.quoteSummary.bankData.borrowRate,
  ]);

  const groupData = React.useMemo(
    () => groupsByGroupPk[poolData.groupPk.toBase58()],
    [groupsByGroupPk, poolData.groupPk]
  );

  const mfiCreated = React.useMemo(() => {
    if (!groupData) return false;
    return mfiAddresses.includes(groupData.admin.toBase58());
  }, [groupData]);

  return (
    <div className={cn("grid grid-cols-7 py-2 w-full items-center", !last && "border-b pb-3 mb-2")}>
      <div className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={poolData.tokenSummary.tokenLogoUri}
          alt={poolData.tokenSummary.tokenSymbol}
          width={32}
          height={32}
          className="rounded-full bg-background"
        />
        <h2>
          {poolData.tokenSummary.tokenSymbol}/{poolData.quoteSummary.tokenSymbol}
        </h2>
      </div>
      {tokenData && (
        <>
          <div className="flex items-center gap-2">
            <div className="flex flex-col">
              $
              {dynamicNumeralFormatter(tokenData.price / quoteTokenData.price, {
                ignoreMinDisplay: true,
              })}
            </div>
            <span className={cn("text-xs", tokenData.priceChange24h > 0 ? "text-mrgn-success" : "text-mrgn-error")}>
              {tokenData.priceChange24h > 0 && "+"}
              {percentFormatter.format(tokenData.priceChange24h / 100)}
            </span>
          </div>
          <div>
            $
            {dynamicNumeralFormatter(tokenData.volume24h, {
              maxDisplay: 1000,
            })}
            {tokenData.volumeChange24h && (
              <span
                className={cn("text-xs ml-2", tokenData.volumeChange24h > 0 ? "text-mrgn-success" : "text-mrgn-error")}
              >
                {tokenData.volumeChange24h > 0 && "+"}
                {percentFormatter.format(tokenData.volumeChange24h / 100)}
              </span>
            )}
          </div>
          <div>{fundingRate}</div>
          <div>
            $
            {dynamicNumeralFormatter(
              poolData.quoteSummary.bankData.totalDepositsUsd + poolData.tokenSummary.bankData.totalDepositsUsd,
              {
                maxDisplay: 1000,
              }
            )}
          </div>
        </>
      )}
      <div className="pl-5">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-[20px] h-[20px] rounded-full object-cover bg-muted cursor-pointer">
                {mfiCreated ? (
                  <Link href="https://x.com/marginfi" target="_blank">
                    <Image
                      src="https://storage.googleapis.com/mrgn-public/mrgn-icon-small.jpg"
                      width={20}
                      height={20}
                      alt="marginfi"
                      className="rounded-full"
                    />
                  </Link>
                ) : (
                  <Link href={`https://solscan.io/address/${groupData.admin.toBase58()}`} target="_blank">
                    <Image
                      src={"data:image/svg+xml;utf8," + encodeURIComponent(minidenticon(groupData.admin.toBase58()))}
                      alt="minidenticon"
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  </Link>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {mfiCreated ? (
                <p>
                  Pool created by{" "}
                  <Link
                    href="https://x.com/marginfi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    marginfi
                  </Link>
                </p>
              ) : (
                <p>
                  Pool created by{" "}
                  <Link
                    href={`https://solscan.io/address/${groupData.admin.toBase58()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:no-underline"
                  >
                    {shortenAddress(groupData.admin)}
                  </Link>
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <Link href={`/trade/${poolData.groupPk.toBase58()}?side=long`} className="w-full">
          <Button variant="long" className="w-full">
            Long
          </Button>
        </Link>
        <Link href={`/trade/${poolData.groupPk.toBase58()}?side=short`} className="w-full">
          <Button variant="short" className="w-full">
            Short
          </Button>
        </Link>
      </div>
    </div>
  );
};
