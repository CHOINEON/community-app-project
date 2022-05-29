# -*- coding: cp949 -*-
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from konlpy.tag import Okt
from konlpy.tag import Mecab
import pandas as pd
import os 
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
import tensorflow as tf
import getpass
import numpy as np
from numpy import dot
from numpy.linalg import norm
import matplotlib

#dataframe�� null���� �ִ� ��� ������ �־� null�� ����
def avoid_null(data, header):
    data[header] = data[header].fillna('')
    return data[header]

#tfidf���� �̿��� �ڻ������絵�� ����ϱ� ���� �Լ�
def cos_sim(A, B):
    return dot(A, B)/(norm(A)*norm(B))
    
#�Է¹��� dataframe�� title�� content���� ���� ������ tfidf�� ������ִ� �Լ�
#�ԷµǴ� dataframe�� header�� �ݵ�� title, content�� ���ԵǾ�� ��!
def tfidf(dataframe, TfidfVectorizer):
    #title�������� ������ null ���� ������
    dataframe['title'] = avoid_null(dataframe, 'title')

    #tf-idf��� �� ���
    tfidf_metrix_of_tit = TfidfVectorizer.fit_transform(dataframe['title'])
    return tfidf_metrix_of_tit

#�ԷµǴ� train�� ������ ���� �����ͼ��� �ڻ������絵 �� �� ���� 10�� ��������� �������� �Լ�
def top10_indices(data, q_num):
    #�Էµ� �������� �ڻ������絵 ���
    cos_sim = linear_kernel(data, data)

    cos_sim_score = list(enumerate(cos_sim[q_num])) 
    cos_sim_score = sorted(cos_sim_score, key = lambda x : x[1], reverse = True)
    #���� 10�� �׸��� ������
    score = cos_sim_score[1:11]
    tag_indices = [i[0] for i in score]

    return tag_indices

with tf.device('/cpu:0'):
    okky_data = pd.read_csv(r'OKKY C++ utf8 added.csv', encoding = "utf8", low_memory = False)
    

    tfidf_gen = TfidfVectorizer() #�Ϲ����� ���

    #ti-idf�� ����Ͽ� title�� content ���� ���� ���� �޾ƿ�
    data_tit = tfidf(okky_data, tfidf_gen) 

    for i in range(1):
        print(i, '/', len(okky_data))
        #���� ����� �����ͼ��� ���絵�� 10������ ������
        tit_10_q = okky_data['title'].iloc[top10_indices(data_tit, i)]
        print(str(i),"�� ���� ���� : ", okky_data.title[i])
        print(str(i),"�� ������ ������ ������ ���� �������\n", tit_10_q) 