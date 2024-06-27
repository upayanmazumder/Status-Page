import { component$ } from "@builder.io/qwik";
import QwikLogo from "../../media/icon.png?jsx";
import { BsGithub, BsCodeSlash } from "@qwikest/icons/bootstrap";
import config from '../../data/config.json';
import styles from "./header.module.css";

export default component$(() => {
  const apiLink = `https://${config.apidomain}`;
  return (
    <header class={styles.header}>
      <div class={styles.logo}>
        <QwikLogo />
      </div>
      <h1><a href="https://upayan.space" target="_blank">Status Page</a></h1>
      <ul>
        <li>
          <a href="https://github.com/upayanmazumder/Status-Page" target="_blank"><BsGithub/> Repository</a>
        </li>
        <li>
          <a href={apiLink} target="_blank"><BsCodeSlash/> Api</a>
        </li>
      </ul>
    </header>
  );
});
