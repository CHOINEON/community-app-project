import config from '../config';
import styled from "styled-components"
import Bluebutton from "../components/BlutButton"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useEffect } from "react";
import Header1 from "../components/Header1"
import Input from "../components/Input";
import axios from "axios";
import {Navigate} from 'react-router-dom';
import { socket } from '../socket';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import ErrorBox from "../components/ErrorBox";



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

    const [debateTitle, setDebateTitle] = useState('');
    const [debateBody, setDebateBody] = useState('');
    const [redirect, setRedirect] = useState(false);
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [error, setError] = useState(null);
    console.log(startDate);
    console.log(endDate);
    const filterPassedTime = (time) => {
        const currentDate = new Date();
        const selectedDate = new Date(time);
    
        return currentDate.getTime() < selectedDate.getTime();
    };
    const filterEndTime = (time) => {
        const selectedDate = new Date(time);
    
        return startDate.getTime() < selectedDate.getTime();
    };
    function sendDebate(e) {
        e.preventDefault();
        axios.post(`${url}/debates/`, {
            title: debateTitle,
            content: debateBody,
        }, {withCredentials: true})
            .then(response => {
                console.log(response);
                setRedirect('/debates/' + response.data.insertId);
            });
    }
    useEffect(() => {
        if(startDate.getTime() < endDate.getTime()){
            setError(null);
        }
        else{
            setEndDate(startDate);
            setError('end time must be later than start time');            
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

                <div>
                    <StyledDateTitle>Debate start time</StyledDateTitle>
                    <StyledDatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        showTimeSelect
                        filterTime={filterPassedTime}
                        dateFormat="MMMM d, yyyy h:mm aa"
                    />                    
                </div>

                <div>
                    <StyledDateTitle>Debate end time</StyledDateTitle>
                    <StyledDatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        showTimeSelect
                        filterTime={filterEndTime}
                        dateFormat="MMMM d, yyyy h:mm aa"
                    />
                </div>
                
                {error && 
                    <div>
                        <ErrorBox>{error}</ErrorBox>
                    </div>
                }

                <Bluebutton type={'submit'}>Post Debate</Bluebutton>                
            </form>
        </Container>
    )
}

export default MakeDebatePage;