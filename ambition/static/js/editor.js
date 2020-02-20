function ResumeEditor(container)
{
    let input_style="outline:none;margin:5px;padding:5px;width:180px;height:2rem;border-radius:7px 7px 7px 7px;border:1px solid #DDD;box-shadow:0 0 5px #aaa;";
    let button_style="outline:none;cursor:pointer;display:block;margin:10px;width:4rem;height:2rem;border:1px solid #DDD;box-shadow:0 0 5px #aaa;";
    let commands={"style":["bold","italic","underline","strikeThrough","subscript","superscript","insertOrderedList","insertUnorderedList"],
                    "format":["justifyLeft","justifyCenter","justifyRight","foreColor","backColor","textSize","unlink"],
                    "add":["createLink"],"command":["undo","redo"]};
    let colors=['000000','FF4E00','061A40','FFBE0B','CC0000','00CC00','0000CC','CE2D79','0A3C78','FFFFFF','320E3B','A72608'];
    let link_prompt=undefined;
    let selection=undefined;

    function clean_nodes(node)
    {
        //https://www.sitepoint.com/removing-useless-nodes-from-the-dom/
        for (let index = 0; index < node.childNodes.length; index++) 
        {
            let child=node.childNodes[index];
            if(child.nodeType===Node.COMMENT_NODE || (child.nodeType===Node.TEXT_NODE && !/\S/.test(child.nodeValue)))
            {
                node.removeChild(child);
                index--;
            }
            else if(child.nodeType===Node.DOCUMENT_POSITION_DISCONNECTED)
            {
                clean_nodes(child);
            }
        }
    }
    let create_link=function(url)
    {
        let a=document.createElement("a");
        a.setAttribute("href",url);
        return a;
    }
    let createLink=function(evt)
    {
        let url=link_prompt.inputs()[0].value;
        if(url==null || url=="")
        {
            alert("Invalid URL");
        }
        else
        {
            selection.surroundContents(create_link(url));
            selection=undefined;
        }   
    }
    let apply_color=function(evt,format_cmd)
    {
        document.execCommand("styleWithCSS",false,true);
        document.execCommand(format_cmd,false,evt.target.getAttribute("value"));
    }
    let tool_functionality=function(cmd)
    {
        if(cmd=="textSize")
        {
            let range = save_selection();
            if (range.startContainer.parentElement.tagName=="FONT")
            {
                let size=range.startContainer.parentElement.getAttribute("size");
                document.execCommand("fontSize",false,parseInt(size)+1)
                if(size>=7)
                {
                    document.execCommand("fontSize",false,1);
                }
                else
                {
                    document.execCommand("fontSize",false,parseInt(size)+1)
                }
            }
            else
            {
                document.execCommand("fontSize",false,1);
            }   
        }
        else if(commands["style"].indexOf(cmd)>=0 || commands["format"].indexOf(cmd)>=0 || commands["command"].indexOf(cmd)>=0)
        {
            document.execCommand(cmd,false,null);
        }
        else
        {
            console.warn("The specified tool do not exist.");
        }
    }

    let save_selection=function()
    {
        let select=null;
        try
        {
            select= window.getSelection().getRangeAt(0);
        }
        catch
        {
            select=null;
        }
        return select;
    }

    // EDITOR FUNCTIONALITIES
    this.editor=function()
    {
        if(container==null)
        {
            throw Error("No container found had to specify one");
        }
        let child=container.children;
        for(let i=0;i<child.length;i++)
        {
            if(child[i].tagName!="HR")
            {
                child[i].contentEditable=true;
            }
        }
    }
    this.editorToolbar=function(toolbar)
    {
        for (let index = 0; index < toolbar.childElementCount; index++) 
        {
            let child=toolbar.children[index];
            let cmd=child.getAttribute("action");
            if(cmd.endsWith("Color"))
            {
                let pallete=new ColorPallete(child,colors,apply_color,cmd);
                pallete.hide();
                child.onmouseover=function()
                {
                    pallete.show();
                }
                child.onmouseout=function()
                {
                    pallete.hide();
                }
            }
            else if(cmd=="createLink")
            {
                link_prompt=new PromptBox([{"placeholder":"Enter URL Here","value":""}],createLink,
                input_style,button_style);
                child.onclick=function()
                {
                    selection=save_selection();
                    if(selection!=undefined && selection.toString().length > 0)
                    {
                        link_prompt.show();
                    }
                }
            }
            else
            {
                child.onclick=function(evt)
                {
                    tool_functionality(cmd);
                }   
            }
        }
    }
    this.editorData=function(style=true)
    {
        let container_html=container.parentElement.innerHTML;
        let parser=new DOMParser();
        let data=parser.parseFromString(container_html,'text/html');
        let all_tags=data.querySelectorAll('*');
        for (let index = 0; index < all_tags.length; index++) 
        {
            let element=all_tags[index];
            element.removeAttribute("placeholder");
            element.removeAttribute("contenteditable");
            element.removeAttribute("spellcheck");
            if(!style)
            {
                element.removeAttribute("style");
            }
        }
        clean_nodes(data);
        return data.body.innerHTML;
    }
}

// PROMPT BOX
function PromptBox(inputs,onOKclick,input_css="",button_css="")
{
    let prompt_show_style="position:fixed;top:0;left:0;width:100%;height:100vh;z-index:100;background:rgb(0,0,0,0.1);";
    let prompt_hide_style="display:none;";
    let create_prompt=function()
    {
        let container=document.createElement("div");
        let box=document.createElement("div");
        box.style="position:relative;top:40%;left:0;display:flex;flex-direction:column;align-items:center;justify-content:space-around;padding:5px;width:250px;background:#fff;height:180px;margin:auto;border-radius:10px 0 0 0;border:1px solid #ddd;box-shadow:5px 5px 7px #777;";
        for (let index = 0; index < inputs.length; index++) 
        {
            let obj=inputs[index];
            let input=document.createElement("input");
            input.setAttribute("placeholder",obj["placeholder"]);
            input.value=obj["value"];
            input.style=input_css;
            box.append(input);
            input.addEventListener("keydown",function(evt)
            {
                if(evt.keyCode==13)
                {
                    onOKclick(evt);
                    container.style=prompt_hide_style;
                }
            });
        }
        let bottom=document.createElement("div");
        bottom.style="display:flex;justify-content:space-around;width:100%;margin-top:2rem;";
        let cancel=document.createElement("button");
        cancel.style=button_css;
        cancel.innerHTML="Close";
        cancel.onclick=function()
        {
            container.style=prompt_hide_style;
        }
        bottom.append(cancel);
        let ok=document.createElement("button");
        ok.style=button_css;
        ok.innerHTML="Ok";
        ok.onclick=function(evt)
        {
            onOKclick(evt);
            container.style=prompt_hide_style;
        }
        bottom.append(ok);
        box.append(bottom);
        container.append(box);
        document.body.append(container);
        container.style=prompt_hide_style;
        return container;
    }
    let prompt=create_prompt();
    let clear_inputs=function()
    {
        let prompt_box=prompt.firstElementChild;
        for (let index = 0; index < prompt_box.children.length-1; index++) 
        {
            prompt_box.children[index].value="";
        }
    }
    this.inputs=function()
    {
        let input={};
        let prompt_box=prompt.firstElementChild;
        for (let index = 0; index < prompt_box.children.length-1; index++) 
        {
            input[index]=prompt_box.children[index];
        }
        return input;
    }
    this.ok=function()
    {
        return prompt.firstElementChild.lastElementChild.lastElementChild;
    }
    this.show=function()
    {
        prompt.style=prompt_show_style;
    }
    this.hide=function()
    {
        prompt.style=prompt_hide_style;
        clear_inputs();
    }
}

//COLOR PALLETE
function ColorPallete(container,colors,color_click,format_cmd="foreColor")
{
    let pallete_show_style="display:flex;flex-wrap:wrap;justify-content:center;position:absolute;padding:5px;width:160px;background:#fff;height:120px;border-radius:10px 0 0 0;border:1px solid #ddd;box-shadow:0 0 5px #aaa;";
    let color_style="outline:none;cursor:pointer;display:block;margin:5px 5px 0 0;width:2rem;height:2rem;border-radius:7px 7px 7px 7px;border:1px solid #DDD;box-shadow:0 0 5px #aaa;";
    let pallete_hide_style="display:none";
    let create_pallete=function()
    {
        let box=document.createElement("div");
        for (let index = 0; index < colors.length; index++) 
        {
            let color=document.createElement("button");
            color.setAttribute("value","#"+colors[index]);
            color.style=color_style+"background-color:#"+colors[index]+";";
            box.append(color);
            color.onclick=function(evt)
            {
                color_click(evt,format_cmd);
            }
        }
        container.append(box);
        box.style=pallete_hide_style;
        return box;
    }
    let pallete=create_pallete();
    this.show=function()
    {
        pallete.style=pallete_show_style;
    }
    this.hide=function()
    {
        pallete.style=pallete_hide_style;
    }
}