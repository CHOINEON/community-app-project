import { useState, useEffect } from 'react';
import { BrowserRouter as Router,Routes, Route } from 'react-router-dom';
import { Reset } from 'styled-reset';
import { ProSidebarProvider } from 'react-pro-sidebar';
import styled from "styled-components"
// pages
import HomePage from './pages/HomePage';
import AskPage from './pages/AskPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import QuestionsPage from './pages/QuestionsPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import SearchPage from './pages/SearchPage';
import MakeDebatePage from './pages/MakeDebatePage';
import DebateDetailPage from './pages/DebateDetailPage';
import DebatesPage from './pages/DebatesPage';

import Header from './components/Header';
import LeftSideBar from './components/LeftSideBar';
import GlobalStyles from './GlobalStyles';
import UserContext from './UserContext';
import axios from 'axios';

import config from './config';
let url = config.development.url + ':' + config.development.server.port

const Center = styled.div`
  //height: 92vh;
  display: flex;
  flex-direction: row;
`

const Content = styled.div`
    flex-grow: 1;
`

function App(){
  const [user, setUser] = useState(null);
  function checkAuth(){
    return new Promise(((resolve, reject) => {
      axios.get(`${url}/profile`, {withCredentials: true})
       .then((response) => {
        console.log('auth success', response);
        setUser({
          seq: response.data.seq,
          email: response.data.email
        });
        resolve(response.data);
       })
       .catch(response => {
          console.log('auth fail', response);
          setUser(null);
          reject(null);
      });
    }));
  }
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  return(
    <div>
      <Reset/>
      <GlobalStyles/>
      <Router>
        <UserContext.Provider value={{user, checkAuth}}>
          <Header/>
          <Center>
            <LeftSideBar/>
            <Content>
            <Routes>
              <Route path='/' element={<HomePage/>}/>
              <Route path='/login' element={<LoginPage/>}/>
              <Route path='/register' element={<RegisterPage/>}/>
              <Route path='/profile' element={<ProfilePage/>}/>
              <Route path='/ask' element={<AskPage/>}/>
              <Route path='/questions' element={<QuestionsPage/>}/>
              <Route path='/questions/:id' element={<QuestionDetailPage/>}/>
              <Route path='/search/:terms' element={<SearchPage/>}/>
              <Route path='/make' element={<MakeDebatePage/>}/>
              <Route path='/debates' element={<DebatesPage/>}/>
              <Route path='/debates/:id' element={<DebateDetailPage/>}/>
            </Routes>
            </Content>
          </Center>
        </UserContext.Provider>
      </Router>
    </div>
  )
}

export default App;