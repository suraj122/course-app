const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const PORT = 3000;
const SECRETKEY = "your_secret_key";

const app = express();
app.use(express.json());
app.use(bodyParser.json());

let admins = [];
let courses = [];
let users = [];

// Middlewares

// Generate Tokens
const generateToken = (user) => {
  const payload = { username: user.username };
  return jwt.sign(payload, SECRETKEY, { expiresIn: "1h" });
};

app.get("/", (req, res) => {
  res.send("Course App which let's you create course and publish it");
});

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

// Admin routes

// Signup
app.post("/admin/signup", (req, res) => {
  const { name, username, password } = req.body;
  const admin = {
    name: name,
    username: username,
    password: password,
  };
  const existingAdmin = admins.find((admin) => username === admin.username);
  if (!existingAdmin) {
    admins.push(admin);
    const token = jwt.sign(admin, SECRETKEY, { expiresIn: "1h" });
    res.json({ message: "Admin created successfully", token });
  } else {
    res.status(400).send({ meassge: "Admin already exists" });
  }
});

// Login
app.post("/admin/login", (req, res) => {
  const { username, password } = req.headers;
  const admin = admins.find(
    (admin) => admin.username === username && admin.password === password
  );
  if (admin) {
    const token = jwt.sign(admin, SECRETKEY, { expiresIn: "1h" });
    res.json({ message: "Loggedin successfully", token });
  } else {
    res.status(403).json({ message: "Admin authentication failed" });
  }
});

// Create Course
app.post("/admin/courses", authenticateJWT, (req, res) => {
  const course = {
    id: Math.floor(Math.random() * 10000),
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    image: "https://source.unsplash.com/random",
    published: req.body.published,
  };
  courses.push(course);
  res.json({ message: "Course created successfully", courseId: course.id });
});

// Update specific course
app.put("/admin/courses/:id", authenticateJWT, (req, res) => {
  const id = Number(req.params.id);
  const existingCourse = courses.find((course) => id === course.id);
  if (existingCourse) {
    Object.assign(existingCourse, req.body);
    res.json({ message: "Course updated successfully" });
  } else {
    res.status(400).send({ message: "course not found" });
  }
});

// Get courses
app.get("/admin/courses", authenticateJWT, (req, res) => {
  res.json(courses);
});

// Users Routes

// Signup
app.post("/users/signup", (req, res) => {
  const { email, username } = req.body;
  const user = { ...req.body, purchasedCourses: [] };
  const existingUser = users.find(
    (user) => user.username === username || user.email === email
  );
  if (!existingUser) {
    users.push(user);
    const token = jwt.sign(user, SECRETKEY, { expiresIn: "1h" });
    res.json({ message: "User created successfully", token });
  } else {
    res.status(400).send({ message: "User already exists" });
  }
});

// Login
app.post("/users/login", (req, res) => {
  const { username, password } = req.headers;
  const user = users.find(
    (user) => user.username === username && user.password === password
  );
  if (user) {
    const token = jwt.sign(user, SECRETKEY, { expiresIn: "1h" });
    res.send({ message: "Logged in successfully", token });
  } else {
    res.status(403).send({ message: "User not found" });
  }
});

// Get courses Available
app.get("/users/courses", authenticateJWT, (req, res) => {
  res.json(courses);
});

// Buy Course
app.post("/users/courses/:id", authenticateJWT, (req, res) => {
  const id = Number(req.params.id);
  const courseAvailable = req.user.purchasedCourses.find(
    (course) => course.id === id
  );
  const user = users.find((user) => user.username === req.user.username);
  if (!courseAvailable) {
    user.purchasedCourses.push(courses.find((course) => course.id === id));
    res.send({ message: `Course purchased successfully id ${id}` });
  } else {
    res.status(400).send({ message: "course already purchased" });
  }
});

// Show Purchased courses
app.get("/users/purchasedCourses", authenticateJWT, (req, res) => {
  const user = users.find((user) => user.username === req.user.username);
  res.json(user.purchasedCourses);
});

// Invalid Routes
app.all("*", (req, res) => {
  res.status(404).send("Route not found");
});

app.listen(PORT, () => {
  console.log(`App is listening at the port ${PORT}`);
});
