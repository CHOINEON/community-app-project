import './App.css';
import React, { useState, useEffect } from 'react'
import axios from 'axios';

function App(){

  const [inputId, setInputId] = useState(null);
  const [inputPw, setInputPw] = useState(null);
  const [loginRs, setLoginRs] = useState(null);

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

    fetch('http://localhost:3001/getData',{
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

  const onClickLogin = (event) =>{
    event.preventDefualt();
    console.log('click login');

    fetch('http://localhost:3001/api/login?id=?&pw=?', [inputId, inputPw])
    .then(res => {
      console.log(res);
      return res.json();
    })
    .then(data => setLoginRs(data.rs));
  }

  const onClickLogin2 = (e) =>{
    axios.post('http://localhost:3001/api/login2', null, {
      params: {
        'User_id': inputId,
        'User_pw': inputPw
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

  const idChange = (e) =>{
    setInputId(e.target.value);
  }

  const pwChange = (e) =>{
    setInputPw(e.target.value);
  }
  
  return(
    <div>
      <h2>Hello world</h2>
      <button>btnn</button>
      <button onClick={getServerData}>btn</button>
      <button onClick={getServerData2}>btn2</button>
      <div>
        <h2>로그인 테스트</h2>
        <form action='/login' onSubmit={onClickLogin}>
          <input type='text' name='id' placeholder = '아이디를 입력해주세요' onChange={idChange}/>
          <input type='password' name='pw' placeholder='비밀번호를 입력해주세요' onChange={pwChange}/>
          <input type='submit' value='로그인'/>
        </form>
        <button onClick={onClickLogin2}>로그인2</button>
      </div>
    </div>
  )
}
export default App;