import styled from "styled-components"
import { Link } from "react-router-dom"
import PropTypes from 'prop-types'

const ChatWrapper = styled.div`
    flex-direction: column;
    margin-top: 5px;
    margin-right: 10px;
    margin-left: 10px;
    margin-bottom: 5px;
`

const ChatName = styled.div`
    text-align: right;
    clear: both;
    padding: 0 0px;
`

const ChatMiddleBox = styled.div`
    flex-direction: row-reverse;
`

const ChatMessage = styled.div`
    display: inline-block;
    max-width: 75%;
    font-size: 1.2rem;
    border-radius: 10px;
    padding: 7px 15px;
    margin-bottom: 10px;
    margin-top: 5px;
    text-align: left;
    background-color: #f1f0f0;
`

const MyChatName = styled.div`
    text-align: left;
    clear: both;
    padding: 0 0px;
`

const MyChatMessage = styled.div`
    display: inline-block;
    max-width: 75%;
    font-size: 1.2rem;
    border-radius: 10px;
    padding: 7px 15px;
    margin-bottom: 10px;
    margin-top: 5px;
    text-align: right;
    content-align: right;
    float: right;
    margin-bottom: 5px;    
    background-color: #0084FF;
    color: #fff;
`

const When = styled.div`
    display:inline-block;
    color:#aaa;
    font-size: .8rem;
    margin-left: 5px;
`

function ChatBox({id, user_id, message, date, isMyMsg}){
    return(<>
            {isMyMsg && 
                <ChatWrapper>
                    <ChatName>{user_id}</ChatName>
                    <ChatMiddleBox>
                        {/* <When>{date}</When> */}
                        <MyChatMessage>{message}</MyChatMessage>
                    </ChatMiddleBox>
                </ChatWrapper>}
            {!isMyMsg &&
                <ChatWrapper>
                    <MyChatName>{user_id}</MyChatName>
                    <ChatMiddleBox>
                        {/* <When>{date}</When> */}
                        <ChatMessage>{message}</ChatMessage>
                    </ChatMiddleBox>
                </ChatWrapper>}
        </>
    )
}


export default ChatBox;