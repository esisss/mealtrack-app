import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		domains: ['picsum.photos', 'gourmet.iprospect.cl', 'res.cloudinary.com'],
	},
	allowedDevOrigins: [
		'http://localhost:3000',
		'https://mealwise.vercel.app',
		'http://192.168.0.17:3000',
	],
	cacheComponents: true,
};

export default nextConfig;
