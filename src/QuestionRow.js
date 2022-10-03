import styled from "styled-components"
import { Link } from "react-router-dom"

const QuestionStat = styled.div`
    text-align:center;
    display:inline-block;
    font-size:1.2rem;
    color:#454545;
    margin-top:7px;
    span{
        font-size:.7rem;
        display:block;
        font-weight:300;
        margin-top:4px;
    }
`
const QuestionTitleArea = styled.div`
    padding: 0 30px;
`
const QuestionSummary =styled.div`
    padding: 10px 10px;
    font-size:.8rem;
    line-height: 17px;
`
const QuestionLink = styled.a`
    text-decoration:none;
    color:#3ca4ff;
    font-size:1.1rem;
    display:block;
    margin-bottom:5px;
`
const Tag = styled.span`
    display:inline-block;
    margin-right:5px;
    background-color: #3e4a52;
    color:#9cc3db;
    padding: 7px;
    border-radius:4px;
    font-size:.9rem;
`
const StyledQuestionRow = styled.div`
    background-color: rgba(240,240,240,0.5);
    padding: 15px 15px 10px;
    display: grid;
    grid-template-columns: repeat(3, 50px) 1fr;
    border-top: 1px solid #a1a1a1;
`
const WhoAndWhen = styled.div`
    display:inline-block;
    color:#aaa;
    font-size: .8rem;
    float:right;
    padding: 10px 0;
`
const UserLink = styled.a`
    color: #3ca4ff;
`

function QuestionRow({bid, id, title, content}){
    return(
        <StyledQuestionRow>
            <QuestionStat>0<span>votes</span></QuestionStat>
            <QuestionStat>2<span>answers</span></QuestionStat>
            <QuestionStat>4<span>views</span></QuestionStat>
            <QuestionTitleArea>
                <QuestionLink>
                    <Link to={`/Question/${id}`}>{title}</Link>
                </QuestionLink>
                <QuestionSummary>{content}</QuestionSummary>
                <Tag>javascript</Tag>
                <WhoAndWhen>
                    asked 2 mins ago <UserLink>user</UserLink>
                </WhoAndWhen>
            </QuestionTitleArea>
        </StyledQuestionRow>
    )
}

export default QuestionRow;