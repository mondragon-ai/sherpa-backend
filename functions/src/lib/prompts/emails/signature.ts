import {MerchantDocument} from "../../types/merchant";

export const emailSignature = (merchant: MerchantDocument) => {
  const {logo, facebook, twitter, tiktok, youtube, instagram, name, company} =
    merchant.configurations.email_signature;

  const logo_img = logo !== "" ? `<img src='${logo}' alt='logo'/>` : null;

  const createImageLink = (url: string, imgSrc: string, alt: string) => {
    return url
      ? `<a href='${url}'><img src='${imgSrc}' alt='${alt}' /></a>`
      : null;
  };

  const fbImg = createImageLink(
    facebook,
    "https://cdn.shopify.com/s/files/1/0783/4802/6165/files/facebook_2168281.png?v=1731015538",
    "fb",
  );
  const xImg = createImageLink(
    twitter,
    "https://cdn.shopify.com/s/files/1/0783/4802/6165/files/x-icon.png?v=1731015628",
    "twitter",
  );
  const ttImg = createImageLink(
    tiktok,
    "https://cdn.shopify.com/s/files/1/0783/4802/6165/files/tiktok_3116491.png?v=1731015538",
    "tiktok",
  );
  const ytImg = createImageLink(
    youtube,
    "https://cdn.shopify.com/s/files/1/0783/4802/6165/files/yt-icon.png?v=1731015628",
    "youtube",
  );
  const igImg = createImageLink(
    instagram,
    "https://cdn.shopify.com/s/files/1/0783/4802/6165/files/instagram_1384015.png?v=1731015538",
    "instagram",
  );

  return `
<br />
<div class='signature'>
    <div class='logoWrapper'>
        ${logo_img}
    </div>
    <div class='dividerWrapper'>
        <div></div>
    </div>
    <div class='textWrapper'>
        <h6 style='margin: 0;'>
            <strong>${name || "Philly Harris"}</strong>
        </h6>
        <h6>
            Customer Service Agent<br />
        </h6>
        <a href='mailto:${merchant.configurations.contact_email}'>
            ${merchant.configurations.contact_email}
        </a>
        <br />
        <span>${company || ""}</span>
        <br />
        <div class='socialWrapper'>
            ${fbImg}
            ${xImg}
            ${ttImg}
            ${ytImg}
            ${igImg}
        </div>
    </div>
</div>
`;
};
