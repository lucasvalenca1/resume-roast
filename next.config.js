const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
      distDir: process.env.NEXT_DIST_DIR || '.next',
      output: process.env.NEXT_OUTPUT_MODE,
      experimental: {
              outputFileTracingRoot: path.join(__dirname, '../'),
              serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
      },
      eslint: {
              ignoreDuringBuilds: true,
      },
      typescript: {
              ignoreBuildErrors: true,
      },
      images: { unoptimized: true },
};

module.exports = nextConfig;
