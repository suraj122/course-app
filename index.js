const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const PORT = 3000;
const SECRETKEY = "your_secret_key";

const app = express();
app.use(express.json());
app.use(bodyParser.json());

// Mongoose Schema
const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  tag: String,
  price: Number,
  imageLink: String,
  published: Boolean,
});

// Mongoose Models
const User = mongoose.model("User", userSchema);
const Admin = mongoose.model("Admin", adminSchema);
const Course = mongoose.model("Course", courseSchema);

// Middlewares

// Authenticate JWT
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    jwt.verify(token, SECRETKEY, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// Connect Mongoose
mongoose.connect(
  "mongodb+srv://suraj122:suraj122@cluster0.ykjpt3l.mongodb.net/courses",
  { useNewUrlParser: true, useUnifiedTopology: true, dbName: "courses" }
);

app.get("/", (req, res) => {
  res.send("Course App which let's you create course and publish it");
});

// Admin routes

// Signup
app.post("/admin/signup", async (req, res) => {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });
  if (!admin) {
    const newAdmin = new Admin({ username, password });
    await newAdmin.save();
    const token = jwt.sign({ username, role: "admin" }, SECRETKEY, {
      expiresIn: "1h",
    });
    res.json({ message: "Admin created successfully", token });
  } else {
    res.status(403).send({ meassge: "Admin already exists" });
  }
});

// Login
app.post("/admin/login", async (req, res) => {
  const { username, password } = req.headers;
  // const admin = admins.find(
  //   (admin) => admin.username === username && admin.password === password
  // );
  const admin = await Admin.findOne({ username, password });
  if (admin) {
    const token = jwt.sign({ username, role: "admin" }, SECRETKEY, {
      expiresIn: "1h",
    });
    res.json({ message: "Loggedin successfully", token });
  } else {
    res.status(403).json({ message: "Admin authentication failed" });
  }
});

// Create Course
app.post("/admin/courses", authenticateJWT, async (req, res) => {
  const course = new Course(req.body);
  await course.save();
  res.json({ message: "Course created successfully", courseId: course.id });
});

// Update specific course
app.put("/admin/courses/:id", authenticateJWT, async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (course) {
    res.json({ message: "Course updated successfully" });
  } else {
    res.status(400).send({ message: "course not found" });
  }
});

// Get courses
app.get("/admin/courses", authenticateJWT, async (req, res) => {
  const courses = await Course.find({});
  res.json({ courses });
});

// Users Routes

// Signup
app.post("/users/signup", async (req, res) => {
  const { username, password } = req.body;
  // const user = { ...req.body, purchasedCourses: [] };
  // const existingUser = users.find(
  //   (user) => user.username === username || user.email === email
  // );
  const user = await User.findOne({ username });
  if (!user) {
    const newUser = new User({ username, password });
    await newUser.save();
    const token = jwt.sign({ username, role: "user" }, SECRETKEY, {
      expiresIn: "1h",
    });
    res.json({ message: "User created successfully", token });
  } else {
    res.status(403).send({ message: "User already exists" });
  }
});

// Login
app.post("/users/login", async (req, res) => {
  const { username, password } = req.headers;
  const user = await User.findOne({ username, password });
  if (user) {
    const token = jwt.sign({ username, role: "user" }, SECRETKEY, {
      expiresIn: "1h",
    });
    res.send({ message: "Logged in successfully", token });
  } else {
    res.status(403).send({ message: "User not found" });
  }
});

// Get courses Available
app.get("/users/courses", authenticateJWT, async (req, res) => {
  const courses = await Course.find({ published: true });
  res.json({ courses });
});

// Buy Course
app.post("/users/courses/:id", authenticateJWT, async (req, res) => {
  const course = await Course.findById(req.params.id);
  // const id = Number(req.params.id);
  // const courseAvailable = req.user.purchasedCourses.find(
  //   (course) => course.id === id
  // );
  // const user = users.find((user) => user.username === req.user.username);
  // if (!courseAvailable) {
  //   user.purchasedCourses.push(courses.find((course) => course.id === id));
  //   res.send({ message: `Course purchased successfully id ${id}` });
  // } else {
  //   res.status(400).send({ message: "course already purchased" });
  // }

  if (course) {
    const user = await User.findOne({ username: req.user.username });
    if (user) {
      user.purchasedCourses.push(course);
      await user.save();
      res.json({ message: "Course purchased successfully" });
    } else {
      res.status(403).json({ message: "User not found" });
    }
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

// Show Purchased courses
app.get("/users/purchasedCourses", authenticateJWT, async (req, res) => {
  const user = await User.findOne({ username: req.user.username }).populate(
    "purchasedCourses"
  );
  if (user) {
    res.json({ purchasedCourses: user.purchasedCourses || [] });
  } else {
    res.status(403).json({ message: "User not found" });
  }
});

// Invalid Routes
app.all("*", (req, res) => {
  res.status(404).send("Route not found");
});

app.listen(PORT, () => {
  console.log(`App is listening at the port ${PORT}`);
});
