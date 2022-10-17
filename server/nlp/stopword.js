const kor = require('./stopwords_kor.js').kor;
const eng = require('./stopwords_eng.js').eng;

function remove_stopwords(tokens, stopwords){
    stopwords = stopwords || eng;
    return tokens.filter((value) =>{
        return stopwords.indexOf(value.toLowerCase()) === -1;
    });
}

module.exports = { remove_stopwords };