import React from 'react';
import io from "socket.io-client";
// import { SOCKET_URL } from "config";

export const socket = io('3.90.201.108:5000');
export const SocketContext = React.createContext();