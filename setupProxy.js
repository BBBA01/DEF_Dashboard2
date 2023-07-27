const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api', // Replace this with the API route that you want to proxy
    createProxyMiddleware({
      target: 'http://115.124.120.251:5060', // Replace this with your API server URL
      changeOrigin: true,
      secure: false, // Set to 'false' if your API server does not use HTTPS
      headers: {
        // Optional: Add custom headers if required by your API server
        'X-Custom-Header': 'CustomValue',
      },
    })
  );
};
