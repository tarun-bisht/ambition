from flask import render_template,flash,url_for,redirect,request,Blueprint,current_app,abort,send_from_directory,jsonify,make_response
import os
import json
import tempfile
import requests
from zipfile import ZipFile
from sklearn.feature_extraction.text import CountVectorizer 
from sklearn.metrics.pairwise import cosine_similarity
import spacy 
import numpy as np
from collections import Counter
from string import punctuation
import requests
routes=Blueprint('routes',__name__)

nlp = spacy.load('en_core_web_sm') 
tempkeywords=[]

@routes.before_app_request
def before_request():
    if request.url.startswith('http://'):
        url = request.url.replace('http://', 'https://', 1)
        code = 301
        return redirect(url, code=code)

@routes.route("/")
def index():
    path=os.path.join(current_app.root_path,"templates","resume")
    resumes=os.listdir(path)
    resume_templates=[]
    for resume in resumes:
        file=os.path.join(path,resume)
        if os.path.isfile(file) and ".html" in os.path.splitext(file):
            resume_templates.append(os.path.splitext(resume)[0])
    return render_template("theme/theme.html",resume_templates=resume_templates,num_of_resume=len(resume_templates))

@routes.route("/<theme>")
def create(theme):
    try:
        return render_template("resume/"+theme+".html",title="Create")
    except Exception as e:
        print(e)
        return abort(404)

@routes.route("/download/resume/html",methods=["POST"])
def download_html():
    try:
        html=request.form["html"]
        css1link=request.form["css1"]
        css2link=request.form["css2"]
        path=os.path.join(current_app.root_path,"static","download","resume")
        zip_path=os.path.join(current_app.root_path,"static","download")
        with open(os.path.join(path,"resume.html"),"w") as index:
            index.write(html)
        resume_css=requests.get(css1link)
        theme_css=requests.get(css2link)
        with open(os.path.join(path,"css","resume.min.css"),"w") as cssfile:
            cssfile.write(resume_css.content.decode("utf-8"))
        with open(os.path.join(path,"css","theme.min.css"),"w") as cssfile:
            cssfile.write(theme_css.content.decode("utf-8"))
        with ZipFile(os.path.join(zip_path,"resume.zip"),"w") as zipfile:
            for folderName,subfolders,filenames in os.walk(path):
                for filename in filenames:
                    source=os.path.join(folderName, filename)
                    arcname = source[len(zip_path):].lstrip(os.sep)
                    zipfile.write(source,arcname=arcname)
        return send_from_directory(directory=zip_path,filename="resume.zip",as_attachment=True)
    except Exception as e:
        print(e)
        return jsonify(status=500)

@routes.route("/match/basic/resume",methods=['POST'])
def match_basic_resume():
    try:
        cv=CountVectorizer()
        resume=request.form["resume"]
        job_description=request.form["job_description"]
        count_matrix=cv.fit_transform([job_description,resume])
        similarity=cosine_similarity(count_matrix)
        return jsonify(similarity=round(similarity[0,1]*100,2),status=200)
    except:
        return jsonify(status=500)

@routes.route("/match/advance/resume",methods=['POST'])
def match_advance_resume():
    try:
        resume=request.form["resume"]
        job_description=request.form["job_description"]
        resume_tokens=nlp(resume)
        job_description_tokens=nlp(job_description)
        similarity=job_description_tokens.similarity(resume_tokens)
        return jsonify(similarity=round(similarity*100,2),status=200)
    except Exception as e:
        print(e)
        return jsonify(status=500)

@routes.route("/keyword/extractor",methods=['POST'])
def keyword_extractor():
    try:
        global tempkeywords
        job_description=request.form["job_description"]
        keywords=get_keywords(job_description)
        counter=Counter(keywords)
        most_common=counter.most_common(50)
        key=[]
        for word,count in most_common: 
            key.append(word)
        tempkeywords=key
        return jsonify(keywords=key,status=200)
    except Exception as e:
        print(e)
        return jsonify(status=500)

def get_keywords(text):
    result=[]
    allowed_words=['VERB', 'ADJ', 'NOUN'] # Verb,Adjective,Noun
    tokens=nlp(text.lower())
    for token in tokens:
        if(token.text not in nlp.Defaults.stop_words or token.text not in punctuation):
            if(token.pos_ in allowed_words):
                result.append(token.text)
    return result

@routes.route("/keyword/extractor/download")
def keyword_extractor_download():
    try:
        path=os.path.join(current_app.root_path,"static","download")
        with open(os.path.join(path,"keywords.txt"),mode='w') as file:
            for keyword in tempkeywords:
                file.write(str(keyword)+"\n")
        return send_from_directory(directory=path,filename="keywords.txt",as_attachment=True)
    except Exception as e:
        print(e)
        return jsonify(status=500)