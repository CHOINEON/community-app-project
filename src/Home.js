import './App.css';
import styles from './Home.module.css'
import React, { useState, useEffect } from 'react'
import axios from 'axios';

function Home(){
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const getPosts = async () =>{
        const response = await fetch(
            'http://3.90.201.108:3001/api/home'
        );
        const json = await response.json();
        setPosts(json);
        setLoading(false);
        console.log(json);
    };
    useEffect(() => {
        getPosts();
    }, []);

    return(
        <div>
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