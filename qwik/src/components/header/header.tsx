import { component$ } from "@builder.io/qwik";
import logo from "../../media/logo.png";
import styles from "./header.module.css";
import config from "../../data/config.json";

export default component$(() => {
  const { headerLinks, header, companyDetails } = config;

  return (
    <header class={styles.header}>
      <div class={["container", styles.wrapper]}>
        <a href={companyDetails.website} title={companyDetails.companyName} target="_blank">
          <div class={styles.branding}>
            <div class={styles.logo}><img src={logo} height={100} width={100} alt="Logo"></img></div>
            <h2 class={styles.title}>{header.title}</h2>
          </div>
        </a>
        <ul>
          {Object.entries(headerLinks).map(([name, url]) => (
            <li key={name}>
              <a href={url} target="_blank">
                {name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
});
