import withPWA from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: "CacheFirst",
      options: { cacheName: "sk-fonts", expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 } },
    },
    {
      urlPattern: /\/api\/.*/i,
      handler: "NetworkFirst",
      options: { cacheName: "sk-api", networkTimeoutSeconds: 10 },
    },
  ],
})(nextConfig);
