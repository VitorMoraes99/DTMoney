import { createContext, ReactNode, useEffect, useState } from 'react';
import { api } from '../lib/axios';

interface Transaction {
  id: number;
  description: string;
  type: 'income' | 'outcome';
  price: number;
  category: string;
  createdAt: string | null;
}

interface CreateTransactionInput {
  description: string,
   price: number,
   category: string,
   type: 'income'|'outcome',
}

interface TransactionContextType {
  transactions: Transaction[];
  fetchTransactions: (query?: string) => Promise<void>;
  createTransaction: (data: CreateTransactionInput) => Promise<void>;
}
interface TransactionsProviderProps {
  children: ReactNode
}

export const TransactionsContext = createContext({} as TransactionContextType)

export function TransactionsProvider({ children }: TransactionsProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  async function fetchTransactions(query?: string) {
    const response = await api.get<Transaction[]>('transactions', {
      params: {
        _sort: 'createdAt',
        _order: 'desc',
        q: query,
      },
    });
  
    const formattedTransactions = response.data.map((transaction) => ({
      ...transaction,
      createdAt: transaction.createdAt
        ? new Date(transaction.createdAt).toISOString()
        : null,
    }));
  
    setTransactions(formattedTransactions);
  }
  

  async function createTransaction(data: CreateTransactionInput) {
    const { description, price, category, type } = data;
  
    const response = await api.post<Transaction>('transactions', {
      description,
      price,
      category,
      type,
      createdAt: new Date().toISOString(),
    });
  
    setTransactions((state) => [response.data, ...state]);
  }
  

  useEffect(() => {
    fetchTransactions()
  }, []);
  return (
    <TransactionsContext.Provider value={{ 
      transactions, 
      fetchTransactions,
      createTransaction,
    }}>
      {children}
    </TransactionsContext.Provider>
  );
}