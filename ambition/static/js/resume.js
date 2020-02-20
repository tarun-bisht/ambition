window.onload=function ()
{
    //Set Resume Editor
    const resume_container=document.getElementById("resume-container");
    const resume=document.getElementById("resume");
    editor=new ResumeEditor(resume);
    editor.editor();
    editor.editorToolbar(document.getElementById("toolbar"));
    //Set Download and Print Button
    const button_print=document.getElementById("print");
    const button_download=document.getElementById("download");
    button_print.addEventListener("click",function()
    {
        let w=window.open('','_blank_');
        w.document.write('<html>');
        w.document.write(document.head.innerHTML);
        w.document.write('<body>');
        w.document.write(resume_container.innerHTML);
        w.document.write('</body></html>');
        setTimeout(function(){w.print();},1000);
    });
    button_download.addEventListener("click",function()
    {
        const resume_data=editor.editorData(style=false);
        let parser=new DOMParser();
        let doc=parser.parseFromString(resume_data,'text/html');
        let all_btn=doc.querySelectorAll("[hide]")
        for (let index = 0; index < all_btn.length; index++) 
        {
            all_btn[index].parentElement.removeChild(all_btn[index]);
        }
        const css_stylesheets=document.styleSheets;
        let html='<html><head>';
        html+='<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0 shrink-to-fit=no">';
        html+='<title>Resume</title>';
        html+='<link rel="stylesheet" type="text/css" href="css/resume.min.css">';
        html+='<link rel="stylesheet" type="text/css" href="css/theme.min.css">';
        html+='</head><body style="padding:5rem">';
        html+=doc.body.innerHTML+"</body></html>";
        const data={"html":html,"css1":css_stylesheets[1].href,"css2":css_stylesheets[2].href};
        send_downloadable_html(data);
    });
    //Handle Add button on Resume Creation
    const add_new=document.querySelectorAll('.new-element');
    add_new.forEach(function(element,index)
    {
        let button=create_button(element);
        button.onclick=function()
        {
            let div=document.createElement("div");
            div.innerHTML=element.nextElementSibling.innerHTML;
            element.parentElement.append(div);
        }
    });
    const add_new_next=document.querySelectorAll('.new-element-next');
    add_new_next.forEach(function(element,index)
    {
        let button=create_button(element);
        button.onclick=function()
        {
            let div=document.createElement("div");
            div.innerHTML=element.nextElementSibling.firstElementChild.innerHTML;
            element.nextElementSibling.append(div);
        }
    });
}
function create_button(element)
{
    let button=document.createElement("button");
    button.innerHTML='+';
    element.append(button);
    button.style="position:absolute;right:30%";
    button.setAttribute("hide","false");
    button.setAttribute("contentEditable","false");
    return button;
}
function send_downloadable_html(data)
{
    $.ajax({    
        data:data,
        url:'/download/resume/html',
        type:'POST'
        }).done(function(status)
          {
            console.log(status)
          });
}