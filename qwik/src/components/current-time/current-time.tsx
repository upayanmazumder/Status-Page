import { component$, useStore, useVisibleTask$ } from '@builder.io/qwik';

export const CurrentTime = component$(() => {
  const state = useStore({
    utcTime: new Date().toISOString(),
    localTime: new Date().toLocaleString(),
  });

  useVisibleTask$(() => {
    const updateTimes = () => {
      const now = new Date();
      state.utcTime = now.toISOString();
      state.localTime = now.toLocaleString();
    };

    const intervalId = setInterval(updateTimes, 1000);
    updateTimes();

    return () => clearInterval(intervalId);
  });

  return (
    <div>
      <h2>Current Time</h2>
      <p><strong>UTC:</strong> {state.utcTime}</p>
      <p><strong>Local Time:</strong> {state.localTime}</p>
    </div>
  );
});

export default CurrentTime;