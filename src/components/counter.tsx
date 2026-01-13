import { useCounterStore } from '@/stores/counterStore';

export default function Counter() {
  const { counter, increase, reset } = useCounterStore();

  console.log('rendering counter');

  return (
    <div>
      <h1 className="mb-2">count: {counter}</h1>
      <button className="btn mr-2" onClick={increase}>
        increase
      </button>
      <button className="btn" onClick={reset}>
        reset
      </button>
    </div>
  );
}
