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
    let terms = req.params.terms;
    terms = terms.split('+');
    //console.log(terms);
    console.log(`Search ${terms}`);
    console.time('search time');
    let result = find_terms(terms);
    console.timeEnd('search time');
    console.log(result);

    res.send(result);
})

module.exports = SearchRoutes;