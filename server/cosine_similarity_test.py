# -*- coding: cp949 -*-
import os
import time
start = time.time()  # start time
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import linear_kernel
from konlpy.tag import Okt
from konlpy.tag import Mecab
import pandas as pd
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
    #print(cos_sim)

    cos_sim_score = list(enumerate(cos_sim[q_num])) 
    cos_sim_score = sorted(cos_sim_score, key = lambda x : x[1], reverse = True)
    #print(cos_sim_score)
    #���� 5�� �׸��� ������
    score = cos_sim_score[1:6]
    tag_indices = [i[0] for i in score]
    #print(tag_indices)

    return tag_indices

with tf.device('/cpu:0'):
    data = pd.read_csv('/home/ksh/node-project/server/userQuestionAndDBdata.csv', encoding = "utf8", low_memory = False)
    #print(data)

    tfidf_gen = TfidfVectorizer() #�Ϲ����� ���

    #ti-idf�� ����Ͽ� title ���� �޾ƿ�
    data_tit = tfidf(data, tfidf_gen)
    #print(data_tit)

    for i in range(1):
        #print(i, '/', len(data))
        #���� ����� �����ͼ��� ���絵�� 5������ ������
        tag_indices = top10_indices(data_tit, i)
        print("������� ����  : ", data.title[i])
        print("������� ������ ������ ������ ���� �������\n")
        for j in range(5):
            print(data['bid'].iloc[tag_indices[j]], data['title'].iloc[tag_indices[j]])
           
    
    print("python runtime :", time.time() - start)  # current time - start time