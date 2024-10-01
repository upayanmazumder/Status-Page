import { component$ } from "@builder.io/qwik";
import styles from "./footer.module.css";

export default component$(() => {
  return (
    <footer>
      <div class="container">
        <a href="https://upayan.space/" target="_blank" class={styles.anchor}>
          <span>Made with ♡ by Upayan</span>
        </a>
      </div>
    </footer>
  );
});
