import { socket } from '../socket';
import io from 'socket.io-client';
import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import {useParams} from 'react-router-dom'
import styled from "styled-components"
import Header1 from "../components/Header1"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChatBox from '../components/ChatBox';
import UserContext from '../UserContext';
import useInterval from '../useInterval';
import Bluebutton from "../components/BlutButton"
import config from '../config';
let url = config.development.url + ':' + config.development.server.port

const Container = styled.div`
    padding: 30px 20px;
`;
const DebateContainer = styled.div`
    padding: 0px 20px;
    border-radius: 5px;
    border: 1px solid #777;
    margin-bottom: 10px;
    margin-left: 10px;
    margin-right: 10px;
`
const ChatContainer = styled.div`
    padding: 10px 20px;
    border-radius: 5px;
    border: 1px solid #777;
    margin-left: 10px;
    margin-right: 10px;
`

const ParticipantsList = styled.div`
    display: flex;
    flex-direction: column;
`

const ParticipantBox = styled.div`
    font-size: 1 rem;
    margin-bottom: 5px;
`


const ChatRoom = styled.div`
    height: 400px;
    overflow: auto;
    border: 2px solid rgba(0,0,0,0.3);
`

const TimeBox = styled.div`
    font-size: 1.1rem;
    margin-bottom: 10px;
`

function DebateDetailPage(){
    const [isConnected, setIsConnected] = useState(socket.connected);
    const {id: debate_id} = useParams();
    const {user, checkAuth} = useContext(UserContext);
    const [authError, setAuthError] = useState(null);
    const [debate, setDebate] = useState(null);
    const [debateState, setDebateState] = useState('');
    const [participate, setParticipate] = useState(null);
    const [participateList, setParticipateList] = useState([]);

    //chat
    const [chats, setchats] = useState([]);
    const [fetchedChats, setFetchedChats] = useState([]);
    const [message, setMessage] = useState('');
    
    
    const [count, setCount] = useState(0);
    useInterval(() => {
        setCount(count + 3);
        console.log(count);
        fetchDebate();
    }, 3000);
    
    useEffect(() => {
        checkAuth()
            .then((res) => {
                console.log('log in success', user);
                // console.log('res :',res);
                let data = {
                    debate_id: debate_id,
                    user_id: res.seq,
                    user_email: res.email,
                    socket_id: socket.id,
                }
                socket.emit('join room', data);
                console.log('join room');
            })
            .catch(() => {
                setAuthError('please log in first');
                console.log('failed to log in');
            });
        fetchDebate();
        fetchChats();
    }, []);
    
    useEffect(() => {
        console.log(chats);
    }, [chats]);
    
    useEffect(() => {
        // debate state
        let now = new Date(new Date().getTime());
        //console.log(now);
        now.setHours(now.getHours() + 9);
        now = now.toISOString();
        //console.log(now);
        if(debate === null) return;
        //console.log(debate.startDate);
        //console.log(debate.endDate);
        if(now < debate.startDate){
            console.log('state 0');
            setDebateState('waiting');
        }
        else if(now < debate.endDate){
            console.log('state 1');
            setDebateState('debating');
        }
        else if (debate.endDate < now){
            console.log('state 2');
            setDebateState('end');
        }
        
        // participate
        let part_list = debate.participant;
        if(part_list === null){
            setParticipate(false);
            setParticipateList([]);
        }
        else{
            part_list = debate.participant.split(',');
            console.log(part_list);
            let find_index = part_list.findIndex(e => e === user.email);
            if(find_index === -1){
                setParticipate(false);
            }
            else{
                setParticipate(true);
            }
            setParticipateList(part_list);
        }
    }, [debate]);
    
    useEffect(() => {
        
    }, [participate]);

    useEffect(() => {
         socket.on('new message', (data) => {
             console.log(data);
             console.log(chats);
             let newChats = chats;
             newChats.push(data);
             setchats([...newChats]);
             console.log(chats);
             console.log('in useEffect new message');
         });
    
        // socket.on('pong', () => {
        //   setLastPong(new Date().toISOString());
        // });
    
        return () => {
          //socket.off('new message');
          //socket.off('connect');
          //socket.off('pong');
        };
      }, []);

    function fetchDebate() {
        axios.get(`${url}/debates/` + debate_id)
            .then(response => {
                console.log(response.data);
                setDebate(response.data);
                console.log('fetch debate');
            });
    };
    function fetchChats() {
        axios.get(`${url}/chats/` + debate_id)
            .then(response => {
                console.log(response);
                setFetchedChats(response.data);
                console.log('fetch chats');
            });
    }
    function timestamp(date){
        let temp = new Date(date.getTime());
        temp.setHours(temp.getHours() + 9);
        return temp.toISOString().replace('T', ' ').substring(0, 23);
    }
    const sendMessage = () => {
        if(user === null) return;
        let data = {
            debate_id: debate_id,
            user_id: user.seq,
            user_email: user.email,
            message: message,
            date: timestamp(new Date()),
        }

        // socket communicate
        socket.emit('new message', data);
        setMessage('');
    }
    
    const onChange = (e) =>{
        setMessage(e.target.value);
    }
    function reserve(e){
        e.preventDefault();
        
        axios.post(`${url}/debates/${debate_id}/participate`, {
            email:user.email
        }, {withCredentials: true})
            .then(response => {
                console.log(response);
                setParticipate(true);
            })
            .catch(err => {
                console.log(err);
            });
    }
    
    function cancel(e){
        e.preventDefault();
        
        axios.post(`${url}/debates/${debate_id}/cancel`, {
            email:user.email
        }, {withCredentials: true})
            .then(response => {
                console.log(response);
                setParticipate(false);
            })
            .catch(err => {
                console.log(err);
            });
    }

    return(
        <>
            <Container>
                {debate && (
                    <>
                        <Header1>{debate && debate.title}</Header1>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} children={debate.content}/>
                    </>
                )}
            </Container>
            <DebateContainer>
                {debate && (
                    <>
                        <h2>debate information</h2>
                        <TimeBox>start time : {debate.startDate.replace('T', ' ').substring(0, 16)}</TimeBox>
                        <TimeBox>end time : {debate.endDate.replace('T', ' ').substring(0, 16)}</TimeBox>
                        <TimeBox>state : {debateState}</TimeBox>
                    </>
                )}
                {debateState === 'waiting' &&
                    <>
                    {participate === false &&
                        <Bluebutton onClick={e => reserve(e)}>reserve participate</Bluebutton>
                    }
                    {participate === true &&
                        <Bluebutton onClick={e => cancel(e)}>cancel participate</Bluebutton>
                    }
                    <h3>participants</h3>
                    <ParticipantsList>
                        {participateList && participateList.filter((e) =>{
                            if(e === 'null'){
                                return false;
                            }
                            return true;
                            }).map((p) => (
                                <ParticipantBox>{p}</ParticipantBox>
                        ))}
                    </ParticipantsList>
                    </>
                }
            </DebateContainer>
            {((debateState === 'debating') || (debateState === 'end')) &&
                <ChatContainer>
                    <p>Connected: { '' + isConnected }</p>
                    <p>socket ID : {user && user.email + `(${socket.id})` }</p>
                    <ChatRoom>
                        {fetchedChats.map(item => (
                            <ChatBox 
                                key={item.id}
                                user_email={item.user_email}
                                message={item.message}
                                date={item.date}
                                isMyMsg={item.user_email === user.email}
                            />
                        ))}
                        {chats.map(item => (
                            <ChatBox 
                                key={item.id}
                                user_email={item.user_email}
                                message={item.message}
                                date={item.date}
                                isMyMsg={item.user_email === user.email}
                            />
                        ))}
                    </ChatRoom>
                    {debateState === 'debating' &&
                        <div>
                            <input 
                                onChange={onChange} value={message} type="inputMessage" 
                                placeholder="Type here..." 
                                onKeyPress={(e)=>{
                                if (e.key === 'Enter')
                                    sendMessage();
                                }}/>
                            <button onClick={() => sendMessage()} >Send</button>
                        </div>
                    }
                </ChatContainer>
            }
        </>
    )
}

export default DebateDetailPage;