/* eslint-disable qwik/jsx-a */
import { component$, useStore } from "@builder.io/qwik";
import styles from "./footer.module.css";
import packageJson from '../../../../package.json';

export const Footer = component$(() => {
  const store = useStore({ version: packageJson.version });

  return (
    <footer class={styles.footer}>
      <a class={styles.anchor}>
        <span>&copy; Status Page {new Date().getFullYear()}</span>
      </a>
      <p class={styles.version}>v{store.version}</p>
    </footer>
  );
});

export default Footer;
