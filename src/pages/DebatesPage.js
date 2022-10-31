import styled from "styled-components"
import DebateRow from '../components/DebateRow'
import { useState,useEffect } from 'react'
import BlueButtonLink from '../components/BlueButtonLink'
import Header1 from "../components/Header1"
import axios from "axios"

import config from '../config';
let url = config.development.url + ':' + config.development.server.port

const HeaderRow = styled.div`
    display: grid;
    grid-template-columns: 1fr min-content;
    padding: 30px 20px;
`

function DebatesPage(){
    const [debates, setDebates] = useState([]);
    function fetchDebates(){
        axios.get(`${url}/debates/`, {withCredentials: true})
            .then(response => {
                setDebates(response.data);
            });
    }
    useEffect(() => fetchDebates(), []);
    
    return(
        <main>
            <HeaderRow>
                <Header1 style={{margin:0}}>All Debates</Header1>
                <BlueButtonLink to={'/make'}>Make&nbsp;Debates</BlueButtonLink>
            </HeaderRow>
            <div>
                {debates && debates.length > 0 && debates.map((debate) => (
                    <DebateRow 
                        key={debate.id}
                        id={debate.id}
                        title={debate.title}
                        content={debate.content}
                    />
                ))}
            </div>
        </main>
    )
}

export default DebatesPage;