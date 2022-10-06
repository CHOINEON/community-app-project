import { Component, useState } from "react";
import Header1 from "./Header1"
import styled from "styled-components"
import Input from "./Input";
import BlueButton from "./BlutButton";
import axios from "axios";

const Container = styled.div`
padding: 30px 20px;
`;



function LoginPage(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    function login(){
        axios.post('http://3.90.201.108:3001/login',{
            email: email,
            password: password,
        }, {withCredentials: true})
    }

/*     const login = async () =>{
        const response = await fetch('http://3.90.201.108:3001/login',{
                method: 'Post',
                headers: {
                    'Content-Type' : 'application/json;charset=utf-8'
                  },
                  body: JSON.stringify({
                    email: email,
                    password: password
                  }),
            }
        );
        const json = await response;
        console.log(json);
    }; */

    return(
        <Container>
            <Header1 style={{marginBottom:'20px'}}>Login</Header1>
            <Input 
                placeholder={'email'} 
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)} />
            <Input 
                placeholder={'password'} 
                type='password' 
                value={password}
                onChange={e => setPassword(e.target.value)} />
            <BlueButton onClick={() => login()}>Login</BlueButton>
        </Container>
    )
}

export default LoginPage;