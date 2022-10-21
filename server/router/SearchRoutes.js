const express = require('express');
const SearchRoutes = express.Router();
const db = require('../dbconnection');
const { tokenizer, load_document_file } = require('../nlp/simple-tf-idf-db');

let invertedIndex = load_document_file('./data/cur_invertedIndex_DB');
console.log('load inverted index to memory');

function binary_search_term(target, dataArray){
    let low = 0;
    let high = dataArray.length - 1;

    while(low <= high){
        let mid = Math.floor((low+high)/2);
        let guess = dataArray[mid].word;
        if(target === guess){
            console.log(target, mid);
            return dataArray[mid].bid;
        }
        else if(target > guess){
            low = mid + 1;
        }
        else{
            high = mid - 1;
        }
    }
    console.log('can\'t find ' + target);
    return [];
}

function find_terms(terms){
    let result = [];
    for(let i=0;i<terms.length;i++){
        let term = terms[i];
        let temp_res = binary_search_term(term, invertedIndex);
        temp_res.forEach((bid) => {
            if(!result.includes(bid)){
                result.push(bid);
            }
        })
    }
    return result;
}

SearchRoutes.get('/search/:terms', (req, res) => {
    console.time('inverted index + db query time');
    //console.time('db query time');
    let terms = req.params.terms;
    terms = terms.split('+');
    //console.log(terms);
    console.log(`Search ${terms}`);
    console.time('binary search time');
    let bids = find_terms(terms);
    bids.sort((a, b) =>{
        return b - a;
    })
    console.timeEnd('binary search time');
    //console.log(bids);
    console.log('number of bids containing search terms: ', bids.length);
    if(bids.length === 0){
        res.sendStatus(404);
        return;
    }

    db.query('select * from board2 where bid IN (?) order by bid DESC Limit 15', [bids], (err, rows) =>{
        if(err) res.sendStatus(422);
        let DBdata = rows.map(v => Object.assign({}, v));
        //console.log(DBdata);
        console.timeEnd('inverted index + db query time');
        res.send(DBdata);
    })
    
    // 단순한 db 쿼리 비교용
    // db.query('select * from board2 where content regexp \'koko\' order by bid DESC Limit 15', (err, rows) => {
    //     if(err) res.sendStatus(422);
    //     let DBdata = rows.map(v => Object.assign({}, v));
    //     console.timeEnd('db query time');
    // })
    // res.send('done');
})

module.exports = SearchRoutes;