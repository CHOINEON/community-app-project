import styled from "styled-components"
import QuestionRow from '../components/QuestionRow'
import { useState,useEffect } from 'react'
import BlueButtonLink from '../components/BlueButtonLink'
import Header1 from "../components/Header1"
import axios from "axios"

import config from '../config';
import { useParams } from "react-router-dom"
let url = config.development.url + ':' + config.development.server.port

const HeaderRow = styled.div`
    display: grid;
    grid-template-columns: 1fr min-content;
    padding: 30px 20px;
`

function SearchPage(){
    const {terms: terms} = useParams();
    const [questions, setQuestions] = useState([]);
    function fetchSearchResult(){
        axios.get(`${url}/search/${terms}`, {withCredentials: true})
            .then(response => {
                setQuestions(response.data);
            });
    }

    useEffect(() =>{fetchSearchResult();},[terms]);
    
    return(
        <main>
            <HeaderRow>
                <Header1 style={{margin:0}}>Search Results</Header1>
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

export default SearchPage;