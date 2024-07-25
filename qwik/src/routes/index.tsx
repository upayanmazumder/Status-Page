import { component$ } from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import Timeline, { usePingData } from '../components/status/timeline/timeline';
import Hero from "../components/hero/hero";
import CurrentTime from "../components/current-time/current-time";
export default component$(() => {
  return (
    <>
      <div role="presentation" class="ellipsis"></div>
      <Hero/>
      <Timeline />
      <CurrentTime />
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