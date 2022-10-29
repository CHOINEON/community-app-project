import config from '../config';
import styled from "styled-components"
import Bluebutton from "../components/BlutButton"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect, useContext } from "react";
import Header1 from "../components/Header1"
import Input from "../components/Input";
import axios from "axios";
import {Navigate} from 'react-router-dom';
import { socket } from '../socket';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { ko } from "date-fns/esm/locale";
import ErrorBox from "../components/ErrorBox";
import UserContext from '../UserContext';



let url = config.development.url + ':' + config.development.server.port

const Container = styled.div`
    padding: 30px 20px;
`;

const DebateBodyTextarea = styled.textarea`
    background: none;
    border: 1px solid #777;
    border-radius: 3px;
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 10px;
    min-height: 200px;
    margin-bottom: 20px;
`

const PreviewArea = styled.div`
    padding: 10px 20px;
    background-color: #ddd;
    border-radius: 5px;
    margin-bottom: 20px;
`

const StyledDateTitle = styled.div`
    font-size: 1.1rem;
    font-weight: 700;
`
const StyledDatePicker = styled(DatePicker)`
    margin-top: 0.5rem;
    margin-bottom: 1.5rem;
    width: 300px;
    height: 40px;
    box-sizing: border-box;
    padding: 8px 20px;
    border-radius: 3px;
    border: 1px solid grey;
`



function MakeDebatePage(){
    const {user, checkAuth} = useContext(UserContext);
    const [debateTitle, setDebateTitle] = useState('');
    const [debateBody, setDebateBody] = useState('');
    const [redirect, setRedirect] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [serverStartDate, setServerStartDate] = useState('');
    const [endDate, setEndDate] = useState(new Date());
    const [serverEndDate, setServerEndDate] = useState('');
    const [dateError, setDateError] = useState(null);
    const [authError, setAuthError] = useState(null);
    console.log(user);
    console.log(startDate);
    console.log(endDate);
    console.log(serverStartDate);
    console.log(serverEndDate);

    const filterPassedTime = (time) => {
        const currentDate = new Date();
        const selectedDate = new Date(time);
    
        return currentDate.getTime() < selectedDate.getTime();
    };
    const filterEndTime = (time) => {
        const selectedDate = new Date(time);
    
        return startDate.getTime() < selectedDate.getTime();
    };
    function timestamp(date){
        let temp = new Date(date.getTime());
        temp.setHours(temp.getHours() + 9);
        return temp.toISOString().replace('T', ' ').substring(0, 23);
    }
    function sendDebate(e) {
        e.preventDefault();
        if(user === null || dateError !== null) return;
        axios.post(`${url}/debates/`, {
            title: debateTitle,
            content: debateBody,
            user: user.seq,
            startDate: serverStartDate,
            endDate: serverEndDate,
        }, {withCredentials: true})
            .then(response => {
                console.log(response);
                //setRedirect('/debates/' + response.data.insertId);
            });
    }
    useEffect(() => {
        checkAuth()
            .then(() => {
                console.log(user.seq, user.email);
            })
            .catch(() => {
                setAuthError('please log in first');
            });
    }, [])
    useEffect(() => {
        if(startDate.getTime() < endDate.getTime()){
            setDateError(null);
            setServerStartDate(timestamp(startDate));
            setServerEndDate(timestamp(endDate));
        }
        else{
            setEndDate(startDate);
            setDateError('end time must be later than start time');            
        }
    }, [startDate, endDate]);

    return(
        <Container>
            {redirect && (
                <Navigate to={redirect} />
            )}
            <Header1 style={{marginBottom:'20px'}}>Make a Debate</Header1>
            <form onSubmit={e => sendDebate(e)}>
                <Input
                    type="text"
                    value={debateTitle}
                    onChange={e => setDebateTitle(e.target.value)}
                    placeholder="Topic of your debate"
                />

                <DebateBodyTextarea
                    value={debateBody}
                    onChange={e => setDebateBody(e.target.value)}
                    placeholder="More info about your debate. You can use markdown here."
                />

                <PreviewArea>
                    <ReactMarkdown plugins={[remarkGfm]} children={debateBody}/>
                </PreviewArea>

                {dateError && 
                    <div>
                        <ErrorBox>{dateError}</ErrorBox>
                    </div>
                }
                <div>
                    <StyledDateTitle>Debate start time</StyledDateTitle>
                    <StyledDatePicker
                        locale={ko}
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        showTimeSelect
                        timeIntervals={15}
                        filterTime={filterPassedTime}
                        dateFormat="yyyy-MM-dd aa h:mm"
                    />                    
                </div>
                <div>
                    <StyledDateTitle>Debate end time</StyledDateTitle>
                    <StyledDatePicker
                        locale={ko}
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        showTimeSelect
                        timeIntervals={15}
                        filterTime={filterEndTime}
                        dateFormat="yyyy-MM-dd aa h:mm"
                    />
                </div>
                
                {authError && 
                    <div>
                        <ErrorBox>{authError}</ErrorBox>
                    </div>
                }

                <Bluebutton type={'submit'}>Post Debate</Bluebutton>                
            </form>
        </Container>
    )
}

export default MakeDebatePage;