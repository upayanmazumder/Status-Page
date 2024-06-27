/* eslint-disable qwik/jsx-a */
import { component$ } from "@builder.io/qwik";
import styles from "./secondary-footer.module.css";
import { LuFolderKanban, LuLayers } from "@qwikest/icons/lucide";
import { BsBuilding } from "@qwikest/icons/bootstrap";
import Socials from "../socials/socials";

export default component$(() => {

  return (
    <div class={styles.secondaryFooter}>
      {/*KSP-C Section */}
      <div class={styles.column}>
        <a class={styles.columnheading}>
        <BsBuilding /> Company
        </a>
        <ul class={styles.columnlinks}>
          <li>
            <a
              href="https://upayan.space"
              target="_blank"
              >
              About me
            </a>
          </li>
          <li>
            <a
              href="/terms-of-service"
              >
              Terms of Service
            </a>
          </li>
          <li>
            <a
              href="/privacy-policy"
              >
              Privacy Policy
            </a>
          </li>
          <li>
            <a href="mailto:mail@upayan.space">
              Contact me
            </a>
          </li>
        </ul>
      </div>

      {/*Products Section */}
      <div class={styles.column}>
        <a class={styles.columnheading}>
          <LuFolderKanban /> Products
        </a>
        <ul class={styles.columnlinks}>
          <li>
            <a
              href="product-1"
              target="_blank"
              >
              Product 1
            </a>
          </li>
          <li>
            <a
              href="/product-2"
              target="_blank"
              >
              Product 2
            </a>
          </li>
        </ul>
      </div>

      {/*Resources Section */}
      <div class={styles.column}>
        <a class={styles.columnheading}>
          <LuLayers /> Resources
        </a>
        <ul class={styles.columnlinks}>
          <li>
            <a
              href="https://upayan.space"
              target="_blank"
              >
              My website
            </a>
          </li>
          <li>
            <a
              href="https://github.com/upayanmazumder"
              target="_blank"
              >
              Open Source
            </a>
          </li>
        </ul>
      </div>

      <div class={styles.column}>
        <Socials />
      </div>

    </div>
  );
});
