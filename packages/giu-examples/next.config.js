module.exports = {
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
