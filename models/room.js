const fs = require('fs')
const _ = require('lodash')

class Room {
  constructor(name, admin){
    this.name = name
    this.admin = admin
    this.inGame = false
    this.players = []
    this.deck = [{"pack":"copas","value":"4","weight":0},{"pack":"espadas","value":"4","weight":0},{"pack":"ouros","value":"4","weight":0},{"pack":"paus","value":"5","weight":1},{"pack":"copas","value":"5","weight":1},{"pack":"espadas","value":"5","weight":1},{"pack":"ouros","value":"5","weight":1},{"pack":"paus","value":"6","weight":2},{"pack":"copas","value":"6","weight":2},{"pack":"espadas","value":"6","weight":2},{"pack":"ouros","value":"6","weight":2},{"pack":"paus","value":"7","weight":3},{"pack":"espadas","value":"7","weight":3},{"pack":"paus","value":"Q","weight":4},{"pack":"copas","value":"Q","weight":4},{"pack":"espadas","value":"Q","weight":4},{"pack":"ouros","value":"Q","weight":4},{"pack":"paus","value":"J","weight":5},{"pack":"copas","value":"J","weight":5},{"pack":"espadas","value":"J","weight":5},{"pack":"ouros","value":"J","weight":5},{"pack":"paus","value":"K","weight":6},{"pack":"copas","value":"K","weight":6},{"pack":"espadas","value":"K","weight":6},{"pack":"ouros","value":"K","weight":6},{"pack":"paus","value":"A","weight":7},{"pack":"copas","value":"A","weight":7},{"pack":"ouros","value":"A","weight":7},{"pack":"paus","value":"2","weight":8},{"pack":"copas","value":"2","weight":8},{"pack":"espadas","value":"2","weight":8},{"pack":"ouros","value":"2","weight":8},{"pack":"paus","value":"3","weight":9},{"pack":"copas","value":"3","weight":9},{"pack":"espadas","value":"3","weight":9},{"pack":"ouros","value":"3","weight":9},{"pack":"ouros","value":"7","weight":10},{"pack":"espadas","value":"A","weight":11},{"pack":"copas","value":"7","weight":12},{"pack":"paus","value":"4","weight":13}]
    this.turn = 0 //index
    this.currentRound = 0
    this.rounds = [[]]
    this.winner = null // index
    this.numCards = 1
    this.hand = 1
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
        if(!player.lost) {
          var cards = []
          for (var i = 0; i < this.numCards; i++){
            var randomIndex = (Math.floor(Math.random() * this.deck.length))
            cards.push(this.deck[randomIndex])
            this.deck.splice(randomIndex, 1)
          }
          this.players[index].cards = cards
        }
      })
      resolve()
    })
  }

  beginMatch(){
    return new Promise((resolve, reject) => {
      if (this.playersReadyToStart()){
        this.hand = 1
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

  getWinner(){
    return new Promise((resolve, reject) => {
      this.players.forEach((player) => {
        if(player.lost === false) {
          resolve(player)
        }
      })
      reject(null)
    })
  }

  endMatch(){
    var count = 0
    this.players.forEach((player, id) => {
      if(!player.lost) {
        count += 1
      }
    })
    if (count <= 1) {
      return true
    }
    return false
  }


  updateTotalPoints(){
    this.players.forEach((player, id) => {
      player.checkPoints()
    })
  }

  removeCard(card, id){
    var objNormalized = {pack: card.pack, value: card.value, weight: parseInt(card.weight)}
    return new Promise ((resolve, reject) => {
      this.getPlayer(id).then((index) => {
        this.players[index].cards.forEach((playerCard, indexCard) => {
          if (_.isEqual(objNormalized, playerCard)){
            this.players[index].cards.splice(indexCard, 1)
            resolve()
          }
        })
      })
    })
  }

  recievePlay(card, playerId){
    return new Promise ((resolve, reject) => {
      var obj = {"pack" : card.pack, "value" : card.value, "weight" : card.weight, player: playerId}
      this.rounds[this.currentRound].push(obj)
      this.changeTurn().then((turn) => {
        this.removeCard(card, playerId).then(() => {
          resolve()
        })
      })
    })
  }

  changeNumCards() {
    this.numCards += 1
    if((this.numCards*this.players.length) > this.deck.length) {
      this.numCards = 1
    }
  }

  changeRound(){
    this.rounds.push([])
    this.currentRound += 1
  }

  changeTurn(){
    return new Promise((resolve, reject) => {
      if (this.turn === this.players.length - 1){  
        this.verifyWinnerOfRound().then(() => {
          this.changeRound()
          this.turn = 0
        })
      } else {
        this.turn += 1
        while (this.players[this.turn].cards.length === 0){
          this.turn += 1
        }
      }
      resolve(this.turn)
    })
  }

  giveAPointTo(id){
    return new Promise((resolve,reject) => {
      this.getPlayer(id).then((index) => {
        this.players[index].points += 1
        this.players[index].winHand()
        resolve()
      })
    })
  }

  verifyWinnerOfRound(){
    return new Promise((resolve, reject) => {
      var round = this.rounds[this.currentRound]
      round.sort((a, b) => {
        return a.weight - b.weight
      })
      //Draw case
      if (round[round.length - 1].weight === round[round.length - 2].weight){
        this.winner = "draw"
      } else {
        this.giveAPointTo(round[round.length - 1].player).then(() => {
          this.winner = round[round.length - 1].player
        })
      }
      resolve()
    })
  }

  announceWinner(){
    return new Promise((resolve, reject) => {
      if (this.winner !== null){
        if (this.winner === "draw") {
          resolve("draw")
        } else {
          this.getPlayer(this.winner).then((playerIndex) => {
            this.winner = null
            resolve(this.players[playerIndex])
          })
        }
      } else {
        reject()
      }
    })
  }
  
  currentTurn(){
    return this.players[this.turn]
  }

  getPlayers(){
    return this.players
  }

  currentPlayerHasCards(){
    return this.players[this.turn].cards.length !== 0
  }

  cardsLoadedToPlayer(id) {
    var canStart = false
    return new Promise((resolve, reject) => {
      this.getPlayer(id).then((index) => {
        this.players[index].cardsLoaded = true
      })
      this.players.forEach((player) => {
        if (player.cardsLoaded === false){
          reject("Erro")
        }
      })
      resolve()
    })

  }
}

module.exports = {Room}