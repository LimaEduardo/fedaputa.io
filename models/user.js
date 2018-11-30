class User{
  constructor(id, name) {
    this.id = id
    this.name = name
    this.room = ''
    this.ready = false
    this.cards = []
    this.cardsLoaded = false
    this.points = 4
  }

  enterRoom(room){
    this.room = room
  }

  isInARoom(){
    return this.room !== ''
  }
}

module.exports = {User}