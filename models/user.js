class User{
  constructor(id, name) {
    this.id = id
    this.name = name
    this.room = ''
    this.ready = false
    this.cards = []
    this.cardsLoaded = false
    this.points = 4
    this.roundsToWin = -1
    this.roundsWinning = 0
  }

  setRoundsToWin(num) {
    this.roundsToWin = num
  }

  enterRoom(room){
    this.room = room
  }

  isInARoom(){
    return this.room !== ''
  }
}

module.exports = {User}