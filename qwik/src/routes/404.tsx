import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
export default component$(() => {
  return (
    <>
    <div class="container container-center">
      <div role="presentation" class="ellipsis ellipsis-404"></div>
      <h2>404 - Not Found</h2>
      <p>The page you are looking for does not exist!</p>
    </div>
    </>
  );
});

export const head: DocumentHead = {
  title: "404 Not Found",
  meta: [
    {
      name: "description",
      content: "This page does not exist",
    },
  ],
};