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

  var user = new User(socket.id, "Unnamed player")
  users.addUser(user)
  
  io.emit('listRooms', rooms)

  socket.on('newRoom', (params, callback) => {
    var newRoom = new Room(params.name, socket.id)
    rooms.addRoom(newRoom, () => {
      io.emit('errorRoom')
      callback(false)
      return
    })

    var room = joinRoom(params.name, socket.id, params.playerName)
    if (room) {
      socket.join(room.name)
      io.to(room.name).emit('updatePlayerList', room.getPlayers())
      callback(true, room)
    }
    
    io.emit('listRooms', rooms)
  })

  socket.on('joinRoom', ({name, playerName}, callback) => {
    var room = joinRoom(name, socket.id, playerName)
    if (room){
      socket.join(room.name)
      io.to(room.name).emit('updatePlayerList', room.getPlayers())
      io.emit('listRooms', rooms)
      callback(room)
    }
  })

  socket.on('playerReady', (ready) => {
    var player = users.findUser(socket.id)
    player.ready = ready
    var room = rooms.findRoom(player.room)
    room.playerIsReady(socket.id, ready)
    io.to(room.name).emit('updatePlayerList', room.getPlayers())
  })

  socket.on('startMatch', () => {
    var player = users.findUser(socket.id)
    var room = rooms.findRoom(player.room)
    room.changeNumCards()
    room.beginMatch().then(() => {
      //TODO: Not updating
      io.emit('listRooms', rooms)
      io.to(room.name).emit('givePlayersCards', room.getPlayers())
      io.to(room.name).emit('sendPlayersPoints', room.getPlayers())
      io.to(room.name).emit('startMatchWithCards', room.currentTurn())
    }, () => {
      io.to(room.name).emit('playersNotReady')
    })
  })

  socket.on('setRoundsToWin', (num) => {
    var player = users.findUser(socket.id)
    var room = rooms.findRoom(player.room)
    player.pointsToDo = num['roundsToWin']
    io.to(room.name).emit('updatePlayerPoints', room.getPlayers())
  })

  socket.on('playerMove', (card) => {
    var player = users.findUser(socket.id)
    io.to(player.room).emit('cardPlayed', {card, playerName: player.name})
    var room = rooms.findRoom(player.room)
    room.recievePlay(card, socket.id).then(() => {
      room.announceWinner().then((winner) => {
        io.to(player.room).emit('announceWinner', {winner})
        io.to(player.room).emit('changeTurn', {currentPlayer : room.currentTurn(), players: room.getPlayers()})
      }).catch(() => {
        io.to(player.room).emit('changeTurn', {currentPlayer : room.currentTurn(), players: room.getPlayers()})
      })
    })
  })

  // socket.on('cardsLoaded', () => {
  //   var player = users.findUser(socket.id)
  //   var room = rooms.findRoom(player.room)
  //   room.cardsLoadedToPlayer(socket.id).then(() => {
  //     io.to(room.name).emit('startMatchWithCards', room.currentTurn())
  //   }).catch((error) => {
  //     console.log("Erro no cardsloaded ", error)
  //   })
  // })

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
          io.to(user.room).emit('updatePlayerList', room.getPlayers())
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

function joinRoom(name, userId, playerName){
  var room = rooms.findRoom(name)
  var player = users.findUser(userId)
  player.name = playerName
  if (player && room){
    room.addPlayer(player)
    player.enterRoom(name)
  }
  return room

}