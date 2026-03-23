export const SITE_NAME = "Cardboard Kings";
export const SITE_DESCRIPTION =
  "Cardboard Kings offers professional sports card cleaning services and a curated marketplace for collectors.";

function normalizeUrl(value: string) {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

export function getBaseUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;

  return new URL(
    configuredUrl ? normalizeUrl(configuredUrl) : "http://localhost:3000"
  );
}

export function absoluteUrl(path = "/") {
  return new URL(path, getBaseUrl()).toString();
}

export function buildPageTitle(title?: string) {
  if (!title) {
    return SITE_NAME;
  }

  return `${title} | ${SITE_NAME}`;
}
