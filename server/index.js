const express = require("express");
const bodyParser = require("body-parser");
const PORT = 3000;

const app = express();
app.use(express.json());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`App is listening at the port ${PORT}`);
});
