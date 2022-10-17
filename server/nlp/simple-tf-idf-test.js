function tokenizer(document){
    const mecab = require('mecab-ya');
    const stopword = require('./stopword');
    
    let tokenized_document = [];
    for(let i in document){
        let tokens = mecab.nounsSync(document[i]);
        tokens = stopword.remove_stopwords(tokens);
        for(let i in tokens){
            tokens[i] = tokens[i].toLowerCase();
        };
        tokenized_document.push(tokens);
    }
    return tokenized_document;
}

function build_bag_of_words(tokenized_document){
    let word_to_index = new Map();
    let total_bow = [];
    let total_document = [];
    let bow = [];
    
    // �ϳ��� ������ ����
    for(let index in tokenized_document){
        for(let j in tokenized_document[index]){
            total_document.push(tokenized_document[index][j]);
        }
    }
    console.log('total document : ', total_document);
    
    // �ܾ index ����
    for(let word in total_document){
        if(word_to_index.get(total_document[word]) == null){
            // ó�� �����ϴ� �ܾ� ó��
            word_to_index.set(total_document[word], word_to_index.size);
            total_bow.splice(word_to_index.size - 1, 0, 1);
        }
        else{
            // ������ϴ� �ܾ� ó��
            let index = word_to_index.get(total_document[word]);
            total_bow[index] = total_bow[index] + 1;
        }
    }
    
    for(let index in tokenized_document){
        let bow_temp = [];
        bow_temp.length = word_to_index.size;
        bow_temp.fill(0);
        
        // ���� ������ BOW ���ϱ�(tf ���ϱ�)
        for(let word in bow_temp){
            let i = word_to_index.get(tokenized_document[index][word]);
            bow_temp[i] = bow_temp[i] + 1;
        }
        
        // NaN ����
        bow_temp = bow_temp.filter(function(item){
          return item !== null && item !== undefined && item !== '';
        });
        
        bow.push(bow_temp);
    }
    
    console.log('vocabulary : ', word_to_index);
    console.log('bag of words vectors(term frequency) : ', bow);
    
    return [word_to_index, bow];
}

function get_idf(bow){
    let df = [];
    df.length = bow[0].length;
    df.fill(0);
    
    // df ���ϱ�
    for(let i in df){
        for(let index in bow){
            if(bow[index][i] !== 0){
                df[i] += 1;
            }
        }
    }
    console.log('document frequency : ', df);

    let idf = [];
    let N = bow.length; // ��ü ������ ��
    idf.length = bow[0].length;
    idf.fill(0);
    
    // idf ���ϱ�
    for(let i in idf){
        idf[i] = 1 + Math.log(1 + N / (1 + df[i])); // �ڿ��α�
    }
    console.log('inverse document frequency : ',idf);
    
    return idf;
}

function get_tfidf(bow, idf){
    // tfidf ���ϱ�
    let tfidf = [];
    
    for(let i in bow){
        let tfidf_temp = [];
        tfidf_temp.length = bow[0].length;
        tfidf_temp.fill(0);
        
        for(let j in bow[0]){
            tfidf_temp[j] = bow[i][j] * idf[j];
        }
        
        tfidf.push(tfidf_temp);
    }
    console.log('TF-IDF : ', tfidf);
    
    return tfidf;
}

function cosine_similarity(tfidf){
    //0�� ������ �ٸ� ��� ������ ���ؼ� �ڻ��� ���絵�� ����
    let cos_sim = [];
    let normalized_zero = normalize(tfidf[0]);
    
    for(let i in tfidf){
        let scalar_product = 0;
        for(let j in tfidf[i]){
            // 0�� ���Ϳ� i�� ������ ��Į���
            scalar_product += tfidf[0][j] * tfidf[i][j];
        }
        
        let cos_sim_temp = 0;
        if(scalar_product === 0){
            // ���ڰ� 0�̸� �ڻ��� ���絵 = 0
            cos_sim_temp = 0;
        }
        else{
            // ���ڰ� 0�� �ƴϸ� �ڻ��� ���絵 ���� ���
            cos_sim_temp = scalar_product / (normalized_zero * normalize(tfidf[i]));
            cos_sim_temp = Number(cos_sim_temp.toFixed(5));
        }
        
        let cos_sim_obj = {
            index: i,
            similarity: cos_sim_temp
        };
        cos_sim.push(cos_sim_obj);
    }

    // ���絵 �������� ����    
    cos_sim.sort(function(a, b) {
        return b.similarity - a.similarity;
    });
    
    console.log('cosine_similarity : ', cos_sim);
    
    return cos_sim;
}

function similarity_test(document){
    // ���� ��ūȭ
    let tokenized_document = tokenizer(document);
    console.log('tokenized_document : ', tokenized_document);
    
    // ��� �ܾ index ����
    let result = build_bag_of_words(tokenized_document);
    let vocab = result[0];
    let bow = result[1];
    
    // ��� �ܾ��� idf ���ϱ�
    let idf = get_idf(bow);
    
    // ��� ������ tfidf ���ϱ�
    let tfidf = get_tfidf(bow, idf);
    
    // 0�� ������ ������ ������ ���絵 �˻�
    let cos_sim = cosine_similarity(tfidf);
}

function normalize(vector){
    // ���� ����ȭ ����
    let sum_square = 0;
    for(let i in vector){
        sum_square += vector[i] * vector[i];
    }
    
    return Math.sqrt(sum_square);
}

module.exports = {
    tokenizer,
    build_bag_of_words,
    get_idf,
    get_tfidf,
    cosine_similarity,
    similarity_test,
};