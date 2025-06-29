/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  }
}

module.exports = nextConfig