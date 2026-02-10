let student= document.getElementsByClassName("form-control");
let save = document.querySelector(".save");
let myForm = document.getElementById("my-form");
let email = document.getElementById("email");
let fname = document.getElementById("fname");
let lname = document.getElementById("lname");
let errorFname = document.getElementById("errorFname");
let errorLname = document.getElementById("errorLname");
let errorEmail = document.getElementById("errorEmail");
let BaseURL ='https://blogs2.csm.linkpc.net/api/v1'
let isvalid = true;
let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMzAsImlhdCI6MTc3MDI2NTY1NiwiZXhwIjoxNzcwODcwNDU2fQ.fzA0d3oKUzixWZpeQgNvHhuWCTTBRslGM2xYfWfhfWM';

getData=()=>{
    fetch(BaseURL +'/auth/profile',{
        headers:{"Authorization":"Bearer"+token}
    })
    .then(res=>res.json())
    .then(data=>{
        console.log(data);    
    })
}

getEdit=()=>{
    save.classList.remove("d-none");
    student[0].removeAttribute("readonly");
    student[1].removeAttribute("readonly");
    student[2].removeAttribute("readonly");

    
}
getSaves=()=>{
    if(validation()){
        console.log("save");
        save.classList.add("d-none");
        student[0].setAttribute("readonly","readonly");
        student[1].setAttribute("readonly","readonly");
        student[2].setAttribute("readonly","readonly");
    }else{
        return;
    } 
}
validation =()=>{
    event.preventDefault()
    if(!fname.value){
        errorFname.innerHTML="Required"
        // fname.style.border="1px solid red";
        isvalid = false
    }else{
        errorFname.innerHTML=""
        // fname.style.border="";
        isvalid = true
    }
    if(!lname.value){
        errorLname.innerHTML="Required"
        // lname.style.border="1px solid red";
        isvalid = false
    }else{
        errorLname.innerHTML=""
        // lname.style.border="";
        isvalid = true
    }
    if(!email.value){
        errorEmail.innerHTML="Invalid Email"
        // email.style.border="1px solid red";
        isvalid = false
    }else{
        errorEmail.innerHTML=""
        // email.style.border="";
        isvalid = true
    }
    return isvalid;
}

getData();