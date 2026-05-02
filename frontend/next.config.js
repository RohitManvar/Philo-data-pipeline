/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "**.wikimedia.org" },
      { protocol: "https", hostname: "**.wikipedia.org" },
    ],
    formats: ["image/webp"],
  },
  compress: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
