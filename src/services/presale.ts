import type { Address } from "viem";
import { readContract, simulateContract, waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { wagmiConfig } from "@/web3/wagmi";
import { erc20Abi } from "@/contracts/erc20Abi";
import { tokenPresaleAbi } from "@/contracts/tokenPresaleAbi";

export async function approveErc20(params: {
  token: Address;
  spender: Address;
  amount: bigint;
}): Promise<`0x${string}`> {
  const hash = await writeContract(wagmiConfig, {
    abi: erc20Abi,
    address: params.token,
    functionName: "approve",
    args: [params.spender, params.amount],
    gas: 100000n, // Set reasonable gas limit for ERC20 approval
  });
  await waitForTransactionReceipt(wagmiConfig, {
    hash,
    confirmations: 1,
    pollingInterval: 4_000,
    timeout: 120_000, // 2 minutes — Sepolia can be slow
  });
  return hash;
}

export async function buyWithToken(params: {
  presale: Address;
  paymentToken: Address;
  paymentAmount: bigint;
  minExpectedTokens: bigint;
}): Promise<`0x${string}`> {
  // Simulate the transaction first to catch any contract errors
  const { request } = await simulateContract(wagmiConfig, {
    abi: tokenPresaleAbi,
    address: params.presale,
    functionName: "buyWithToken",
    args: [params.paymentToken, params.paymentAmount, params.minExpectedTokens],
  });

  // @ts-ignore - Wagmi v2 type inference creates complex unions for request that writeContract rejects broadly
  const hash = await writeContract(wagmiConfig, request);
  await waitForTransactionReceipt(wagmiConfig, {
    hash,
    confirmations: 1,
    pollingInterval: 4_000,
    timeout: 120_000, // 2 minutes — Sepolia can be slow
  });
  return hash;
}

export async function getAllowance(params: {
  token: Address;
  owner: Address;
  spender: Address;
}): Promise<bigint> {
  return readContract(wagmiConfig, {
    abi: erc20Abi,
    address: params.token,
    functionName: "allowance",
    args: [params.owner, params.spender],
  });
}

