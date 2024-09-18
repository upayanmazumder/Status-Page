import { component$ } from "@builder.io/qwik";
import secFooterStyles from "./secondary-footer.module.css";

export default component$(() => {

  return (
    <footer>
      <div class="container container-center">
        <div class={secFooterStyles.container}>

          {/**Company Box*/}
          <div class={secFooterStyles.boxCompany}>
            <p class={secFooterStyles.h2}>Company</p>
            <ul>
              <li><a href='/terms-of-service'>Terms of Service</a></li>
              <li><a href='/privacy-policy'>Privacy Policy</a></li>
              <li><a href='/cookies'>Cookies</a></li>
            </ul>
          </div>

          {/**Support Box */}
          <div class={secFooterStyles.boxSupport}>

            <p class={secFooterStyles.h2}>Support</p>
            {/**Top Part - Resources*/}
            <div class={secFooterStyles.boxSupportResources}>
              Reach out to upayan@upayan.space
            </div>

            {/**Bottom Part - Social Media Icons */}
            <div class={secFooterStyles.boxSupportSocials}>

            </div>
          </div>

        </div>
      </div>
    </footer>
  );
});
