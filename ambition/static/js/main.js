window.onload=function ()
{
	navMenu();
    //Handle Match Resume
    const selection=document.getElementById("match").firstElementChild;
    const match=document.getElementById("match").lastElementChild;
    const match_section_elements=match.children;
    const m_textarea_job_description=match_section_elements[0]
    const m_textarea_resume=match_section_elements[1]
    const m_button=match_section_elements[2]
    m_button.addEventListener("click",function()
    {
    	const job_description_data=m_textarea_job_description.value;
    	const resume_data=m_textarea_resume.value;
    	if(job_description_data!="" && resume_data!="")
    	{
    		if(selection.value==="basic")
		    {
		    	basic_match_resume(resume_data,job_description_data);
		    }
		    else if(selection.value==="advance")
		    {
		    	advance_match_resume(resume_data,job_description_data);	
		    }
    	}
    });

    //Handle Keywords from Resume
    const keyword=document.getElementById("keyword").firstElementChild;
    const keyword_section_elements=keyword.children;
    const k_textarea_job_description=keyword_section_elements[0]
    const k_button=keyword_section_elements[1]
    k_button.addEventListener("click",function()
    {
    	const job_description_data=k_textarea_job_description.value;
    	if(job_description_data!="")
    	{
    		keyword_extract(job_description_data);
    	}
    });

}
let match_prompt=new PromptModal(labels={"cancel":"Close"},okbutton=false);
let keyword_prompt=new PromptModal(labels={"ok":"Download","cancel":"Close"},function(evt){},okbutton=true);
function basic_match_resume(resume,job_description)
{
	$.ajax({	
		data:{"resume":resume,"job_description":job_description},
	    url:'/match/basic/resume',
	    type:'POST'
	    }).done(function(status)
	      {
	      	if(status["status"]=="200")
	      	{
	      		let message='<p style="font-size:60px;width:100%;height:100%;display:flex;justify-content:center;align-items:center">';
	      		message+=status["similarity"]+"%"+"</p>";
	      		match_prompt.show(message);
	      	}
	      });
}
function advance_match_resume(resume,job_description)
{
	$.ajax({	
		data:{"resume":resume,"job_description":job_description},
	    url:'/match/advance/resume',
	    type:'POST'
	    }).done(function(status)
	      {
	      	if(status["status"]=="200")
	      	{
                let message='<p style="font-size:60px;width:100%;height:100%;display:flex;justify-content:center;align-items:center">';
                message+=status["similarity"]+"%"+"</p>";
                match_prompt.show(message);
	      	}
	      });
}
function keyword_extract(job_description)
{
	$.ajax({	
		data:{"job_description":job_description},
	    url:'/keyword/extractor',
	    type:'POST'
	    }).done(function(status)
	      {
	      	if(status["status"]=="200")
	      	{
	      		const keywords=status["keywords"];
	      		let message="";
	      		for(let i=0;i<keywords.length;i++)
	      		{
	      			message+='<p style="font-size:18px">'+keywords[i]+'</p>';
	      		}
	      		keyword_prompt.show(message);
	      		keyword_prompt.ok().addEventListener("click",function(evt)
	      		{
	      			evt.preventDefault();
	      			download_keywords();
	      			keyword_prompt.hide();
	      		});
	      	}
	      });
}
function download_keywords()
{
	window.location.href="/keyword/extractor/download";
}

// PROMPT Modal
function PromptModal(labels={"ok":"Ok","cancel":"Cancel"},onOKclick=function(){},okbutton=true)
{
    const prompt_show_style="position:fixed;top:0;left:0;width:100%;height:100vh;z-index:100;background:rgb(0,0,0,0.1);";
    const prompt_hide_style="display:none;";
    const background="background:-webkit-gradient(linear, left top, left bottom, from(#e732ff),color-stop(29%, #c126c9), color-stop(53%, #a31aa3), to(#570063));background:linear-gradient(top, #e732ff 0%, #c126c9 29%, #a31aa3 53%, #570063 100%);"
    const button_css="width:100px;outline:none;background:#fff;border-radius:20px;border:none;color:#111;height:30px;line-height:30px;cursor:pointer;text-transform:uppercase";
    let create_prompt=function(okbutton)
    {
        let container=document.createElement("div");
        let box=document.createElement("div");
        box.style="position:relative;top:20%;left:0;color:#fff;"+background+";display:flex;flex-direction:column;align-items:center;justify-content:space-around;padding:5px;width:65%;height:50%;margin:auto;border-radius:50px 10px 50px 10px;border:1px solid #7323baff;box-shadow:5px 5px 7px #7323baff;";
        let p=document.createElement("div");
        p.style="-ms-overflow-style:none;height:90%;width:100%;text-align:center;padding:2rem;overflow-y:auto;line-height:2rem;letter-spacing:2px;p::-webkit-scrollbar{display:none}";
        box.append(p);
        let bottom=document.createElement("div");
        bottom.style="padding:1rem;height:10%;display:flex;justify-content:space-around;width:100%;margin-top:2rem;";
        let cancel=document.createElement("button");
        cancel.innerHTML=labels["cancel"];
        cancel.style=button_css;
        cancel.onclick=function()
        {
	        document.body.style.overflow = 'auto';
            container.style=prompt_hide_style;
        }
        bottom.append(cancel);
        if(okbutton)
        {
        	let ok=document.createElement("button");
	        ok.innerHTML=labels["ok"];
	        ok.style=button_css;
	        ok.onclick=function(evt)
	        {
	        	onOKclick(evt);
	            container.style=prompt_hide_style;
	        }
	        bottom.append(ok);
        }
        box.append(bottom);
        container.append(box);
        document.body.append(container);
        container.style=prompt_hide_style;
        return container;
    }
    let prompt=create_prompt(onOKclick,okbutton);
    this.show=function(message="")
    {
    	const msg=prompt.firstElementChild.firstElementChild;
    	msg.innerHTML=message;
        prompt.style=prompt_show_style;
        document.body.style.overflow = 'hidden';
    }
    this.ok=function()
    {
    	if(okbutton)
    	{
    		return prompt.firstElementChild.lastElementChild.lastElementChild;
    	}
    	return undefined;
    }
    this.hide=function()
    {
        document.body.style.overflow = 'auto';
		prompt.style=prompt_hide_style;
    }
}