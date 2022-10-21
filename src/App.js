import { useState, useEffect } from 'react';
import { BrowserRouter as Router,Routes, Route } from 'react-router-dom';
import { Reset } from 'styled-reset';
// pages
import HomePage from './pages/HomePage';
import AskPage from './pages/AskPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import SearchPage from './pages/SearchPage';
//import DebatePage from './pages/DebatePage';

import Header from './components/Header';
import GlobalStyles from './GlobalStyles';
import UserContext from './UserContext';
import axios from 'axios';

import config from './config';
let url = config.development.url + ':' + config.development.server.port

function App(){
  const [user, setUser] = useState(null);
  function checkAuth(){
    return new Promise(((resolve, reject) => {
      axios.get(`${url}/profile`, {withCredentials: true})
       .then((response) => {
        //console.log(response);
        setUser({
          seq: response.data.seq,
          email: response.data.email
        });
        resolve(response.data);
       })
       .catch(response => {
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
          <Routes>
            <Route path='/' element={<HomePage/>}/>
            <Route path='/login' element={<LoginPage/>}/>
            <Route path='/register' element={<RegisterPage/>}/>
            <Route path='/profile' element={<ProfilePage/>}/>
            <Route path='/ask' element={<AskPage/>}/>
            <Route path='/questions/:id' element={<QuestionDetailPage/>}/>
            <Route path='/search/:terms' element={<SearchPage/>}/>
          </Routes>          
        </UserContext.Provider>
      </Router>
    </div>
  )
}

export default App;