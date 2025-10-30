/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Enable server actions
    serverActions: true,
  },
  // Optimize for Vercel deployment
  optimizeFonts: true,
  poweredByHeader: false,
  compress: true,
  // Configure serverless function behavior
  serverRuntimeConfig: {
    // Will only be available on the server side
    mySecret: process.env.MY_SECRET,
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    apiUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  },
}