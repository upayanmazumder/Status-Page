import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

import Hero from "../components/hero/hero";
import StatusTimeline from "../components/timeline/timeline"

export default component$(() => {
  return (
    <>
      <Hero />
      <StatusTimeline />
    </>
  );
});

export const head: DocumentHead = {
  title: "Status Page",
  meta: [
    {
      name: "description",
      content: "Monitor the status of our websites!",
    },
  ],
};
