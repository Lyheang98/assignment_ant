let email = document.getElementById("email")
let password = document.getElementById("password")
let email_error = document.getElementById("email_error")
let password_error = document.getElementById("password_error")

const login = () =>{
    event.preventDefault();
    if(!email.value){
        email.style.border = "1px solid red"
        email_error.innerHTML = "Email is required"
    }else{
        email_error.innerHTML = ""
        email.style.border = "1px solid black"
    }

    if(!password.value){
        password.style.border = "1px solid red"
        password_error.innerHTML = "Password cannot be empty"
    }else{
        password_error.innerHTML = ""
        password.style.border = "1px solid black"
    }
}
