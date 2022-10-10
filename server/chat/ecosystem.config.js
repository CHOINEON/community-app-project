module.exports = {
    apps : [{
      name       : 'chat-server',
      script     : './server/chat/chatServer.js',
      watch      : '.',
      instances  : 4
    }]};