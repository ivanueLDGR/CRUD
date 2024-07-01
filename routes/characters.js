const { randomInt } = require("crypto");
const express = require("express")
const router = express.Router()
const validations = require('../models/validations.js');
const fs = require('fs')
const ValidCharacterRequestFormat = require('../views/characters.js');
const validCharacterRequestFormat = require("../views/characters.js");


let charactersList = []

fs.readFile('./routes/characters.json', 'utf8', function (err, data) {
    if (err) {
      console.log(err);
    }
    charactersList = JSON.parse(data)
});

function updateDatabase(charactersList){
    fs.writeFile('./routes/characters.json', JSON.stringify(charactersList), err=> {
        if (err) {
          console.error(err);
        } else {
          console.log("database updated")
        }
    })
}

function getTime(){
    var currentdate = new Date(); 
    var datetime = String(currentdate.getDate()).padStart(2, '0') + "/"
        + String(currentdate.getMonth()+1).padStart(2, '0')  + "/" 
        + String(currentdate.getFullYear()) + "-"  
        + String(currentdate.getHours()).padStart(2, '0') + ":"  
        + String(currentdate.getMinutes()).padStart(2, '0')
    return datetime
}

function getTarget(charactersList, targetId){    
    try{
    const targetIdIndex = getTargetIdIndex(charactersList, targetId)
    const character = charactersList[targetIdIndex]
    return character
    }
    catch(error){
        console.log(error)
    }
} 

function getTargetIdIndex(charactersList, targetId){
    const targetIdIndex = charactersList.findIndex((character) => targetId == character.id)
    if(targetIdIndex == -1){
        throw {status: "error", message: "No character matches this ID"}
    }
    return targetIdIndex
}

function  handlePOSTRequest(request){
    const validCharacterRequest = new ValidCharacterRequestFormat(request)
    let status = validations.validateFields(validCharacterRequest)
    if (status.status == "ok"){
        status = successHandlerPOST(validCharacterRequest)
        return status
    }
    return status
}

function successHandlerPOST(validCharacterRequest){
    validCharacterRequest.id = String(randomInt(100000))
    validCharacterRequest.updated = getTime()
    charactersList.push(validCharacterRequest)
    updateDatabase(charactersList)
    let status = {status: "ok", message: validCharacterRequest}
    return status
}

function handlePUTRequest(request){ 
    let character = getTarget(request.charactersList, request.params.id)
    character = {...character, ...request.body}
    const validCharacterRequest = new validCharacterRequestFormat(character)
    let status = validations.validateFields(validCharacterRequest)
    if (status.status == "ok"){
        status = successHandlerPUT(validCharacterRequest, request.charactersList, request.params.id)
        return status
    }
    return status
}

function successHandlerPUT(validCharacterRequest, charactersList, id){
    const targetIdIndex = getTargetIdIndex(charactersList, id)
    charactersList[targetIdIndex] = {...charactersList[targetIdIndex], ...validCharacterRequest}
    charactersList[targetIdIndex].updated = getTime()
    updateDatabase(charactersList)
    let status = {status: "ok", message: charactersList[targetIdIndex]}
    return status
}

function handleDELRequest(charactersList, id){
    let targetIndex = getTargetIdIndex(charactersList, id)
    let character = getTarget(charactersList, id)
    charactersList.splice(targetIndex, 1)
    updateDatabase(charactersList)
    return {status: "ok", message: character}
}

router.get("/", async (req, res) => {
    try {
        res.send(charactersList);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error fetching characters list");
    }
})

router.post("/", async (req, res) => {
    try {
        const status = handlePOSTRequest(req.body)
        return res.json(status.message)
    } catch (error) {
        console.log(error);
    }
})

router
    .route("/:id")
    .get((req, res) => {
        let character = getTarget(charactersList, req.params.id)
        return res.send(character);
    })
    .put(async (req, res) => {
        try {
            req.charactersList = charactersList
            const status = handlePUTRequest(req)
            res.send(status);
        } catch (error) {
            res.json({message: 'errorMessage'})
            console.log(error);
        }
    })
    .delete(async (req, res) => {
        try {
            const status = handleDELRequest(charactersList, req.params.id)
            res.send(status);
        } catch (error) {
            console.log(error);
        }
    });


router.param("id", async (req, res, next, id) => {
    next()
});

module.exports = router