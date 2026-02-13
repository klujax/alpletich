import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['example.com'], // Replace with your image domains
  },
  env: {
    CUSTOM_ENV_VARIABLE: process.env.CUSTOM_ENV_VARIABLE, // Example of custom environment variable
  },
  webpack: (config) => {
    // Custom webpack configuration can go here
    return config;
  },
};

export default nextConfig;