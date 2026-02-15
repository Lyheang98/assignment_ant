let tbody = document.querySelector("#tbody");
let BaseURL = 'https://blogs2.csm.linkpc.net/api/v1';
// let token = localStorage.getItem("token");
let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMzIsImlhdCI6MTc3MTE0MTQ2MiwiZXhwIjoxNzcxNzQ2MjYyfQ.Ch6J0Oa09yX_1VPd1_oHswU9hjJ-KWRX6yykKxDs0tY"
getItems=()=>{
    tbody.innerHTML="";
    fetch(BaseURL + '/articles/own',{
        headers:{
            "Authorization": `Bearer ${token}`,
            "Content-Type":"application/json"   
        }
    })
    .then(res=>res.json())
    .then(data=>{
        console.log(data.data.items);
        data.data.items.forEach(item =>{
            let tr = `<tr>
                        <td>${item.title}</td>
                        <td>${item.category}</td>
                        <td>${item.content}</td>
                        <td>
                            <img src="${item.thumbnail}" class="thumbnail-img img-fluid">
                        </td>
                        <td class="text-center">
                            <button class="btn btn-outline-secondary action-btn me-2">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-outline-danger action-btn"  onclick="getDelete(${item.id})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
        `
         tbody.innerHTML += tr;
        
        });
    }) 
}
createItem=()=>{
    // validation()
    if(validation()){
        fetch(BaseURL + '/articles',{
            method:"POST",
            headers:{
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'  
            },
            body:JSON.stringify({
                title:title.value,
                content:content.value,
                thumbnail:thumbnail.value
            })
        })
        .then(res=>res.json)
        .then(data=>{
            getItems() 
            
        })
    }else{
        return;
    }
}
getDelete=(id)=>{

    // alert(categoryId);
    fetch(BaseURL + '/articles/'+id,{
        method:"delete",
        headers:{
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'  
        }
    })
    .then(res=>res.json())
    .then(data=>{
        alert("are u sure for delete");
        getItems()
        myForm.reset();
    })
}
getUpdate=()=>{
    if(validation()){
        fetch(BaseURL + '/articles',{
            method:"PUT",
            headers:{
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'  
            },
            body:JSON.stringify({
                title:title.value,
                content:content.value,
                thumbnail:thumbnail.value
            })
        })
        .then(res=>res.json)
        .then(data=>{
            getItems()
        })
    }else{
        return;
    }
}

getItems()