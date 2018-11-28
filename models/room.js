const fs = require('fs')

class Room {
  constructor(name, admin){
    this.name = name
    this.admin = admin
    this.inGame = false
    this.players = []
    this.deck = [{"pack":"copas","value":"4","weight":0},{"pack":"espadas","value":"4","weight":0},{"pack":"ouros","value":"4","weight":0},{"pack":"paus","value":"5","weight":1},{"pack":"copas","value":"5","weight":1},{"pack":"espadas","value":"5","weight":1},{"pack":"ouros","value":"5","weight":1},{"pack":"paus","value":"6","weight":2},{"pack":"copas","value":"6","weight":2},{"pack":"espadas","value":"6","weight":2},{"pack":"ouros","value":"6","weight":2},{"pack":"paus","value":"7","weight":3},{"pack":"espadas","value":"7","weight":3},{"pack":"paus","value":"Q","weight":4},{"pack":"copas","value":"Q","weight":4},{"pack":"espadas","value":"Q","weight":4},{"pack":"ouros","value":"Q","weight":4},{"pack":"paus","value":"J","weight":5},{"pack":"copas","value":"J","weight":5},{"pack":"espadas","value":"J","weight":5},{"pack":"ouros","value":"J","weight":5},{"pack":"paus","value":"K","weight":6},{"pack":"copas","value":"K","weight":6},{"pack":"espadas","value":"K","weight":6},{"pack":"ouros","value":"K","weight":6},{"pack":"paus","value":"A","weight":7},{"pack":"copas","value":"A","weight":7},{"pack":"ouros","value":"A","weight":7},{"pack":"paus","value":"2","weight":8},{"pack":"copas","value":"2","weight":8},{"pack":"espadas","value":"2","weight":8},{"pack":"ouros","value":"2","weight":8},{"pack":"paus","value":"3","weight":9},{"pack":"copas","value":"3","weight":9},{"pack":"espadas","value":"3","weight":9},{"pack":"ouros","value":"3","weight":9},{"pack":"ouros","value":"7","weight":10},{"pack":"espadas","value":"A","weight":11},{"pack":"copas","value":"7","weight":12},{"pack":"paus","value":"4","weight":13}]
    this.turn = 0 //index
  }

  addPlayer(id){
    this.players.push(id)
  }

  getPlayer(id){
    return new Promise((resolve, reject) => {
      this.players.forEach((player, index) => {
        if (player.id === id){
          resolve(index)
        }
      })
    })
  }

  removePlayer(id, callback){
    this.players = this.players.filter((player) => player.id !== id)
    if (this.players.length <= 0){
      callback()
    }
  }

  playersReadyToStart(){
    var playersReady = this.players.filter((player) => player.ready !== true)
    if (this.players.length > 1 && playersReady.length === 0){
      return true
    }
    return false
  }

  distributeCards(){
    return new Promise((resolve, reject) => {
      this.players.forEach((player, index) => {
        var cards = []
        for (var i = 0; i < 4; i++){
          var randomIndex = (Math.floor(Math.random() * this.deck.length))
          cards.push(this.deck[randomIndex])
          this.deck.splice(randomIndex, 1)
        }
        this.players[index].cards = cards
      })
      resolve()
    })
  }

  beginMatch(){
    return new Promise((resolve, reject) => {
      if (this.playersReadyToStart()){
        this.inGame = true
        this.distributeCards().then(() => {
          resolve()
        })
      } else {
        reject()
      }
    })
  }

  playerIsReady(id, ready){
    this.players.forEach((player, index)=> {
      if (player.id === id){
        this.players[index].ready = ready
        return
      }
    });
  }

  changeTurn(){
    if (this.turn === this.players.length){
      this.turn = 0
    } else {
      this.turn += 1
    }
  }
  
  currentTurn(){
    return this.players[this.turn]
  }

  getPlayers(){
    return this.players
  }

  cardsLoadedToPlayer(id) {
    var canStart = false
    return new Promise((resolve, reject) => {
      this.getPlayer(id).then((index) => {
        this.players[index].cardsLoaded = true
      })
      this.players.forEach((player) => {
        console.log(this.players)
        if (player.cardsLoaded === false){
          reject("Erro")
        }
      })
      console.log("foi")
      resolve()
    })

  }
}

module.exports = {Room}