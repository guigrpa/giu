const config = {
  trailingSlash: true,
  assetPrefix: process.env.BASE_URL ? `${process.env.BASE_URL}/` : '',
};

module.exports = config;
