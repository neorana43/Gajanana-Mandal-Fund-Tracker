import type { NextConfig } from "next";
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  buildExcludes: [/middleware-manifest\\.json$/],
  manifest: "/manifest.json",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    domains: ["ropzcbrywquktqbtbhix.supabase.co"],
  },
};

module.exports = withPWA(nextConfig);
