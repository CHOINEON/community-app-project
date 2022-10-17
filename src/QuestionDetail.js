import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import {useParams} from 'react-router-dom'
import styled from "styled-components"
import Header1 from "./Header1"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import UserContext from './UserContext';
import { socket } from './socket';
import ChatBox from './ChatBox';

import config from './config';
let url = config.development.url + ':' + config.development.server.port

const Container = styled.div`
    padding: 30px 20px;
`;

const ChatContainer = styled.div`
    padding: 30px;
    border: 1px solid #777;
`

const ChatRoom = styled.div`
    height: 400px;
    overflow: auto;
    border: 2px solid rgba(0,0,0,0.3);
`

function QuestionDetail(){
    const {id: question_id} = useParams();
    const [question, setQuestion] = useState(false);
    const {user, checkAuth} = useContext(UserContext);
    //chat
    const [login, setLogin] = useState(false);
    const [nickname, setNickname] = useState(user.email);
    const [userSeq, setUserSeq] = useState(null);
    const [chatRoomValid, setChatRoomValid] = useState(false);
    const [chatRoomId, setChatRoomId] = useState(null);
    const [chats, setchats] = useState([]);
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [Msg, setMessage] = useState('');
    const [joined, setJoined] = useState(false);

    function fetchQeustion() {
        axios.get(`${url}/questions/` + question_id)
            .then(response => {
                //console.log(response);
                setQuestion(response.data);
                console.log('fetch qeustion');
            });
    };
    function fetchChatRoom(){
        axios.get(`${url}/chatRooms/` + question_id)
            .then(response => {
                //console.log(response);
                let chatRoom = response.data.chatRoom;
                let chattings = response.data.chattings;
                console.log(chatRoom);
                console.log(chattings);
                setChatRoomValid(chatRoom.valid);
                setChatRoomId(chatRoom.id);
                setchats(chattings);
                console.log('fetch chatRoom');
            });
    };
    function fetchUserInfo(){
        axios.post(`${url}/getUser/`, {}, {withCredentials: true})
            .then(response => {
                console.log(response);
                setUserSeq(response.data.User_seq);
                console.log('fetch UserInfo');
            });
    }

    const sendMessage = () => {
        axios.post(`${url}/chatting/`, {
            question_id: question_id,
            message: Msg,
        }, {withCredentials:true})
            .then(response =>{
                //console.log(response);
                console.log(response.data);
                let data = response.data;
                let newChats = [...chats, data];
                //setchats(newChats);
                console.log(chats);
                socket.emit('new message', data);
                setMessage('');
            })
    }
    
    const onChange = (e) =>{
        setMessage(e.target.value);
    }
    
    // async function chat(){
        console.log(nickname);
        let data = [question_id, nickname];
        
        //if(!joined){
            socket.emit('join room', data);
        //    setJoined(true);
        //}
        
        socket.on('new message', (data) => {
            console.log(data);
            let newChats = [...chats, data];
            setchats(newChats);
            console.log(chats);
            console.log('in useEffect new message');
        });
        
    //     return () => {
    //         console.log('off return');
    //         socket.off('new message');
    //     };
    // }

    useEffect(() =>{
        fetchQeustion();
        fetchChatRoom();
        checkAuth()
            .then((res) => {
                setLogin(true);
                fetchUserInfo();
                //console.log(res);
            })
            .catch((res) => {
                setLogin(false);
                //console.log(res);
            });
    },[]);
    // useEffect(() => {
    //     if(chatRoomValid){
    //         chat();
    //         console.log('chat');
    //     }
    // }, [chats]);



    return(
        <>
            <Container>
                {question && (
                    <>
                        <Header1>{question && question.title}</Header1>
                        <ReactMarkdown plugins={[remarkGfm]} children={question.content}/>

                        <ChatContainer>
                            <p>Connected: { '' + isConnected }</p>
                            <p>socket ID: {nickname+`(${socket.id})` }</p>

                            <ChatRoom>
                                {chats.map(item => (
                                    <ChatBox 
                                        key={item.id}
                                        user_id={item.user_id}
                                        message={item.content}
                                        date={item.date}
                                        isMyMsg={item.user_id === user.email}
                                    />
                                ))}
                            </ChatRoom>
                            <div>
                                <input 
                                    onChange={onChange} value={Msg} type="inputMessage" 
                                    placeholder="Type here..." 
                                    onKeyPress={(e)=>{
                                    if (e.key === 'Enter')
                                        sendMessage();
                                    }}/>
                                <button onClick={() => sendMessage()} >Send</button>
                            </div>
                        </ChatContainer>

                    </>
                )}
            </Container>
        </>
    )
}

export default QuestionDetail;