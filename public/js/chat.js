const socket = io()

const {username,room} = Qs.parse(location.search, {ignoreQueryPrefix: true})
console.log({username,room})
const messages = document.querySelector('#messages')
const users = document.querySelector('#users')
const messagetemplate = document.querySelector('#message-template').innerHTML
const usertemplate = document.querySelector('#sidebar-template').innerHTML
const locationtemplate = document.querySelector('#location-template').innerHTML

const autoscroll = () =>{
  const newmsg = messages.lastElementChild
  const newmsgstyle = getComputedStyle(newmsg)
  const newmsgmargin = parseInt(newmsgstyle.marginBottom)
  const newmsgHeight = newmsg.offsetHeight + newmsgmargin

  const visibleheight = messages.offsetHeight
  const containerheight = messages.scrollHeight

  const scrolloffset = messages.scrollTop + visibleheight

  if(containerheight - newmsgHeight <= scrolloffset){
      messages.scrollTop = messages.scrollHeight
  }
}

socket.on('roomdata',(data)=>{
    console.log(data)
    const html = Mustache.render(usertemplate,{
        users: data.users,
        room: data.room
    })
    users.innerHTML = html
})

socket.on('message', (msg)=>{
    console.log(msg)
    const html = Mustache.render(messagetemplate,{
        msg: msg.text,
        username: msg.username,
        tym: moment(msg.createdAt).format("D/MM/YY h:mm:ss A ") 
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locmessage', (url)=>{
    
    console.log(url)
    console.log(url.text)
    const html = Mustache.render(locationtemplate,{
        url: url.text,
        username: url.username,
        tym: moment(url.createdAt).format("D/MM/YY h:mm:ss A ") 
    })
    messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


const frm = document.getElementById('frm')
const frinput = frm.querySelector('input')
const frbutton = frm.querySelector('button')

frm.addEventListener('submit',(e)=>{
    frbutton.setAttribute('disabled', 'disabled')
    e.preventDefault()
    const inp = e.target.elements.msg.value
   
    socket.emit('sendmessage', inp, (cb)=>{
        frbutton.removeAttribute('disabled')
        frinput.value = ''
        frinput.focus()
        console.log(cb)
    })
})

const shareloc = document.getElementById('share-loc')

shareloc.addEventListener('click', ()=> {
    shareloc.setAttribute('disabled', 'disabled')
    if(!navigator.geolocation){
        alert('browser does not support geolocation')
    }

    navigator.geolocation.getCurrentPosition((position)=> {
        console.log(position.coords.latitude)
        console.log(position.coords.longitude)

        socket.emit('shareloc' , { latitude : position.coords.latitude , 
            longitude : position.coords.longitude},
            (cb)=>{
                setTimeout(()=>{
                    shareloc.removeAttribute('disabled')
                },2000)
                console.log(cb)
            }
            )
    })
})

socket.emit('join', {username,room}, (error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})