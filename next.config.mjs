import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // यह अपने आप इस फोल्डर का पूरा एब्सोल्यूट पाथ ढूंढकर टर्बोपैक को दे देगा
    root: path.resolve('.'),
  },
};

export default nextConfig;