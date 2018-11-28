class Rooms{
  constructor(){
    this.rooms = []
  }

  addRoom(room, error){
    if (this.findRoom(room.name)){
      error()
      return
    }
    this.rooms.push(room)
  }

  findRoom(name){
    return this.rooms.filter((room) => room.name === name)[0]
  }

  removeRoom(name){
    var room = this.findRoom(name)

    if (room){
      this.rooms = this.rooms.filter((room) => room.name !== name)
    }
  }

}

module.exports = {Rooms}