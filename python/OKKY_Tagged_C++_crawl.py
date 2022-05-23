from bs4 import BeautifulSoup as bs
import urllib.request
import re
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import pandas as pd
import datetime
import os
import getpass

# OKKY Q&A게시판의 제목/내용/링크를 csv 파일로 저장

ROOT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../"))


def get_URL(page):
    url_before_page = "https://okky.kr/articles/tagged/c%2B%2B?offset="
    url_after_page = "&max=24&sort=id&order=desc"
    URL = url_before_page + page + url_after_page

    return URL


def get_link(csv_name, page_num):

    for i in range(page_num):
        current_page = i * 20 + 20
        URL = get_URL(str(current_page))
        source_code_from_URL = urllib.request.urlopen(URL)
        soup = bs(source_code_from_URL, "lxml", from_encoding="utf-8")

        for j in range(0,24,1):
            paper_link = soup.select("li.list-group-item > div.list-title-wrapper > h5.list-group-item-heading > a")[j]["href"]
            paper_url = "http://okky.kr" + paper_link

            reference_data = get_reference(paper_url)

            save_csv(csv_name, reference_data)


def get_reference(URL):
    driver_path = os.path.join(ROOT_PATH, "chromedriver")
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()), options=webdriver.ChromeOptions().add_argument("headless")
    )
    driver.get(URL)

    html = driver.page_source
    soup = bs(html, "html.parser")

    title = soup.find("h2", "panel-title")
    title_txt = title.get_text("", strip=True)
    title_kor = re.sub("\n\b", "", str(title_txt).strip())
    # print(title_txt)

    content = soup.find("article", "content-text")
    content_txt = content.get_text("", strip=True)
    content_kor = re.sub("\n\b", "", str(content_txt).strip())
    # print(content_txt)

    # txt_kor = txt_box[1]
    # txt_eng = txt_box[3]

    reference_data = pd.DataFrame(
        {
            "title": [title_kor],
            "content": [content_kor],
            "link": [URL],
        }
    )

    driver.close()

    return reference_data


def save_csv(csv_path, data):
    csv = csv_path.replace("/", "\\")
    if os.path.isfile(csv_path):
        data.to_csv(csv, mode="a", header=False, index=False)
    else:
        data.to_csv(csv, mode="w", header=True, index=False)


def make_folder(folder_name):
    if not os.path.isdir(folder_name):
        os.mkdir(folder_name)


if __name__ == "__main__":
    now = datetime.datetime.now().strftime("%Y-%m-%d")
    user_name = getpass.getuser()
    folder_root = "./example"
    path = folder_root + now
    make_folder(path)
    print(ROOT_PATH)
    filename = input("저장할 csv 이름을 입력해주세요")
    csv_path = path + "/" + filename + ".csv"
    page_num = input("크롤링할 페이지 수를 입력해주세요.")
    get_link(csv_path, int(page_num))