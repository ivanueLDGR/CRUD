const { randomInt } = require("crypto");
const express = require("express")
const router = express.Router()
const fs = require('fs/promises');

async function readCharactersList(){
    try {
        const rawData = await fs.readFile('./routes/characters.json', {encoding: 'utf8'});
        const data = JSON.parse(rawData)
        return data
    }
    catch(err) {
        console.log(err)
        throw error
    }
}

async function writeCharactersList(data){
    try {
        await fs.writeFile('./routes/characters.json', JSON.stringify(data, null, 2), {encoding: 'utf8'});
    } catch (error) {
        console.log(error);
        throw error;
    }
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

function validateFields(characterFields){
    let statusArray = []
    const newCharacterDesconstructed = {...characterFields}
    statusArray.push(validateName(newCharacterDesconstructed.name))
    statusArray.push(validateClasse(newCharacterDesconstructed.classe))
    statusArray.push(validateHabilidades(newCharacterDesconstructed.habilidades))
    statusArray.push(validateAge(newCharacterDesconstructed.age))
    statusArray.push(validateItens(newCharacterDesconstructed.itens))
    return statusArray
}

function validateName(name){
    const nameRegex = /^(?! )[A-Za-z]+(?: [A-Za-z]+)*$/
    if (!name){
        return {status: "missing", field: "name"};
    }else if (!verifyRegex(name, nameRegex)){
        return {status: "incorrect", field: "name"}
    }
    return {status: "ok", field: "name"}
}

function validateClasse(classe){
    const classeRegex = /^(?! )[A-Za-z]+$/
    if (!classe){
        return {status: "missing", field: "classe"};
    }else if (!verifyRegex(classe, classeRegex)){
        return {status: "incorrect", field: "classe"}
    }
    return {status: "ok", field: "classe"}
}

function validateHabilidades(habilidades){
    if (!habilidades){
        return {status: "missing", field: "habilidades"};
    }else if (!Array.isArray(habilidades)){
        return {status: "incorrect", field: "habilidades"}
    }
    return {status: "ok", field: "habilidades"}
}

function validateAge(age){
    const ageRegex = /^\d{1,100}$/
    if (!age){
        return {status: "missing", field: "age"};
    }else if (age < 1 || !verifyRegex(age.toString(), ageRegex)){   
        return {status: "incorrect", field: "age"}
    }
    return {status: "ok", field: "age"}
}

function validateItens(itens){
    if (!itens){
        return {status: "missing", field: "itens"};
    }else if (!Array.isArray(itens)){
        return {status: "incorrect", field: "itens"}
    }
    return {status: "ok", field: "itens"}
}

function verifyRegex(text, regex){
    return regex.test(text)
}

function checkPOSTStatusArray(statusArray){
    let statusMessage = ""
    for (var i in statusArray){
        if(statusArray[i].status != "ok"){
            statusMessage = statusMessage + `your ${Object.values(statusArray[i])[1]} is ${Object.values(statusArray[i])[0]}, `
        }
    }
    if (statusMessage == ""){
        statusMessage = "ok"
    }
    return statusMessage
}

function checkPUTStatusArray(statusArray){
    let statusMessage = ""
    for (var i in statusArray){
        if(statusArray[i].status == "incorrect"){
            statusMessage = statusMessage + `your ${Object.values(statusArray[i])[1]} is ${Object.values(statusArray[i])[0]}, `
        }
    }
    if (statusMessage == ""){
        statusMessage = "ok"
    }
    return statusMessage
}

router.get("/", async (req, res) => {
    try {
        const data = await readCharactersList();
        res.send(data);
    } catch (error) {
        console.log(error);
    }
});

router.post("/", async (req, res) => {
    try {
        const data = await readCharactersList();
        const newCharacterRequest = req.body
        const statusArray = validateFields(newCharacterRequest)
        const statusMessage = checkPOSTStatusArray(statusArray)
        if (statusMessage != "ok"){
            return res.send(statusMessage)
        }
        let newCharacter = {}
        for(let i in statusArray){
            var propertyName = Object.values(statusArray[i])[1]
            if(Object.values(statusArray[i])[0] == "ok"){
                newCharacter[propertyName] = newCharacterRequest[propertyName]
            }
        }
        newCharacter.id = randomInt(100000)
        newCharacter.updated = getTime()
        data.push(newCharacter)
        await writeCharactersList(data)
        return res.send(`Character was successfully created with ID: ${newCharacter.id}`)
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
            console.log(targetIdIndex, typeof(targetIdIndex))
            return res.send(data[targetIdIndex]);
        } catch (error) {
            console.log(error);
        }
    })
    .put(async (req, res) => {
        try {
            const data = await readCharactersList();
            const targetId = req.params.id
            const targetIdIndex = data.findIndex((character) => targetId == character.id)
            const updatesRequested = {...req.body}
            const statusArray = validateFields(updatesRequested)
            const statusMessage = checkPUTStatusArray(statusArray)
            if (statusMessage != "ok"){
                return res.send(statusMessage)
            }
            for(let i in statusArray){
                var propertyName = Object.values(statusArray[i])[1]
                if(Object.values(statusArray[i])[0] == "ok"){
                    data[targetIdIndex][propertyName] = updatesRequested[propertyName]
                }
            }
            data[targetIdIndex].updated = getTime()
            await writeCharactersList(data)
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
            data.splice(targetIdIndex, 1)
            await writeCharactersList(data)
            res.send(data);
        } catch (error) {
            console.log(error);
        }
    });


router.param("id", async (req, res, next, id) => {
    next()
});



module.exports = router