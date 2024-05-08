const { randomInt } = require("crypto");
const express = require("express")
const router = express.Router()
const validations = require('../models/validations.js');
const fs = require('fs')

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

function handlePOSTRequest(request){
    const statusArray = validations.validateFields(request)
    const statusMessage = validations.statusMessageGenerator(statusArray, "POST")
    const returnMessage = statusMessageHandler(statusMessage, statusArray, "POST", request)
    return returnMessage
}

function handlePUTRequest(request){
    const statusArray = validations.validateFields(request)
    const statusMessage = validations.statusMessageGenerator(statusArray, "PUT")
    const returnMessage = statusMessageHandler(statusMessage, statusArray, "PUT", request)
    return returnMessage
}

function statusMessageHandler(statusMessage, statusArray, requestType, request){
    if(statusMessage != "ok"){
        return statusMessage
    }
    if(requestType == "POST"){
        returnMessage = successHandlerPOST(statusArray, request)
        return returnMessage
    }else if(requestType == "PUT"){
        returnMessage = successHandlerPUT(statusArray, request)
        return returnMessage
    } else statusMessage = "error"
    return statusMessage
}

async function successHandlerPOST(statusArray, newCharacterRequest){
    let newCharacter = {}
    for(let i in statusArray){
        var propertyName = Object.values(statusArray[i])[1]
        newCharacter[propertyName] = newCharacterRequest[propertyName]
    }
    newCharacter.id = String(randomInt(100000))
    newCharacter.updated = getTime()
    charactersList.push(newCharacter)
    await updateDatabase(charactersList)
    return (`Character was successfully created with ID: ${newCharacter.id}`)
}

async function successHandlerPUT(statusArray, updateRequest){
    const updatesRequested = {...updateRequest}
    for(let i in statusArray){
        var propertyName = Object.values(statusArray[i])[1]
        if(Object.values(statusArray[i])[0] == "ok"){
            charactersList[targetIdIndex][propertyName] = updatesRequested[propertyName]
        }
    }
    charactersList[targetIdIndex].updated = getTime()
    await updateDatabase(charactersList)
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
        const returnMessage = handlePOSTRequest(req.body)
        return res.send(returnMessage)
    } catch (error) {
        console.log(error);
    }
})

router
    .route("/:id")
    .get(async (req, res) => {
        try {
            const data = await readCharactersList();
            const targetId = req.params.id
            const targetIdIndex = data.findIndex((character) => targetId == character.id)
            if(targetIdIndex == -1){
                return res.send("No character matches this ID")
            }
            return res.send(data[targetIdIndex]);
        } catch (error) {
            console.log(error);
        }
    })
    .put(async (req, res) => {
        try {
            const targetId = req.params.id
            const targetIdIndex = charactersList.findIndex((character) => targetId == character.id)

            const returnMessage = handlePUTRequest({...req.body})


            res.send(data[targetIdIndex]);
        } catch (error) {
            console.log(error);
        }
    })
    .delete(async (req, res) => {
        try {
            const data = await readCharactersList();
            const targetId = req.params.id
            const targetIdIndex = data.findIndex((character) => targetId == character.id)
            if(targetIdIndex == -1){
                return res.send("invalid ID")
            }
            data.splice(targetIdIndex, 1)
            await updateDatabase(data)
            res.send(data);
        } catch (error) {
            console.log(error);
        }
    });


router.param("id", async (req, res, next, id) => {
    next()
});

module.exports = router