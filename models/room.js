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
}

module.exports = {Room}