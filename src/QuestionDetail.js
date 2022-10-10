import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import {useParams} from 'react-router-dom'
import styled from "styled-components"
import Header1 from "./Header1"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import UserContext from './UserContext';
import { socket } from './socket';


const Container = styled.div`
    padding: 30px 20px;
`;

function QuestionDetail(){
    const {id} = useParams();
    const [question, setQuestion] = useState(false);

    function fetchQeustion() {
        axios.get('http://3.90.201.108:3001/questions/' + id)
            .then(response => {
                //console.log(response);
                setQuestion(response.data);
            });
    };
    useEffect(() =>{
        fetchQeustion();
        console.log('fetchQeustion');
    },[])

    // Chat
    const {user, checkAuth} = useContext(UserContext);
    const nickname = user.email;
    const [chats, setchats] = useState([]);
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [Msg, setMessage] = useState('');

    const addChatMessage = (data) => {
        let message = '';
        if (data.numUsers === 1) {
          message += `there's 1 participant`;
        } else {
          message += `there are ${data.numUsers} participants`;
        }
        setchats(chats.concat(message));
    }
    
    function chat(){
        socket.emit('add user', nickname);
        
        socket.on('login', (data) => {
            setIsConnected(true);    
            addChatMessage(data);
        });
        socket.on('user joined', (data) =>{
            setchats(chats.concat(`${data.username} joined`));
        })
        socket.on('user left', (data) => {
            setchats(chats.concat(`${data.username} left`));
        });
        socket.on('disconnect', () => {
            setIsConnected(false);
        });
        socket.on('new message', (data) => {
            setchats(chats.concat(`${data.username} : ${data.message}`));
            console.log('in useEffect new message');
        });
        return () => {
            socket.off('login');
            socket.off('disconnect');
            socket.off('new message');
        };
    }
    useEffect(() => {
        chat();
        console.log('chat');
    });

    const sendMessage = () => {
        console.log(Msg);
        setchats(chats.concat(`${nickname} : ${Msg}`));
        socket.emit('new message', Msg);
        setMessage('');
    }
    
    const onChange = (e) =>{
        setMessage(e.target.value);
    }

    return(
        <>
            <Container>
                {question && (
                    <>
                        <Header1>{question && question.title}</Header1>
                        <ReactMarkdown plugins={[remarkGfm]} children={question.content}/>

                        <p>Connected: { '' + isConnected }</p>
                        <p>socket ID: {nickname+`(${socket.id})` }</p>
                        <div type="scrollBlind">
                            <ul type ="message">
                                {chats.map((val, index) => {
                                return (<li key={index}>{val}</li>);
                                })}
                            </ul>
                        </div>
                        <div>
                            <input 
                                onChange={onChange} value={Msg} type="inputMessage" 
                                placeholder="Type here..." 
                                onKeyPress={(e)=>{
                                if (e.key === 'Enter')
                                    sendMessage();
                                }}/>
                            <button onClick={sendMessage} >Send</button>
                        </div>
                    </>
                )}
            </Container>
        </>
    )
}

export default QuestionDetail;