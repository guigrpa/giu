const withCSS = require('@zeit/next-css');

const config = {
  trailingSlash: true,
  assetPrefix: process.env.BASE_URL ? `${process.env.BASE_URL}/` : '',
  exportPathMap: () => ({
    '/': { page: '/' },
    '/compact': { page: '/compact' },
    '/material': { page: '/material' },
    '/datatable': { page: '/datatable' },
    '/play1': { page: '/play1' },
    '/play2': { page: '/play2' },
  }),
};

module.exports = withCSS(config);
