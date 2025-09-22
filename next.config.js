const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },

  // Security headers including CSP
  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development'

    // Base CSP policy - strict but compatible with Swedish editor
    const cspPolicy = [
      // Default sources - only allow same origin
      "default-src 'self'",

      // Scripts - allow self, Next.js chunks, and unsafe-eval for development
      isDevelopment
        ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
        : "script-src 'self'",

      // Styles - allow self and inline styles (needed for TipTap editor)
      "style-src 'self' 'unsafe-inline'",

      // Images - allow self, data URLs (for editor), and external domains
      "img-src 'self' data: blob: https:",

      // Fonts - allow self and data URLs
      "font-src 'self' data:",

      // Connect - allow self and API endpoints
      "connect-src 'self'",

      // Media - allow self for uploaded content
      "media-src 'self' blob:",

      // Object and embed - block for security
      "object-src 'none'",
      "embed-src 'none'",

      // Base URI - restrict to same origin
      "base-uri 'self'",

      // Form actions - restrict to same origin
      "form-action 'self'",

      // Frame ancestors - prevent clickjacking
      "frame-ancestors 'none'",

      // Upgrade insecure requests in production
      ...(isDevelopment ? [] : ["upgrade-insecure-requests"])
    ].join('; ')

    return [
      {
        // Apply to all routes
        source: '/(.*)',
        headers: [
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: cspPolicy,
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // XSS Protection (legacy browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions Policy (restrict dangerous features)
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=()',
          },
        ],
      },
      // Additional headers for admin routes
      {
        source: '/(en|sv|km)/admin/(.*)',
        headers: [
          // Stricter CSP for admin area
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              isDevelopment
                ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
                : "script-src 'self'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "media-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              ...(isDevelopment ? [] : ["upgrade-insecure-requests"])
            ].join('; '),
          },
          // Cache control for admin pages
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate, max-age=0',
          },
        ],
      },
    ]
  },
};

module.exports = withNextIntl(nextConfig);