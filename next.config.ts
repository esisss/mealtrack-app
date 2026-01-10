import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		domains: ['picsum.photos', 'gourmet.iprospect.cl', 'res.cloudinary.com'],
	},
	cacheComponents: true,
};

export default nextConfig;
