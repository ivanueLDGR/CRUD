class validCharacterRequestFormat{
    constructor({...character}){
        this.name = character.name
        this.classe = character.classe
        this.habilidades = character.habilidades
        this.age = character.age
        this.itens = character.itens
    }
}

module.exports = validCharacterRequestFormat