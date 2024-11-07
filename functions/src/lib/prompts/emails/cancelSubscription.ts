import {ChatDocument} from "../../types/chats";
import {EmailDocument} from "../../types/emails";

export const buildCancelSubscriptionEmailPayload = (
  chat: ChatDocument | EmailDocument,
) => {
  const first_name = chat.customer ? chat.customer.first_name : "Dear Customer";

  return `
    <div
      class="parentWrapper"
      style="
        width: 100%;
        padding: 3rem 0;
        margin: 0;
        background: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      "
    >
      <div
        class="container"
        style="
          width: 50%;
          padding: 3rem;
          margin: 0 auto;
          background: #faf7f4;
          border-radius: 10px;
          box-shadow: 0px 0px 10px 1px #e4e4e4;
        "
      >
        <h5
          style="
            font-family: sans-serif;
            font-size: 20px;
            line-height: 22px;
            font-weight: 450;
          "
        >
          Canceling Your Order
        </h5>

        <p
          style="
            font-family: sans-serif;
            font-size: 13px;
            line-height: 20px;
            font-weight: 400;
          "
        >
          Hi ${first_name},
        </p>
        <br />

        <p
          style="
            font-family: sans-serif;
            font-size: 13px;
            line-height: 20px;
            font-weight: 400;
          "
        >
          We're sorry to see you go and want to make this transition as smooth
          as possible. Your subscription has been successfully canceled, and
          we're here to help with any final details or questions you may have.
        </p>

        <p
          style="
            font-family: sans-serif;
            font-size: 13px;
            line-height: 20px;
            font-weight: 400;
          "
        >
          If there's anything else we can assist you with, whether related to
          your account or our other services, please don't hesitate to reach
          out. Our team is ready to support you however we can.
        </p>

        <p
          style="
            font-family: sans-serif;
            font-size: 13px;
            line-height: 20px;
            font-weight: 400;
          "
        >
          Thank you for being a valued part of our community. We appreciate the
          time you spent with us, and remember you can resubscribe at anytime.
        </p>

        <br />
        <div
          style="
            width: 100%;
            height: auto;
            padding: 0rem 0;
            margin: 0;
            flex-direction: row !important;
            justify-content: flex-start !important;
            align-items: center !important;
            display: flex !important;
          "
        >
          <div
            class="logoWrapper"
            style="
              width: 15%;
              height: auto;
              padding: 2rem;
              margin: 0;
              display: flex;
              flex-direction: row;
              justify-content: center;
              align-items: center;
            "
          >
            <img
              src="https://cdn.shopify.com/s/files/1/0783/4802/6165/files/bigly.png?v=1727644792"
              alt="logo"
              style="
                width: 100%;
                height: auto;
                border-radius: 10px;
                object-fit: contain;
              "
            />
          </div>
          <div
            class="dividerWrapper"
            style="
              width: 2px;
              display: flex;
              flex-direction: row;
              justify-content: center !important;
              align-items: center !important;
              margin-right: 10px;
            "
          >
            <div
              style="
                width: 1px;
                height: 90%;
                background-color: rgb(218, 218, 218);
              "
            ></div>
          </div>
          <div class="textWrapper">
            <h6
              style="
                font-family: sans-serif;
                font-size: 13px;
                line-height: 20px;
                font-weight: 500;
                margin: 0 0 10px 0;
                margin-bottom: 0;
              "
            >
              <strong>John Doe</strong>
            </h6>
            <h6
              style="
                font-family: sans-serif;
                font-size: 13px;
                line-height: 20px;
                font-weight: 500;
                margin: 0 0 10px 0;
                color: #777;
              "
            >
              Customer Service Agent<br />
            </h6>
            <a
              style="
                color: #333;
                text-decoration: none;
                font-family: sans-serif;
                font-size: 12px;
                line-height: 18px;
                font-weight: 400;
              "
              href="mailto:johndoe@example.com"
              >johndoe@example.com</a
            ><br />
            <span
              style="
                color: #333;
                text-decoration: none;
                font-family: sans-serif;
                font-size: 12px;
                line-height: 18px;
                font-weight: 400;
              "
              >Company Name</span
            ><br />
            <div
              class="socialWrapper"
              style="
                width: 100%;
                height: auto;
                display: flex;
                flex-direction: row;
                justify-content: flex-start;
                align-items: center;
                margin: 0;
                padding: 10px 0;
              "
            >
              <a
                href=""
                style="
                  width: 25px;
                  height: 25px;
                  border-radius: 4px;
                  margin-right: 5px;
                "
              >
                <img
                  src="https://cdn.shopify.com/s/files/1/0783/4802/6165/files/facebook_2168281.png?v=1731015538"
                  alt="fb"
                  style="object-fit: contain; width: 25px; height: 25px"
              /></a>
              <a
                href=""
                style="
                  width: 25px;
                  height: 25px;
                  border-radius: 4px;
                  margin-right: 5px;
                "
              >
                <img
                  src="https://cdn.shopify.com/s/files/1/0783/4802/6165/files/tiktok_3116491.png?v=1731015538"
                  alt="tt"
                  style="object-fit: contain; width: 25px; height: 25px"
              /></a>
              <a
                href=""
                style="
                  width: 25px;
                  height: 25px;
                  border-radius: 4px;
                  margin-right: 5px;
                "
              >
                <img
                  src="https://cdn.shopify.com/s/files/1/0783/4802/6165/files/instagram_1384015.png?v=1731015538"
                  alt="ig"
                  style="object-fit: contain; width: 25px; height: 25px"
              /></a>
              <a
                href=""
                style="
                  width: 25px;
                  height: 25px;
                  border-radius: 4px;
                  margin-right: 5px;
                "
              >
                <img
                  src="https://cdn.shopify.com/s/files/1/0783/4802/6165/files/x-icon.png?v=1731015628"
                  alt="x"
                  style="object-fit: contain; width: 25px; height: 25px"
              /></a>
              <a
                href=""
                style="
                  width: 25px;
                  height: 25px;
                  border-radius: 4px;
                  margin-right: 5px;
                "
              >
                <img
                  src="https://cdn.shopify.com/s/files/1/0783/4802/6165/files/yt-icon.png?v=1731015628"
                  alt="yt"
                  style="object-fit: contain; width: 25px; height: 25px"
              /></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};
