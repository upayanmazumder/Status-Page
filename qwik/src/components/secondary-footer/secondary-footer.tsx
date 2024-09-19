import { component$ } from "@builder.io/qwik";
import secFooterStyles from "./secondary-footer.module.css";
import {
  BsFacebook,
  BsGithub,
  BsInstagram,
  BsLinkedin,
  BsTwitter,
  BsYoutube,
} from "@qwikest/icons/bootstrap";
import config from "../../data/config.json";

export default component$(() => {
  const { companyDetails, socialMediaHandles } = config;

  return (
    <footer class={secFooterStyles.footer}>
      <div class={secFooterStyles.container}>
        
        {/** Company Information */}
        <div class={secFooterStyles.boxCompany}>
          <p class={secFooterStyles.title}>Company</p>
          <ul class={secFooterStyles.links}>
            <li><a href="/terms-of-service" class={secFooterStyles.link}>Terms of Service</a></li>
            <li><a href="/privacy-policy" class={secFooterStyles.link}>Privacy Policy</a></li>
            <li><a href="/cookies" class={secFooterStyles.link}>Cookies</a></li>
          </ul>
          <address class={secFooterStyles.address}>
            <p>{companyDetails.companyName}</p>
            <p>{companyDetails.address.street}</p>
            <p>{companyDetails.address.city}, {companyDetails.address.state}, {companyDetails.address.zipCode}</p>
            <p>{companyDetails.address.country}</p>
          </address>
          <li>  
            <a href={`tel:${companyDetails.phoneNumber}`} class={secFooterStyles.phone}>
              {companyDetails.phoneNumber}
            </a>
          </li>
          <li>
            <a href={companyDetails.website} target="_blank" rel="noopener noreferrer" class={secFooterStyles.website}>
              {companyDetails.website}
            </a>
          </li>
        </div>

        {/** Support Information */}
        <div class={secFooterStyles.boxSupport}>
          <p class={secFooterStyles.title}>Support</p>
          <div class={secFooterStyles.emailWrapper}>
            <p>Reach out to: 
              <a href={`mailto:${companyDetails.email}`} class={secFooterStyles.email}>
                {companyDetails.email}
              </a>
            </p>
          </div>

          {/** Social Media Icons */}
          <div class={secFooterStyles.socialIcons}>
            {socialMediaHandles.instagram && (
              <a href={socialMediaHandles.instagram} target="_blank" rel="noopener noreferrer" title="Instagram" class={secFooterStyles.socialIcon}>
                <BsInstagram />
              </a>
            )}
            {socialMediaHandles.youtube && (
              <a href={socialMediaHandles.youtube} target="_blank" rel="noopener noreferrer" title="YouTube" class={secFooterStyles.socialIcon}>
                <BsYoutube />
              </a>
            )}
            {socialMediaHandles.twitter && (
              <a href={socialMediaHandles.twitter} target="_blank" rel="noopener noreferrer" title="Twitter" class={secFooterStyles.socialIcon}>
                <BsTwitter />
              </a>
            )}
            {socialMediaHandles.linkedin && (
              <a href={socialMediaHandles.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" class={secFooterStyles.socialIcon}>
                <BsLinkedin />
              </a>
            )}
            {socialMediaHandles.github && (
              <a href={socialMediaHandles.github} target="_blank" rel="noopener noreferrer" title="GitHub" class={secFooterStyles.socialIcon}>
                <BsGithub />
              </a>
            )}
            {socialMediaHandles.facebook && (
              <a href={socialMediaHandles.facebook} target="_blank" rel="noopener noreferrer" title="Facebook" class={secFooterStyles.socialIcon}>
                <BsFacebook />
              </a>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
});
