let title = document.getElementById("title");
let category = document.getElementById("category");
let content = document.getElementById("content");
let titleError = document.getElementById("titleError");
let categoryError = document.getElementById("categoryError");
let contentError = document.getElementById("contentError");
let isvalid = true;
getPublish=()=>{
    validation();

    
}
validation =()=>{
    event.preventDefault()
    if(!title.value.trim()){
        titleError.innerHTML="Title is required"
        title.classList.add("is-invalid");
        isvalid = false
    }else{
        titleError.innerHTML=""
        title.classList.remove("is-invalid");
        isvalid = true
    }
    if(!category.value){
        categoryError.innerHTML="Category is required"
        category.classList.add("is-invalid");
        isvalid = false
    }
    else{
        categoryError.innerHTML=""
        category.classList.remove("is-invalid");
        isvalid = true
    }
    if(!content.value.trim()){
        contentError.innerHTML="Content is required"
        content.classList.add("is-invalid");
        isvalid = false
    }else{
        contentError.innerHTML=""
        content.classList.remove("is-invalid");
        isvalid = true
    }
    return isvalid;
}