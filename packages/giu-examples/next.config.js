module.exports = {
  assetPrefix: process.env.BASE_URL || '',
  exportPathMap: () => ({
    '/': { page: '/' },
    '/compact': { page: '/compact' },
    '/material': { page: '/material' },
    '/datatable': { page: '/datatable' },
    '/play1.html': { page: '/play1' },
    '/play2.html': { page: '/play2' },
  }),
};
