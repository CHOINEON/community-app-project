const { createProxyMiddleware } = require('http-proxy-middleware');
const config = require('./config');
const url = config.development.url +':' + config.development.server.port

module.exports = (app) => {
    app.use(
        createProxyMiddleware('/', {
            target : 'http://3.90.201.108:3001'
        })
    )
}