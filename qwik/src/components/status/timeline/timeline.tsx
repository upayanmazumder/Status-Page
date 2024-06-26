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

export const usePingData = routeLoader$(async () => {
  try {
    const response = await fetch(`https://${config.apidomain}/google`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData.data as PingData[];
  } catch (error) {
    console.error('Error fetching Google ping data:', error);
    return []; // Return empty array on error
  }
});

export default component$(() => {
  const pingData = usePingData();

  // Function to calculate offline status for each day
  const calculateOfflineStatus = (pingData: PingData[], days: number): ('orange' | 'green' | 'grey')[] => {
    const offlineStatus: ('orange' | 'green' | 'grey')[] = [];

    // Get the current date
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to beginning of the day

    // Iterate over last 'days' days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i); // Calculate the date for this iteration

      // Find the matching data for this date
      const dataForDate = pingData.find(ping => {
        const pingDate = new Date(ping.Timestamp);
        pingDate.setHours(0, 0, 0, 0); // Set to beginning of the day
        return pingDate.getTime() === date.getTime();
      });

      if (dataForDate) {
        // Check if there are offline events on this date
        const hasOffline = dataForDate.Status !== 'online'; // Adjust according to your 'Status' field
        offlineStatus.unshift(hasOffline ? 'orange' : 'green'); // Insert at the beginning
      } else {
        offlineStatus.unshift('grey'); // Insert grey color for days with no data
      }
    }

    return offlineStatus; // Return the array in the correct order
  };

  const daysToShow = 90; // Number of days to show bars for
  const barColors = calculateOfflineStatus(pingData.value, daysToShow);

  return (
    <div class="container container-center">
      <div class={styles.section}>
        <p class={styles.heading}>Google Status</p>
        <div class={styles.barContainer}>
          {barColors.map((color, index) => (
            <div
              key={index}
              class={styles.bar}
              style={{ backgroundColor: color === 'grey' ? '#ccc' : color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
});
