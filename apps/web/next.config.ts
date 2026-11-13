import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@selet/shared'],
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../../'),
  devIndicators: false,
};

export default nextConfig;
