import QuestionsPage from "./QuestionsPage"
import LeftSideBar from '../components/LeftSideBar';
import styled from "styled-components"
import Header1 from "../components/Header1"

const HeaderRow = styled.div`
    display: grid;
    grid-template-columns: 1fr min-content;
    padding: 30px 20px;
`
function HomePage(){
    return(
        <div>
            <HeaderRow>
                <Header1 style={{margin:0}}>Home</Header1>
            </HeaderRow>
        </div>
    )
}
/*
<h1>The Posts</h1>
{loading ? <strong>Loading...</strong> : null}
<div>
{posts.map((post) => (
<div key={post.id}>
  {post.bid} {post.title}
</div>
))}
</div>*/
export default HomePage;