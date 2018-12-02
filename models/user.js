class User{
  constructor(id, name) {
    this.id = id
    this.name = name
    this.room = ''
    this.ready = false
    this.cards = []
    this.cardsLoaded = false
    this.totalPoints = 4
    this.pointsToDo = -1
  }

  winHand(){
    this.pointsToDo -= 1
  }

  checkPoints() {
    if (this.pointsToDo < 0) {
      this.totalPoints += this.pointsToDo
    } else {
      this.totalPoints -= this.pointsToDo
    }
  }

  enterRoom(room){
    this.room = room
  }

  isInARoom(){
    return this.room !== ''
  }
}

module.exports = {User}
