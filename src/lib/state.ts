import { create } from 'zustand';
import { ClientValues, ProcedureValues, QuoteValues } from "@/lib/schema"; 

interface ClientState {
  clients: ClientValues[];
  setClients: (clients: ClientValues[]) => void;
  getClientById: (id: string) => ClientValues | undefined;
}

export const useClientStore = create<ClientState>((set, get) => ({
  clients: [],
  setClients: (clients) => set({ clients }),
  getClientById: (id) => {
    const clients = get().clients;
    return clients.find(client => client.id === id);
  },
}));

interface ProcedureState {
  procedures: ProcedureValues[];
  setProcedures: (procedures: ProcedureValues[]) => void;
  isProcedureViewActive: boolean;
  setIsProcedureViewActive: (active: boolean) => void;
  getProcedureById: (id: string) => ProcedureValues | undefined;
}

export const useProcedureStore = create<ProcedureState>((set, get) => ({
  procedures: [],
  isProcedureViewActive: false,
  setProcedures: (procedures) => set({ procedures }),
  setIsProcedureViewActive: (active) => set({ isProcedureViewActive: active }),
  getProcedureById: (id) => {
    const procedures = get().procedures;
    return procedures.find(procedure => procedure.id === id);
  },
}));

interface QuoteState {
  quotes: QuoteValues[];
  setQuotes: (quotes: QuoteValues[]) => void;
  addQuote: (quote: QuoteValues) => void;
  updateQuote: (id: string, updatedQuote: QuoteValues) => void;
  deleteQuote: (id: string) => void;
  getQuoteById: (id: string) => QuoteValues | undefined;
}

export const useQuoteStore = create<QuoteState>((set, get) => ({
  quotes: [],
  setQuotes: (quotes) => set({ quotes }),
  addQuote: (quote) => set((state) => ({ quotes: [...state.quotes, quote] })),
  updateQuote: (id, updatedQuote) => set((state) => ({
    quotes: state.quotes.map(quote => (quote.id === id ? updatedQuote : quote))
  })),
  deleteQuote: (id) => set((state) => ({
    quotes: state.quotes.filter(quote => quote.id !== id)
  })),
  getQuoteById: (id) => {
    const quotes = get().quotes;
    return quotes.find(quote => quote.id === id);
  },
}));