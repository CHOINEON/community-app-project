import styled from "styled-components"
import QuestionRow from './QuestionRow'
import { useState,useEffect } from 'react'
import BlueButtonLink from './BlueButtonLink'
import Header1 from "./Header1"

const HeaderRow = styled.div`
    display: grid;
    grid-template-columns: 1fr min-content;
    padding: 30px 20px;
`

function QuestionsPage(){
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const getPosts = async () =>{
        const response = await fetch(
            'http://3.90.201.108:3001/api/home'
        );
        const json = await response.json();
        setPosts(json);
        setLoading(false);
        console.log(json);
    };
    useEffect(() => {
        getPosts();
    }, []);
    
    return(
        <main>
            <HeaderRow>
                <Header1 style={{margin:0}}>All Questions</Header1>
                <BlueButtonLink to={'/ask'}>Ask&nbsp;Questions</BlueButtonLink>
            </HeaderRow>
            <div>
                {posts.map((post) => (
                    <QuestionRow 
                        key={post.bid}
                        id={post.bid}
                        title={post.title} 
                        content={post.content}
                    />
                ))}
            </div>
        </main>
    )
}

export default QuestionsPage;