import { useState, useContext } from "react";
import Header1 from "./Header1"
import styled from "styled-components"
import Input from "./Input";
import BlueButton from "./BlutButton";
import axios from "axios";
import UserContext from './UserContext';
import {Navigate} from 'react-router-dom';
import ErrorBox from './ErrorBox';

const Container = styled.div`
padding: 30px 20px;
`;



function LoginPage(){
    const {user, checkAuth} = useContext(UserContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [redirectToHomePage, setRedirectToHomePage] = useState(false);
    
    function login(e){
        e.preventDefault();
        axios.post('http://3.90.201.108:3001/login',{
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
            <Header1 style={{marginBottom:'20px'}}>Login</Header1>
            {error && (
                <ErrorBox>{error}</ErrorBox>
            )}
            <form onSubmit={e => login(e)}>
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
                <BlueButton type={'submit'}>Login</BlueButton>
            </form>
        </Container>
    </>)
}

export default LoginPage;