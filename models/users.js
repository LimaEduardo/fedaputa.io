class Users {
  constructor(){
    this.users = []
  }

  addUser(user){
    this.users.push(user)
  }

  findUser(id){
    return this.users.filter((user) => user.id === id)[0]
  }

  removeUser(id){
    var user = this.findUser(id)
    if (user) {
      this.users = this.users.filter((user) => user.id !== id)
    }
    return user
  }
}

module.exports = {Users}