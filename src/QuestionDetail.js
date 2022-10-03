import { useEffect } from 'react';
import {useParams} from 'react-router-dom'

function QuestionDetail(){
    const {id} = useParams();
    const getQeustion = async () =>{
        const response = await fetch('http://3.90.201.108:3001/api/questionDetail',{
                method: 'Post',
                headers: {
                    'Content-Type' : 'application/json;charset=utf-8'
                  },
                  body: JSON.stringify({
                    id: id,
                  }),
            }
        );
        const json = await response.json();
        const result = json[0];
        console.log(result);
    };
    useEffect(() =>{
        getQeustion();
    },[])
    return(
        <div>
            Question Detail
        </div>
    )
}

export default QuestionDetail