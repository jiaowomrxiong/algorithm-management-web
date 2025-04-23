/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // 开发时不检查类型
    ignoreBuildErrors: process.env.NODE_ENV === "development",
  },
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    // 添加监视选项到webpack配置中
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    };
    return config;
  },
  // 添加 cookie 相关配置
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Set-Cookie",
            value: "SameSite=Lax; Secure",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
