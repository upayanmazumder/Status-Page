/* eslint-disable qwik/loader-location */
import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import config from '../../../data/config.json';
import styles from './announce.module.css';

interface Pingdata2 {
  Timestamp: string;
  Status: string;
  Ping: number;
}

interface EndpointDetails {
  shortName: string;
  domain: string;
  longName: string;
  description: string;
}

// Fetch available routes from the API
const fetchAvailableRoutes = async (): Promise<string[]> => {
  try {
    const response = await fetch(`https://${config.apidomain}/`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data. HTTP error: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData.availableRoutes as string[];
  } catch (error) {
    console.error('Error fetching available routes:', error);
    return [];
  }
};

// Fetch data for an endpoint including ping data and details
const fetchDataForEndpoint = async (endpoint: string): Promise<{ Pingdata2: Pingdata2[], details: EndpointDetails }> => {
  try {
    const response = await fetch(`https://${config.apidomain}${endpoint}`, {
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data for ${endpoint}. HTTP error: ${response.status}`);
    }

    const responseData = await response.json();
    const { shortName, domain, longName, description, data } = responseData;

    return {
      Pingdata2: data as Pingdata2[],
      details: { shortName, domain, longName, description }
    };
  } catch (error) {
    console.error(`Error fetching ${endpoint} data:`, error);
    return { Pingdata2: [], details: {} as EndpointDetails };
  }
};

// Route loader to fetch data for all available routes
export const usePingdata2 = routeLoader$<Record<string, { Pingdata2: Pingdata2[], details: EndpointDetails }>>(async () => {
  const availableRoutes = await fetchAvailableRoutes();
  const allData: Record<string, { Pingdata2: Pingdata2[], details: EndpointDetails }> = {};

  // Fetch data for each available route concurrently
  await Promise.all(availableRoutes.map(async (route) => {
    const { Pingdata2, details } = await fetchDataForEndpoint(route.toLowerCase());
    allData[route] = { Pingdata2, details };
  }));

  return allData;
});

export default component$(() => {
  const allData = usePingdata2();

  // Function to check if the endpoint is currently down
  const isEndpointDown = (Pingdata2: Pingdata2[]): boolean => {
    if (Pingdata2.length === 0) return true;
    const firstPing = Pingdata2[0];
    return firstPing.Status !== 'online';
  };

  // Filter endpoints by status
  const downEndpoints: string[] = [];
  const upEndpoints: string[] = [];

  Object.keys(allData.value).forEach(endpoint => {
    const { Pingdata2 } = allData.value[endpoint];
    if (isEndpointDown(Pingdata2)) {
      downEndpoints.push(allData.value[endpoint].details.longName);
    } else {
      upEndpoints.push(allData.value[endpoint].details.longName);
    }
  });

  // Determine container class based on endpoint status
  let containerClass = styles.container;
  if (downEndpoints.length > 0) {
    containerClass += ` ${styles.error}`;
  } else if (upEndpoints.length === Object.keys(allData.value).length) {
    containerClass += ` ${styles.normal}`;
  } else {
    containerClass += ` ${styles.warning}`;
  }

  // Generate message based on endpoint status
  let message = '';

  if (downEndpoints.length === 1) {
    message = `Our ${downEndpoints[0]} is currently experiencing an issue, and we are actively addressing it.`;
    if (upEndpoints.length > 0) {
      message += ` Our other services (${upEndpoints.join(', ')}) are operational and functioning correctly.`;
    }
  } else if (downEndpoints.length > 1) {
    message = `We are currently experiencing issues with ${downEndpoints.length} services (${downEndpoints.join(', ')}). Our team is working diligently to resolve these issues.`;
    if (upEndpoints.length > 0) {
      message += ` Meanwhile, other services (${upEndpoints.join(', ')}) are operating normally.`;
    }
  } else {
    message = `All services (${upEndpoints.join(', ')}) are operating normally.`;
  }

  return <p class={containerClass}>{message}</p>;
});
