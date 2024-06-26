/* eslint-disable qwik/loader-location */
import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import config from '../../../data/config.json';

interface PingData {
  Timestamp: string;
  Status: string;
  Ping: number;
}

export const usePingData = routeLoader$(async () => {
  try {
    const response = await fetch(`https://${config.apidomain}/github`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData.data as PingData[];
  } catch (error) {
    console.error('Error fetching GitHub ping data:', error);
    return [];
  }
});

export default component$(() => {
  const pingData = usePingData();

  return (
    <section class="section bright">
      <h2>Github Ping Data</h2>
      <ul>
        {pingData.value.map((ping, index) => (
          <li key={index}>
            <p>Timestamp: {ping.Timestamp}</p>
            <p>Status: {ping.Status}</p>
            <p>Ping: {ping.Ping}</p>
          </li>
        ))}
      </ul>
    </section>
  );
});
