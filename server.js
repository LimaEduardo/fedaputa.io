const http = require('http')

const express = require("express")
const socketIO = require("socket.io")

var {Room} = require("./models/room")
var {User} = require("./models/user")
var {Users} = require("./models/users")
var {Rooms} = require("./models/rooms")

const PORT = process.env.PORT || 3000

var app = express()
var server = http.createServer(app)
var io = socketIO(server)

var rooms = new Rooms()
var users = new Users()

io.on('connection', (socket) => {

  var user = new User(socket.id, "Player 1")
  users.addUser(user)
  
  io.emit('listRooms', rooms)

  socket.on('newRoom', (params, callback) => {
    var newRoom = new Room(params.name, socket.id)
    rooms.addRoom(newRoom, () => {
      io.emit('errorRoom')
      callback(false)
      return
    })
    io.emit('listRooms', rooms)
    joinRoom(params.name, socket.id)
    callback(true)
  })

  socket.on('joinRoom', ({name}, callback) => {
    console.log(name)
    joinRoom(name, socket.id)
    callback()
  })

  socket.on('disconnect', () => {
    console.log('disconnected')
    var user = users.removeUser(socket.id)
    if (user) {
      if (user.isInARoom()){
        room = rooms.findRoom(user.room)
        if (room){
          room.removePlayer(socket.id, () => {
            rooms.removeRoom(room.name)
          })
        }
      }
      console.log("user disconnected")
    }
  })

  console.log("user connected!", socket.id)
})

server.listen(PORT , () => {
  console.log("Server running on PORT " + PORT)
})

function joinRoom(name, userId){
  var room = rooms.findRoom(name)
  var player = users.findUser(userId)
  if (player && room){
    room.addPlayer(player)
    player.enterRoom(name)
  }

}