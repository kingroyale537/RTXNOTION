/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "http", hostname: "localhost" },
      // Allow self-hosted uploads
      { protocol: "http", hostname: "localhost", port: "3000" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: [
      "@prisma/client",
      "prisma",
      "yjs",
      "y-protocols",
    ],
  },
  webpack: (config, { isServer }) => {
    // Required for socket.io and ws on server
    config.externals.push({
      "utf-8-validate": "commonjs utf-8-validate",
      bufferutil: "commonjs bufferutil",
    });

    // Yjs / ProseMirror use browser APIs; exclude from server bundle
    if (isServer) {
      config.externals.push("yjs", "y-protocols");
    }

    // Suppress canvas warning from lowlight (Node.js WASM module)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
    };

    return config;
  },
};

export default nextConfig;

