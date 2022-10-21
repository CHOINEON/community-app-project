import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import {useParams} from 'react-router-dom'
import styled from "styled-components"
import Header1 from "../components/Header1"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import UserContext from '../UserContext';


import config from '../config';
let url = config.development.url + ':' + config.development.server.port

const Container = styled.div`
    padding: 30px 20px;
`;

function QuestionDetailPage(){
    const {id: question_id} = useParams();
    const [question, setQuestion] = useState(false);
    const {user, checkAuth} = useContext(UserContext);

    function fetchQeustion() {
        axios.get(`${url}/questions/` + question_id)
            .then(response => {
                //console.log(response);
                setQuestion(response.data);
                console.log('fetch qeustion');
            });
    };
    useEffect(() =>{
        fetchQeustion();
    },[]);


    return(
        <>
            <Container>
                {question && (
                    <>
                        <Header1>{question && question.title}</Header1>
                        <ReactMarkdown plugins={[remarkGfm]} children={question.content}/>
                    </>
                )}
            </Container>
        </>
    )
}

export default QuestionDetailPage;