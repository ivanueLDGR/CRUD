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

function validatePost(newCharacter){
    let statusArray = []
    const newCharacterDesconstructed = {...newCharacter}
    statusArray.push(validateName(newCharacterDesconstructed.name))
    statusArray.push(validateClasse(newCharacterDesconstructed.classe))
    statusArray.push(validateHabilidades(newCharacterDesconstructed.habilidades))
    statusArray.push(validateAge(newCharacterDesconstructed.age))
    statusArray.push(validateItens(newCharacterDesconstructed.itens))
    return statusArray
}

function validateName(name){
    if (!name){
        return {status: "missing", field: "name"};
    }else if (typeof name != "string"){
        return {status: "incorrect", field: "name"}
    }
    return {status: "ok", field: "name"}
}

function validateClasse(classe){
    if (!classe){
        return {status: "missing", field: "classe"};
    }else if (typeof classe != "string"){
        return {status: "incorrect", field: "classe"}
    }
    return {status: "ok", field: "classe"}
}

function validateHabilidades(habilidades){
    if (!classe){
        return {status: "missing", field: "habilidades"};
    }else if (typeof habilidades != "array"){
        return {status: "incorrect", field: "habilidades"}
    }
    return {status: "ok", field: "habilidades"}
}

function validateAge(age){
    if (!age){
        return {status: "missing", field: "age"};
    }else if (typeof age != "number" || age < 1){
        return {status: "incorrect", field: "age"}
    }
    return {status: "ok", field: "age"}
}

function validateItens(itens){
    if (!itens){
        return {status: "missing", field: "itens"};
    }else if (typeof itens != "array"){
        return {status: "incorrect", field: "itens"}
    }
    return {status: "ok", field: "itens"}
}

function checkStatusArray(statusArray){
    let statusMessage = ""
    for (var i in statusArray){
        if(statusArray[i].status != "ok"){
            statusMessage = statusMessage + `your ${Object.values(statusArray[i])[1]} is ${Object.keys(statusArray[i])[0]}, `
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
        const newCharacter = req.body
        const statusArray = validatePost(newCharacter)
        const statusMessage = checkStatusArray(statusArray)
        if (statusMessage != "ok"){
            return res.send(statusMessage)
        }
        data.push(newCharacter)
        await writeCharactersList(data)
        return res.send("Character was successfully created")
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
            res.send(data[targetIdIndex]);
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
            console.log(targetId, updatesRequested)
            for(const key in updatesRequested){
                data[targetIdIndex][key] = updatesRequested[key]
            }
            console.log(data[targetIdIndex])
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