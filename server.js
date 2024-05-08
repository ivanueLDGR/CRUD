const express = require("express");
const app = express();
const port = 3001

const characterRouter = require('./routes/characters');


app.use(express.json());
app.use("/characters", characterRouter)

app.listen(port, () =>{
    console.log(`Server listening at ${port}`)
})