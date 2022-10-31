import React from 'react';
import io from "socket.io-client";
import config from './config';

let socket_url = config.development.url + ':' + config.development.chatserver.port

export const socket = io(socket_url);
export const SocketContext = React.createContext();