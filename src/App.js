import { useState, useEffect } from 'react';
import { BrowserRouter as Router,Routes, Route } from 'react-router-dom';
import { Reset } from 'styled-reset';
import Home from './Home';
import QuestionDetail from './QuestionDetail';
import AskPage from './AskPage';
import Header from './Header';
import GlobalStyles from './GlobalStyles';
import UserContext from './UserContext';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ProfilePage from './ProfilePage';
import axios from 'axios';

function App(){
  const [user, setUser] = useState(null);
  function checkAuth(){
    return new Promise(((resolve, reject) => {
      axios.get('http://3.90.201.108:3001/profile', {withCredentials: true})
       .then((response) => {
         setUser({email:response.data});
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
            <Route path='/' element={<Home/>}/>
            <Route path='/login' element={<LoginPage/>}/>
            <Route path='/register' element={<RegisterPage/>}/>
            <Route path='/profile' element={<ProfilePage/>}/>
            <Route path='/ask' element={<AskPage/>}/>
            <Route path='/question/:id' element={<QuestionDetail/>}/>
          </Routes>          
        </UserContext.Provider>
      </Router>
    </div>
  )
}

/*
function App(){
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState([]);
  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => response.json())
      .then((json) => {
        setCoins(json);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1>The Coins</h1>
      {loading ? <strong>Loading...</strong> : null}
      <ul>
        {coins.map((coin) => (
          <li>
            {coin.name} : ${coin.quotes.USD.price}
          </li>
        ))}
      </ul>
    </div>
  )
}
*/
/*
function App(){
  const [keyword, setKeyword] = useState("");
  const onChange = (event) => setKeyword(event.target.value);
  useEffect(() => {
    console.log("run only once");
  }, []);
  useEffect(() => {
    if (keyword !== "" && keyword.length > 5){
      console.log("SEARCH FOR", keyword);
    }
  }, [keyword]);
  return(
    <div>
      <h1 className={styles.title}>Welcome</h1>
      <input 
      value={keyword} 
      onChange={onChange} 
      type="text" 
      placeholder='Search here...'></input>
    </div>
  )
}
*/

/*
function App(){

  const [inputId, setInputId] = useState(null);
  const [inputPw, setInputPw] = useState(null);
  const [loginRs, setLoginRs] = useState(null);

  const [inputTitle, setInputTitle] = useState(null);

  const getServerData = () =>{

    fetch('http://localhost:3001/group',{
      method : 'GET',
      headers : {'Content-Type' : 'application/json'}
    })
    .then(res => {
      console.log(res);
      console.log(typeof(res));
      return res.json();
    })
    .then(res => console.log(res));
  }  

  const getServerData2 = () =>{

    fetch('http://3.90.201.108:3001/getData',{
      method : 'GET',
      headers : {'Content-Type' : 'application/json'}
    })
    .then(res => {
      console.log(res);
      console.log(typeof(res));
      return res.json();
    })
    .then(res => {
      console.log(res);
      console.log(res[0].User_seq);
      console.log(res[0].User_id);
      console.log(res[0].User_pw);
    });
  }

  const onClickLogin = (e) =>{
    e.preventDefault();
    console.log(1);
    console.log(inputId,inputPw);


    fetch(`http://3.90.201.108:3001/api/login?id=${inputId}&pw=${inputPw}`)
    .then(res => {
      console.log(res);
      console.log(typeof(res));
      return res.json();
    })
    .then(data => setLoginRs(data.rs));
  }


  const onClickLogin2 = (e) =>{
    e.preventDefault();
    axios.post('http://3.90.201.108:3001/api/login2', null, {
      params: {
        'id': inputId,
        'pw': inputPw
      }
    })
    .then((res)=>{
      console.log(res);
      console.log('res.data.userId :: ', res.data.userId);
      console.log('res.data.msg :: ', res.data.msg);
      if(res.data.userId === undefined){
        // id 일치하지 않는 경우 userId = undefined, msg = '입력하신 id 가 일치하지 않습니다.'
        console.log('======================',res.data.msg);
        alert('입력하신 id 가 일치하지 않습니다.');
      } 
      else if(res.data.userId === null){
        // id는 있지만, pw 는 다른 경우 userId = null , msg = undefined
        console.log('======================','입력하신 비밀번호 가 일치하지 않습니다.');
        alert('입력하신 비밀번호 가 일치하지 않습니다.');
      } 
      else if(res.data.userId === inputId) {
        // id, pw 모두 일치 userId = userId1, msg = undefined
        console.log('======================','로그인 성공');
        alert('로그인 성공');
        sessionStorage.setItem('user_id', inputId);
      }
      // 작업 완료 되면 페이지 이동(새로고침)
      document.location.href = '/';
    })
    .catch();
  }


  let obj = {'id':inputId,'pw':inputPw};
  
  const onClickLogin3 = (e) =>{
    e.preventDefault();
    console.log(3);
    console.log(inputId,inputPw);

    fetch('http://3.90.201.108:3001/api/login3',{
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        id: inputId,
        pw: inputPw
      }),
    })
    .then(res => {
      console.log(res);
      return res.json();
    })
    .then(data => setLoginRs(data.rs));
  }

  const onClickExpectedAnswer = (e) =>{
    e.preventDefault();
    console.log(inputTitle);

    fetch('http://3.90.201.108:3001/api/expectedAnswer',{
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json;charset=utf-8'
      },
      body: JSON.stringify({
        title: inputTitle
      }),
    })
    .then(res => {
      console.log(res);
      return res.json();
    })
    .then(data =>{
      console.log(data);
    });
  }

  const idChange = (e) =>{
    setInputId(e.target.value);
  }

  const pwChange = (e) =>{
    setInputPw(e.target.value);
  }

  const titleChange = (e) =>{
    setInputTitle(e.target.value);
  }
  
  return(
    <div>
      <h2>DB Test</h2>
      <button>btn</button>
      <button onClick={getServerData}>btn2</button>
      <button onClick={getServerData2}>btn3</button>
      <div>
        <h2>로그인 테스트</h2>
        <form action='/api/login' onSubmit={onClickLogin} >
          <input type='text' name='id' placeholder = '아이디를 입력해주세요' onChange={idChange}/>
          <input type='password' name='pw' placeholder='비밀번호를 입력해주세요' onChange={pwChange}/>
          <input type='submit' value='로그인'/>
        </form>
        <button onClick={onClickLogin2}>로그인2</button>
        <button onClick={onClickLogin3}>로그인3</button>
      </div> 
      

      <h2>예상 답변 테스트</h2>
      <form action='/api/expectdAnswer'>
        <input type='text' name='title' placeholder='질문을 입력해주세요' onChange={titleChange}/>
      </form>
      <button onClick={onClickExpectedAnswer}>예상 답변 확인하기</button>
    </div>
  )
}
*/

export default App;