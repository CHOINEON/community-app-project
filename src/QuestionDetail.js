import axios from 'axios';
import { useState, useEffect } from 'react';
import {useParams} from 'react-router-dom'
import styled from "styled-components"
import Header1 from "./Header1"
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    },[])
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

export default QuestionDetail;