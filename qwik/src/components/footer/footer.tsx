/* eslint-disable qwik/jsx-a */
import { component$, useStore } from "@builder.io/qwik";
import styles from "./footer.module.css";
import packageJson from '../../../../package.json';

export const Footer = component$(() => {
  const store = useStore({ version: packageJson.version });

  return (
    <footer class={styles.footer}>
      <p class={styles.anchor}>
        <span>&copy; Status Page {new Date().getFullYear()}</span>
      </p>
      <p class={styles.version}>
        Version {store.version}
      </p>
    </footer>
  );
});

export default Footer;
