const users = []

const adduser = ({id,username,room})=> {

     username = username.trim().toLowerCase()
     room = room.trim().toLowerCase()

    if(!username || !room){
        return {
            'error' : "Enter Username or Room"
        }
    }

    const exist = users.find((user)=> user.username === username && user.room === room)
    if(exist){
        return {
            'error' : "User with same Username is already exist in this Room"
        }
    }
     
    const user = {id,username,room}
    users.push(user)
    return {user}
}

const removeuser = (id)=>{
    const index = users.findIndex((user)=> user.id == id)

    return users.splice(index, 1)[0]
}

const getuser = (id)=> {
    return users.find((u)=> u.id === id)
   
}

const getusersbyroom = (room)=>{
    room = room.trim().toLowerCase()
    return users.filter((u)=> u.room == room)
    
} 

module.exports = {
    adduser,
    removeuser,
    getusersbyroom,
    getuser
}