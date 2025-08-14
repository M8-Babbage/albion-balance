const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Bot online 🚀"));

app.listen(PORT, () => console.log(`Servidor web en puerto ${PORT}`));

require("./bot.js");
