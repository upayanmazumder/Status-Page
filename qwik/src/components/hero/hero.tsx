import { component$ } from "@builder.io/qwik";
import styles from "./hero.module.css";
import ImgThunder from "../../media/thunder.png?jsx";

export default component$(() => {
  return (
    <div class={[styles.hero]}>
      <ImgThunder class={styles["hero-image"]} alt="Image thunder" />
      <h1>
        Upayan's <span class="highlight">Status Page</span>
      </h1>
      <p>Stay informed and updated with the latest information.</p>
    </div>
  );
});
