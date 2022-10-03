import styles from './Home.module.css'
import React, { useState, useEffect } from 'react'
import Header from "./Header";
import QuestionsPage from "./QuestionsPage"
import axios from 'axios';


function Home(){
    return(
        <div>
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