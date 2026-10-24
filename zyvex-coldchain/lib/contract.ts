
import {
  BrowserProvider,
  Contract,
  isAddress,
} from 'ethers';

export const LEDGER_ABI = [
  'function anchor(bytes32 batchHash) external',
  'function verify(bytes32 batchHash) external view returns (bool exists, uint256 timestamp, address sender)',
  'event BatchAnchored(bytes32 indexed batchHash, address indexed sender, uint256 timestamp)',
];

const SEPOLIA_CHAIN_ID = 11155111n;

export function getContractAddress(): string {
  return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.trim() ?? '';
}
function getHashKey(hashHex: string): string {
  const cleanHash = hashHex.trim().replace(/^0x/i, '');

  if (!/^[0-9a-fA-F]{64}$/.test(cleanHash)) {
    throw new Error(
      'Invalid batch hash. Expected exactly 32 bytes (64 hexadecimal characters).'
    );
  }

  return `0x${cleanHash}`;
}

function validateContractAddress(): string {
  const address = getContractAddress();

  if (!isAddress(address)) {
    throw new Error(
      'Missing or invalid NEXT_PUBLIC_CONTRACT_ADDRESS in .env.local.'
    );
  }

  return address;
}

export async function connectWallet(): Promise<{
  provider: BrowserProvider;
  account: string;
  chainId: bigint;
}> {
  const ethereum = (
    window as Window & {
      ethereum?: {
        request: (args: {
          method: string;
          params?: unknown[];
        }) => Promise<unknown>;
      };
    }
  ).ethereum;

  if (!ethereum) {
    throw new Error(
      'MetaMask was not found. Install MetaMask or open this app in a supported wallet browser.'
    );
  }

  await ethereum.request({ method: 'eth_requestAccounts' });

 
const provider = new BrowserProvider(ethereum as never);
const signer = await provider.getSigner();
const network = await provider.getNetwork();

const chainIdHex = await ethereum.request({
  method: 'eth_chainId',
});

const actualChainId = BigInt(chainIdHex as string);

if (actualChainId !== SEPOLIA_CHAIN_ID) {
  throw new Error(
    `Wrong network. Detected chain ID: ${actualChainId}. ` +
    'Switch MetaMask to Sepolia (11155111).'
  );
}

  return {
    provider,
    account: await signer.getAddress(),
    chainId: network.chainId,
  };
}

export async function anchorHash(
  hashHex: string
): Promise<{
  txHash: string;
  account: string;
  chainId: bigint;
}> {
  const address = validateContractAddress();
  const batchHash = getHashKey(hashHex);

  const { provider, account, chainId } = await connectWallet();
  const signer = await provider.getSigner();

  const contract = new Contract(address, LEDGER_ABI, signer);

  const tx = await contract.getFunction('anchor')(batchHash);
  const receipt = await tx.wait();

  if (!receipt || receipt.status !== 1) {
    throw new Error(
      'The blockchain transaction failed or was not confirmed.'
    );
  }

  return {
    txHash: receipt.hash,
    account,
    chainId,
  };
}

export async function checkAnchoredHash(
  hashHex: string
): Promise<{
  exists: boolean;
  timestamp: bigint;
  sender: string;
  chainId: bigint;
}> {
  const address = validateContractAddress();
  const batchHash = getHashKey(hashHex);

  const { provider, chainId } = await connectWallet();

  const contract = new Contract(address, LEDGER_ABI, provider);

  const result = await contract.getFunction('verify')(batchHash);

  return {
    exists: Boolean(result[0]),
    timestamp: BigInt(result[1]),
    sender: String(result[2]),
    chainId,
  };
}
