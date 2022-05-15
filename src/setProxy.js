const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = (app) => {
    app.use(
        createProxyMiddleware('/', {
            target : 'http://3.90.201.108:3001/'
        })
    )
}