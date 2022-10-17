import QuestionsPage from "./QuestionsPage"


function HomePage(){
    return(
        <div>
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
export default HomePage;