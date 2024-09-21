import { component$, useTask$, useStore } from '@builder.io/qwik';

interface WebsiteStatus {
  domain: string;
  shortName: string;
  longName: string;
  description: string;
}

interface SiteDetails extends WebsiteStatus {
  data?: {
    date: string;
    status: string | number;
    downtimePeriods: { start: string; end: string }[] | null;
  }[];
}

export default component$(() => {
  const state = useStore<{ websites: SiteDetails[]; error: string | null }>({
    websites: [],
    error: null,
  });

  useTask$(async () => {
    try {
      const response = await fetch('https://status-page-api.upayan.space/');
      if (response.ok) {
        const websites: WebsiteStatus[] = await response.json();
        state.websites = websites;

        // Fetch additional data for each site
        await Promise.all(
          websites.map(async (site) => {
            try {
              const siteResponse = await fetch(
                `https://status-page-api.upayan.space/sites/${site.shortName}`
              );
              if (siteResponse.ok) {
                const siteData = await siteResponse.json();
                // Merge fetched data into the state
                const matchingSite = state.websites.find(
                  (w) => w.shortName === site.shortName
                );
                if (matchingSite) {
                  matchingSite.data = siteData.data;
                }
              }
            } catch (siteError) {
              console.error(`Failed to fetch details for ${site.shortName}:`, siteError);
            }
          })
        );
      } else {
        state.error = `Error: ${response.status} - ${response.statusText}`;
      }
    } catch (error) {
      state.error = 'Failed to fetch data';
    }
  });

  return (
    <div>
      <h1>Website Status</h1>
      {state.error ? (
        <p>{state.error}</p>
      ) : (
        <ul>
          {state.websites.map((site) => (
            <li key={site.domain}>
              <h2>{site.longName}</h2>
              <p>{site.description}</p>
              <p>
                <strong>Domain:</strong> {site.domain}
              </p>
              <div class="status-bars">
                {site.data ? (
                  site.data.map((statusEntry, index) => {
                    const barColor = getBarColor(statusEntry);
                    return (
                      <div
                        key={index}
                        class="status-bar"
                        style={{
                          backgroundColor: barColor,
                          height: '20px',
                          width: '15px',
                          display: 'inline-block',
                          margin: '0 2px',
                        }}
                        title={`Date: ${statusEntry.date}, Status: ${
                          statusEntry.status === 0 ? 'UP' : 'DOWN'
                        }`}
                      ></div>
                    );
                  })
                ) : (
                  <p>Loading status data...</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  // Helper function to determine the bar color
  function getBarColor(statusEntry: {
    status: string | number;
    downtimePeriods: { start: string; end: string }[] | null;
  }): string {
    if (statusEntry.status === 0) {
      return 'green'; // UP
    } else if (statusEntry.status === 'DOWN') {
      if (statusEntry.downtimePeriods && statusEntry.downtimePeriods.length > 0) {
        const fullDay = statusEntry.downtimePeriods.every(
          (period) =>
            new Date(period.start).getHours() === 0 &&
            new Date(period.end).getHours() === 23 &&
            new Date(period.end).getMinutes() === 59 &&
            new Date(period.end).getSeconds() === 59
        );
        return fullDay ? 'red' : 'orange'; // Full-day DOWN vs Partial DOWN
      }
    }
    return 'gray'; // No data or unknown status
  }
});
