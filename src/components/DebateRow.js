import styled from "styled-components"
import { Link } from "react-router-dom"
import PropTypes from 'prop-types'

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
const QuestionLink = styled(Link)`
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
    grid-template-columns: repeat(1, 50px) 1fr;
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

function DebateRow({bid, id, title, content}){
    return(
        <StyledQuestionRow>
            <QuestionStat>4<span>views</span></QuestionStat>
            <QuestionTitleArea>
                <QuestionLink to={`/debates/${id}`}>
                    {title}
                </QuestionLink>
                <QuestionSummary>{content}</QuestionSummary>
                <WhoAndWhen>
                    asked 2 mins ago <UserLink>user</UserLink>
                </WhoAndWhen>
            </QuestionTitleArea>
        </StyledQuestionRow>
    )
}

DebateRow.propTypes = {
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
}

export default DebateRow;