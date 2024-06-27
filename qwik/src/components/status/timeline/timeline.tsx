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

  // Function to calculate offline status and uptime percentage for each day
  const calculateOfflineStatus = (pingData: PingData[], days: number): { color: 'orange' | 'green' | 'grey'; date: string; offlineTimes: string[]; uptimePercentage: number }[] => {
    const offlineStatus: { color: 'orange' | 'green' | 'grey'; date: string; offlineTimes: string[]; uptimePercentage: number }[] = [];

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);

      const dataForDate = pingData.filter(ping => {
        const pingDate = new Date(ping.Timestamp);
        pingDate.setHours(0, 0, 0, 0);
        return pingDate.getTime() === date.getTime();
      });

      const formattedDate = new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);

      const offlineIntervals: string[] = [];
      let start: string | null = null;
      let end = null;

      dataForDate.forEach((data, index) => {
        if (data.Status !== 'online') {
          const time = new Date(data.Timestamp).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
          if (start === null) {
            start = time;
            end = time;
          } else {
            end = time;
          }
          // If it's the last data point or the next data point is online, push the interval
          if (index === dataForDate.length - 1 || dataForDate[index + 1].Status === 'online') {
            offlineIntervals.push(`${end}-${start}`);
            start = null;
            end = null;
          }
        }
      });

      let uptimePercentage = 100;
      if (dataForDate.length > 0) {
        const onlineCount = dataForDate.filter(ping => ping.Status === 'online').length;
        uptimePercentage = Math.round((onlineCount / dataForDate.length) * 100);
      }

      if (offlineIntervals.length > 0) {
        offlineStatus.unshift({ color: 'orange', date: formattedDate, offlineTimes: offlineIntervals, uptimePercentage });
      } else if (dataForDate.length > 0) {
        offlineStatus.unshift({ color: 'green', date: formattedDate, offlineTimes: [], uptimePercentage });
      } else {
        offlineStatus.unshift({ color: 'grey', date: formattedDate, offlineTimes: [], uptimePercentage });
      }
    }

    return offlineStatus;
  };

  const daysToShow = 90; // Number of days to show bars for

  return (
    <div class="container container-center">
      {endpoints.map((endpoint, index) => {
        const pingData = allPingData.value[endpoint];
        const barData = calculateOfflineStatus(pingData, daysToShow);

        return (
          <div key={index} class={styles.section}>
            <p class={styles.heading}>{endpoint} Status</p>
            <div class={styles.wrapper}>
              <div class={styles.barContainer}>
                {barData.map((bar, idx) => (
                  <div
                    key={idx}
                    class={styles.bar}
                    title=""
                    data-tooltip={bar.color === 'orange'
                      ? `${bar.date}\nOffline times:\n${bar.offlineTimes.join('\n')}`
                      : bar.color === 'grey'
                        ? `${bar.date}\nNo data available`
                        : `${bar.date}\nNo downtime on this day`}
                    style={{ backgroundColor: bar.color === 'grey' ? '#ccc' : bar.color }}
                  />
                ))}
              </div>
              <div class={styles.footnote}>
                <p>90 days ago</p>
                <div class={styles.line}></div>
                <p>{barData[0]?.uptimePercentage}% uptime</p>
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
