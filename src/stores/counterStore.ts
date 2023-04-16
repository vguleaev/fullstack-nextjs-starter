import { create } from 'zustand';

type CounterStore = {
  counter: number;
  increase: () => void;
  reset: () => void;
};

const useCounterStore = create<CounterStore>((set) => ({
  counter: 0,
  increase: () => set((state: CounterStore) => ({ counter: state.counter + 1 })),
  reset: () => set({ counter: 0 }),
}));

export { useCounterStore };
