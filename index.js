const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/admin", adminRouter);
app.use("/users", userRouter);

// Connect Mongoose
mongoose.connect(
  "mongodb+srv://suraj122:suraj122@cluster0.ykjpt3l.mongodb.net/courses",
  { useNewUrlParser: true, useUnifiedTopology: true, dbName: "courses" }
);

app.get("/", (req, res) => {
  res.send("Course App which let's you create course and publish it");
});

// Invalid Routes
app.all("*", (req, res) => {
  res.status(404).send("Route not found");
});

app.listen(3000, () => console.log("App is listening at port at 3000"));
