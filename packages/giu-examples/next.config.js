module.exports = {
  assetPrefix: process.env.BASE_URL || '',
  exportPathMap: () => ({
    '/': { page: '/' },
    '/compact': { page: '/compact' },
    '/material': { page: '/material' },
    '/datatable': { page: '/datatable' },
  }),
};
