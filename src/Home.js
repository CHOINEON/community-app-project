import styles from './Home.module.css'
import { Reset } from 'styled-reset';
import styled, {createGlobalStyle} from 'styled-components';
import React, { useState, useEffect } from 'react'
import Header from "./Header";
import QuestionsPage from "./QuestionsPage"
import axios from 'axios';

const GlobalStyles = createGlobalStyle`
  body{
    background: #fff;
    color:#2d2d2d;
    font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
`

function Home(){
    return(
        <div>
            <Reset/>
            <GlobalStyles/>
            <Header/>
            <QuestionsPage/>
        </div>
    )
}
/*
<h1>The Posts</h1>
{loading ? <strong>Loading...</strong> : null}
<div>
{posts.map((post) => (
<div key={post.id}>
  {post.bid} {post.title}
</div>
))}
</div>*/
export default Home;