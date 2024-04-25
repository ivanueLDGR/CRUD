const express = require("express");
const app = express();

const characterRouter = require('./routes/characters');


app.use(express.json());
app.use("/characters", characterRouter)

app.listen(8081)