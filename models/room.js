class Room {
  constructor(name, admin){
    this.name = name
    this.admin = admin
    this.inGame = false
    this.players = []
  }

  addPlayer(id){
    this.players.push(id)
  }

  removePlayer(id, callback){
    this.players = this.players.filter((player) => player.id !== id)
    console.log("hdusahd", id)
    console.log(this.players.filter((player) => player.id !== id))
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

  beginMatch(){
    if (this.playersReadyToStart()){
      console.log("Game begin!!!")
    } else {
      console.log("Not enough players ready")
    }
  }

  playerIsReady(id, ready){
    this.players.forEach((player, index)=> {
      if (player.id === id){
        this.players[index].ready = ready
        return
      }
    });
  }

  getPlayers(){
    return this.players
  }
}

module.exports = {Room}