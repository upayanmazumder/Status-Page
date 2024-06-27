/* eslint-disable qwik/loader-location */
import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import config from '../../../data/config.json';
import styles from './timeline.module.css';

interface PingData {
  Timestamp: string;
  Status: string;
  Ping: number;
}

// Define endpoints to fetch data from
const endpoints = ['Google', 'Eraold', 'Github', 'Example'];

// Fetch data for each endpoint
const fetchDataForEndpoint = async (endpoint: string): Promise<PingData[]> => {
  try {
    const response = await fetch(`https://${config.apidomain}/${endpoint.toLowerCase()}`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData.data as PingData[];
  } catch (error) {
    console.error(`Error fetching ${endpoint} ping data:`, error);
    return [];
  }
};

// Route loader to fetch data for all endpoints
export const usePingData = routeLoader$(async () => {
  const allPingData: Record<string, PingData[]> = {};

  // Fetch data for each endpoint sequentially
  for (const endpoint of endpoints) {
    const data = await fetchDataForEndpoint(endpoint.toLowerCase());
    allPingData[endpoint] = data;
  }

  return allPingData;
});

export default component$(() => {
  const allPingData = usePingData();

  // Function to calculate offline status for each day
  const calculateOfflineStatus = (pingData: PingData[], days: number): ('orange' | 'green' | 'grey')[] => {
    const offlineStatus: ('orange' | 'green' | 'grey')[] = [];

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);

      const dataForDate = pingData.find(ping => {
        const pingDate = new Date(ping.Timestamp);
        pingDate.setHours(0, 0, 0, 0);
        return pingDate.getTime() === date.getTime();
      });

      if (dataForDate) {
        const hasOffline = dataForDate.Status !== 'online';
        offlineStatus.unshift(hasOffline ? 'orange' : 'green'); // Color code when data is available
      } else {
        offlineStatus.unshift('grey'); // Grey for days with no data available
      }
    }

    return offlineStatus;
  };

  const daysToShow = 90; // Number of days to show bars for

  return (
    <div class="container container-center">
      {endpoints.map((endpoint, index) => {
        const pingData = allPingData.value[endpoint];
        const barColors = calculateOfflineStatus(pingData, daysToShow);

        return (
          <div key={index} class={styles.section}>
            <p class={styles.heading}>{endpoint} Status</p>
            <div class={styles.wrapper}>
              <div class={styles.barContainer}>
                {barColors.map((color, idx) => (
                  <div
                    key={idx}
                    class={styles.bar}
                    style={{ backgroundColor: color === 'grey' ? '#ccc' : color }}
                  />
                ))}
              </div>
              <div class={styles.footnote}>
                <p>90 days ago</p>
                <div class={styles.line}></div>
                <p>Status</p>
                <div class={styles.line}></div>
                <p>Today</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});
