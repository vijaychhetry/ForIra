import { useCallback, useEffect, useState } from 'react';
import { loadProgressData, saveProgressData } from './useProgress';

export interface CoinData {
  balance: number;
}

/**
 * Manages Ira's coin balance (earn/spend), persisted to AsyncStorage under
 * the shared 'ira_progress' key (see useProgress.ts).
 */
export function useCoins() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadProgressData().then((data) => {
      if (mounted) {
        setBalance(data.coins);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const getBalance = useCallback(async (): Promise<number> => {
    const fresh = await loadProgressData();
    setBalance(fresh.coins);
    return fresh.coins;
  }, []);

  const addCoins = useCallback(async (amount: number): Promise<number> => {
    if (amount <= 0) {
      return getBalance();
    }
    const fresh = await loadProgressData();
    const newBalance = fresh.coins + amount;
    await saveProgressData({ ...fresh, coins: newBalance });
    setBalance(newBalance);
    return newBalance;
  }, [getBalance]);

  const spendCoins = useCallback(async (amount: number): Promise<boolean> => {
    const fresh = await loadProgressData();
    if (amount <= 0) {
      setBalance(fresh.coins);
      return true;
    }
    if (fresh.coins < amount) {
      setBalance(fresh.coins);
      return false;
    }
    const newBalance = fresh.coins - amount;
    await saveProgressData({ ...fresh, coins: newBalance });
    setBalance(newBalance);
    return true;
  }, []);

  return {
    loading,
    balance,
    getBalance,
    addCoins,
    spendCoins,
  };
}
