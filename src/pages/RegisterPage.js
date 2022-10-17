import { useState, useContext } from "react";
import {Navigate} from 'react-router-dom';
import axios from "axios";
import styled from "styled-components"
import UserContext from '../UserContext';
import Header1 from "../components/Header1"
import Input from "../components/Input";
import BlueButton from "../components/BlutButton";
import ErrorBox from '../components/ErrorBox';

import config from '../config';
let url = config.development.url + ':' + config.development.server.port

const Container = styled.div`
  padding: 30px 20px;
`;

function RegisterPage(){
    const {user, checkAuth} = useContext(UserContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [redirectToHomePage, setRedirectToHomePage] = useState(false);

    function register(e){
        e.preventDefault();
        axios.post(`${url}/register/`,{
            email: email,
            password: password,
         },{withCredentials: true})
            .then(() => {
                checkAuth().then(() => {
                    setError(false);
                    setRedirectToHomePage(true)
                });
            })
            .catch(error => {
                setError(error.response.data);
            });
         
    }

    return(<>
        {redirectToHomePage && (
            <Navigate to={'/'} />
        )}
        <Container>
            <Header1 style={{marginBottom:'20px'}}>Register</Header1>
            {error && (
                <ErrorBox>{error}</ErrorBox>
            )}
            <form onSubmit={e => register(e)}>
                <Input 
                    placeholder={'email'} 
                    type='email'
                    value={email}
                    onChange={e => setEmail(e.target.value)} />
                <Input 
                    placeholder={'password'} 
                    type='password' 
                    value={password}
                    autocomplete={'new-password'}
                    onChange={e => setPassword(e.target.value)} />
                <BlueButton type={'submit'}>Register</BlueButton>
            </form>
        </Container>
    </>)
}

export default RegisterPage;