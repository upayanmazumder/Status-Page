import { component$ } from "@builder.io/qwik";
import logo from "../../media/logo.png";
import styles from "./header.module.css";

export default component$(() => {
  return (
    <header class={styles.header}>
      <div class={["container", styles.wrapper]}>
        <div class={styles.logo}>
          <a href="https://upayan.space" title="Main Website" target="_blank">
            <img src={logo} height={100} width={100} alt="Logo"></img>
          </a>
        </div>
        <ul>
          <li>
            <a
              href="https://github.com/upayanmazumder/Status-Page"
              target="_blank"
            >
              Repository
            </a>
          </li>
          <li>
            <a
              href="https://github.com/upayanmazumder/Status-Page"
              target="_blank"
            >
              Docs
            </a>
          </li>
          <li>
            <a
              href="https://www.paypal.com/paypalme/upayanmazumder"
              target="_blank"
            >
              Support Me
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
});
