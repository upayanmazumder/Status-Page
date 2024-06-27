import { component$ } from "@builder.io/qwik";
import socialstyles from "./socials.module.css";
import { BsDiscord, BsInstagram, BsGithub, BsLinkedin } from "@qwikest/icons/bootstrap";

export default component$(() => {
  return (
    <div class={socialstyles.socialIcons}>
      <a href="https://discord.com/users/1240025366853193758" class={socialstyles.iconLink} title="Contact me via discord!" target="_blank">
        <BsDiscord class={socialstyles.icon} />
      </a>

      <a href="https://www.instagram.com/_._upayan_._/" class={socialstyles.iconLink} title="Follow me on Instagram!" target="_blank">
        <BsInstagram class={socialstyles.icon} />
      </a>

      <a href="https://github.com/upayanmazumder" class={socialstyles.iconLink} title="Follow me on Github!" target="_blank">
        <BsGithub class={socialstyles.icon} />
      </a>

      <a href="https://www.linkedin.com/in/upayanmazumder/" class={socialstyles.iconLink} title="Connect with me on Linkedin!" target="_blank">
        <BsLinkedin class={socialstyles.icon} />
      </a>
    </div>
  );
});
