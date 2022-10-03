import styled from 'styled-components'
import QuestionRow from './QuestionRow'
import { useState,useEffect } from 'react'

const StyledHeader = styled.h1`
    font-size: 1.8rem;
`
const HeaderRow = styled.div`
    display: grid;
    grid-template-columns: 1fr min-content;
    padding: 30px 20px;
`
const BlueButton = styled.button`
    background-color: #378ad3;
    color:#fff;
    border:0;
    border-radius:5px;
    padding: 12px 10px;
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
                <StyledHeader>All Questions</StyledHeader>
                <BlueButton>Ask Question</BlueButton>
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