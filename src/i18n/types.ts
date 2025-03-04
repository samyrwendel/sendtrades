export interface Translation {
  common: {
    // ... existing code ...
    loading: string;
    save: string;
    cancel: string;
  };
  errors: {
    // ... existing code ...
    failedToLoadPairs: string;
    tradingPairsError: string;
  };
  trading: {
    pair: string;
    base: string;
    quote: string;
    available: string;
    locked: string;
    tradingPair: string;
  };
  bots: {
    // ... existing code ...
    editBot: string;
    editBotDescription: string;
    botName: string;
    accountBalances: string;
  };
}; 