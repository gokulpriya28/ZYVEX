export type ChainHealth = { configured: boolean; walletConnected: boolean; expectedChainId: number; actualChainId?: number };
export function chainReady(state: ChainHealth): boolean { return state.configured && state.walletConnected && state.actualChainId === state.expectedChainId; }
