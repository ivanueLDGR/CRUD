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
        const newCharacter = {
                "id": String(data.length + 1),
                "nome": "nayara",
                "classe": "paladino",
                "habilidades": [
                  "correr",
                  "curar",
                  "abjurar"
                ],
                "atualizado": "25/10/2023-18:45",
                "idade": 23,
                "itens": [
                  {
                    "nome": "espada",
                    "pode": "cortar"
                  },
                  {
                    "nome": "escudo",
                    "pode": "defender"
                  }
                ]
            };
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
            res.send(data[req.params.id - 1]);
        } catch (error) {
            console.log(error);
        }
    })
    .put(async (req, res) => {
        try {
            const data = await readCharactersList();
            data[req.params.id - 1].classe = "robervaldo";
            await writeCharactersList(data)
            res.send(data[req.params.id - 1]);
        } catch (error) {
            console.log(error);
        }
    })
    .delete(async (req, res) => {
        try {
            const data = await readCharactersList();
            data.splice(req.params.id - 1, 1)
            res.send(data);
        } catch (error) {
            console.log(error);
        }
    });


router.param("id", async (req, res, next, id) => {
    next()
});



module.exports = router