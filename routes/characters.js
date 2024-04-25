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
        data.push(newCharacter)
        await writeCharactersList(data)
        res.send(data)
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