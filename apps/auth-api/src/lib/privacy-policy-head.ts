import { PRIVACY_POLICY_META, PRIVACY_POLICY_ROUTE } from "./privacy-policy";
import { WHILO_SOCIAL_IMAGE_ALT, WHILO_SOCIAL_IMAGE_URL, WHILO_X_HANDLE } from "./site-metadata";

/** The head of the privacy policy at /privacy-policy and /privacy. The canonical link is /privacy-policy on both. */
export function privacyPolicyHead(siteUrl: string) {
  const url = new URL(PRIVACY_POLICY_ROUTE, siteUrl).toString();
  const { title, description } = PRIVACY_POLICY_META;
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Whilo" },
      { property: "og:locale", content: "en_US" },
      { property: "og:url", content: url },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: WHILO_SOCIAL_IMAGE_URL },
      { property: "og:image:alt", content: WHILO_SOCIAL_IMAGE_ALT },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: WHILO_X_HANDLE },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: WHILO_SOCIAL_IMAGE_URL },
      { name: "twitter:image:alt", content: WHILO_SOCIAL_IMAGE_ALT },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
