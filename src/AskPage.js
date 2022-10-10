import styled from "styled-components"
import Bluebutton from "./BlutButton"
import { Link } from "react-router-dom"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import Header1 from "./Header1"
import Input from "./Input";
import axios from "axios";
import {Navigate} from 'react-router-dom';
import { socket } from './socket';

const Container = styled.div`
    padding: 30px 20px;
`;

const QuestionBodyTextarea = styled.textarea`
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

function AskPage(){

    const [questionTitle, setQuestionTitle] = useState('');
    const [questionBody, setQuestionBody] = useState('');
    const [redirect, setRedirect] = useState(false);

    
    function sendQuestion(e) {
        e.preventDefault();
        axios.post('http://3.90.201.108:3001/questions', {
            title: questionTitle,
            content: questionBody,
        }, {withCredentials: true})
            .then(response => {
                console.log(response);
                setRedirect('/questions/' + response.data.insertId);

                // make chatting room
                socket.emit('make room', response.data.insertId);
            });
    }

    return(
        <Container>
            {redirect && (
                <Navigate to={redirect} />
            )}
            <Header1 style={{marginBottom:'20px'}}>Ask a Question</Header1>
            <form onSubmit={e => sendQuestion(e)}>
                <Input
                    type="text"
                    value={questionTitle}
                    onChange={e => setQuestionTitle(e.target.value)}
                    placeholder="Title of your question"/>

                <QuestionBodyTextarea
                    value={questionBody}
                    onChange={e => setQuestionBody(e.target.value)}
                    placeholder="More info about your question. You can use markdown here."/>

                <PreviewArea>
                    <ReactMarkdown plugins={[remarkGfm]} children={questionBody}/>
                </PreviewArea>
                
                <Bluebutton type={'submit'}>Post Question</Bluebutton>                
            </form>
        </Container>
    )
}

export default AskPage;