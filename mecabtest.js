let mecab = require('mecab-ya');
let text = '아버지가방에들어가신다.';

console.log(text);
mecab.pos(text, (err, result) => {
    console.log('pos : ', result);
});

mecab.morphs(text, (err, result) => {
    console.log('morphs : ', result);
});

console.log('nouns : ', mecab.nounsSync(text));