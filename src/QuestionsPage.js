import styled from "styled-components"
import QuestionRow from './QuestionRow'
import { useState,useEffect } from 'react'
import BlueButtonLink from './BlueButtonLink'
import Header1 from "./Header1"
import axios from "axios"

const HeaderRow = styled.div`
    display: grid;
    grid-template-columns: 1fr min-content;
    padding: 30px 20px;
`

function QuestionsPage(){
    const [questions, setQuestions] = useState([]);
    function fetchQuestions(){
        axios.get('http://3.90.201.108:3001/questions', {withCredentials: true})
            .then(response => {
                setQuestions(response.data);
            });
    }
    useEffect(() => fetchQuestions(), []);
    
    return(
        <main>
            <HeaderRow>
                <Header1 style={{margin:0}}>All Questions</Header1>
                <BlueButtonLink to={'/ask'}>Ask&nbsp;Questions</BlueButtonLink>
            </HeaderRow>
            <div>
                {questions && questions.length > 0 && questions.map((question) => (
                    <QuestionRow 
                        key={question.bid}
                        id={question.bid}
                        title={question.title} 
                        content={question.content}
                    />
                ))}
            </div>
        </main>
    )
}

export default QuestionsPage;