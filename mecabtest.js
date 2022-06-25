let mecab = require('mecab-ya');
let text = '�ƹ������濡���Ŵ�.';

console.log(text);
mecab.pos(text, (err, result) => {
    console.log('pos : ', result);
});

mecab.morphs(text, (err, result) => {
    console.log('morphs : ', result);
});

console.log('nouns : ', mecab.nounsSync(text));