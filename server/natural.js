function tokenizer(document){
    let mecab = require('mecab-ya');
    let tokenized_document = mecab.nounsSync(document);
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
        idf[i] = 1 + Math.log(N / (1 + df[i])); // �ڿ��α�
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

// DB������ ����� ��
function tokenizer_DB(document){
    let mecab = require('mecab-ya');
    document.title = mecab.nounsSync(document.title);
    return document;
}

function build_bag_of_words_DB(tokenized_document){
    let word_to_index = new Map();
    let total_bow = [];
    let total_document = [];
    let bow = [];
    
    // �ϳ��� ������ ����
    for(let index in tokenized_document){
        for(let j in tokenized_document[index].title){
            total_document.push(tokenized_document[index].title[j]);
        }
    }
    //console.log('total document : ', total_document);
    
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
        let bow_obj = {};
        let bow_temp = [];
        bow_temp.length = word_to_index.size;
        bow_temp.fill(0);
        
        // ���� ������ BOW ���ϱ�(tf ���ϱ�)
        for(let word in bow_temp){
            let i = word_to_index.get(tokenized_document[index].title[word]);
            bow_temp[i] = bow_temp[i] + 1;
        }
        
        // NaN ����
        bow_temp = bow_temp.filter(function(item){
          return item !== null && item !== undefined && item !== '';
        });
        
        bow_obj = {
            bid: tokenized_document[index].bid,
            bow: bow_temp
        };
        
        bow.push(bow_obj);
    }
    
    //console.log('vocabulary : ', word_to_index);
    //console.log('bag of words vectors(term frequency) : ', bow);
    
    return [word_to_index, bow];
}


function get_idf_DB(bow){
    let df = [];
    df.length = bow[0].bow.length;
    df.fill(0);
    
    // df ���ϱ�
    for(let i in df){
        for(let index in bow){
            if(bow[index].bow[i] !== 0){
                df[i] += 1;
            }
        }
    }
    //console.log('document frequency : ', df);

    let idf = [];
    let N = bow.length; // ��ü ������ ��
    idf.length = bow[0].bow.length;
    idf.fill(0);
    
    // idf ���ϱ�
    for(let i in idf){
        idf[i] = 1 + Math.log(N / (1 + df[i])); // �ڿ��α�
    }
    //console.log('inverse document frequency : ',idf);
    
    return idf;
}

function get_tfidf_DB(bow, idf){
    // tfidf ���ϱ�
    let tfidf = [];
    let tfidf_obj = {};
    
    for(let i in bow){
        let tfidf_temp = [];
        tfidf_temp.length = bow[0].bow.length;
        tfidf_temp.fill(0);
        
        for(let j in bow[0].bow){
            tfidf_temp[j] = bow[i].bow[j] * idf[j];
        }
        
        tfidf_obj = {
            bid: bow[i].bid,
            tfidf: tfidf_temp
        };
        
        tfidf.push(tfidf_obj);
    }
    //console.log('TF-IDF : ', tfidf);
    
    return tfidf;
}

function cosine_similarity_DB(tfidf){
    //0�� ������ �ٸ� ��� ������ ���ؼ� �ڻ��� ���絵�� ����
    let cos_sim = [];
    let normalized_zero = normalize(tfidf[0].tfidf);
    
    for(let i in tfidf){
        let scalar_product = 0;
        for(let j in tfidf[i].tfidf){
            // 0�� ���Ϳ� i�� ������ ��Į���
            scalar_product += tfidf[0].tfidf[j] * tfidf[i].tfidf[j];
        }
        
        let cos_sim_temp = 0;
        if(scalar_product === 0){
            // ���ڰ� 0�̸� �ڻ��� ���絵 = 0
            cos_sim_temp = 0;
        }
        else{
            // ���ڰ� 0�� �ƴϸ� �ڻ��� ���絵 ���� ���
            cos_sim_temp = scalar_product / (normalized_zero * normalize(tfidf[i].tfidf));
            cos_sim_temp = Number(cos_sim_temp.toFixed(5));
        }
        
        let cos_sim_obj = {
            bid: tfidf[i].bid,
            similarity: cos_sim_temp
        };
        cos_sim.push(cos_sim_obj);
    }

    // ���絵 �������� ����    
    cos_sim.sort(function(a, b) {
        return b.similarity - a.similarity;
    });
    
    // ���� 5���� bid�� ����
    let top5_cos_sim_bid = [];
    //console.log('cosine_similarity : ', cos_sim[0]);
    for(let i=1; i<6; i++){
        console.log(cos_sim[i]);
        top5_cos_sim_bid.push(cos_sim[i].bid);
    }
    //console.log('cosine_similarity : ', cos_sim);
    
    return top5_cos_sim_bid;
}

function save_tokenized_document_file(path, tokenized_document){
    const fs = require('fs');
    fs.writeFile(path, JSON.stringify(tokenized_document), err => {
        if(err){
            console.error(err);
            return;
        }
        else{
            console.log('tokenized_document saved in : ', path);
        }
    });
}

function load_tokenized_document_file(path){
    const fs = require('fs');
    let readData = fs.readFileSync(path);
    return JSON.parse(readData.toString());
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
    tokenizer_DB,
    build_bag_of_words,
    build_bag_of_words_DB,
    get_idf,
    get_idf_DB,
    get_tfidf,
    get_tfidf_DB,
    cosine_similarity,
    cosine_similarity_DB,
    save_tokenized_document_file,
    load_tokenized_document_file,
};