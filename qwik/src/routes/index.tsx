import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import Timeline, { usePingData } from '../components/status/timeline/timeline';
import { usePingdata2 } from '../components/status/announce/announce';
import Hero from "../components/hero/hero";
import StatusAnnouncer from "../components/status/announce/announce";
export default component$(() => {
  return (
    <>
      <div role="presentation" class="ellipsis"></div>
      <StatusAnnouncer />
      <Hero/>
      <Timeline />
    </>
  );
});

export const head: DocumentHead = {
  title: 'Status Page',
  meta: [
    {
      name: 'description',
      content: 'Welcome to the status page',
    },
  ],
};

export { usePingData };
export { usePingdata2 };