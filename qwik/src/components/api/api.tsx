import { component$, useSignal, useTask$, $ } from "@builder.io/qwik";
import apiStyles from "./api.module.css";
import config from "../../data//config.json"

export default component$(() => {
  const apiStatus = useSignal<'loading' | 'online' | 'offline'>('loading');
  const isVisible = useSignal(false); // Start with false to not show the notification initially
  const {domain} = config.api;

  // Convert fetchWithTimeout to a QRL function using $
  const fetchWithTimeout = $((url: string, timeout: number) => {
    return Promise.race([
      fetch(url),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), timeout))
    ]);
  });

  // Make the API request with a timeout of 5 seconds
  useTask$(async () => {
    try {
      const response = await fetchWithTimeout(`https://${domain}/`, 5000);
      if (response instanceof Response && response.ok) {
        apiStatus.value = 'online';
        isVisible.value = false; // Hide notification if online
      } else {
        apiStatus.value = 'offline';
        isVisible.value = true; // Show notification if offline
      }
    } catch (error) {
      apiStatus.value = 'offline';
      isVisible.value = true; // Show notification if there's an error
    }
  });

  return (
    isVisible.value && (
      <div class={apiStyles.apiStatus}>
        {apiStatus.value === 'loading' && <p>Checking API status...</p>}
        {apiStatus.value === 'offline' && (
          <p>
            <span class={apiStyles.offlineIcon}>🔴</span> API is Offline
          </p>
        )}
        <button class={apiStyles.closeButton} onClick$={() => (isVisible.value = false)}>✖</button>
      </div>
    )
  );
});
