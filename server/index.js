const express = require("express");
const bodyParser = require("body-parser");
const PORT = 3000;

const app = express();
app.use(express.json());
app.use(bodyParser.json());

let admins = [];
let courses = [];
let users = [];

// Middlewares
// Admin Authentication
const adminAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  const admin = admins.find(
    (admin) => admin.username === username && admin.password === password
  );
  if (admin) {
    next();
  } else {
    res.status(403).send({ message: "Admin authentication failed" });
  }
};

// User Authentication

const userAuthentication = (req, res, next) => {
  const { username, password } = req.headers;
  const user = users.find(
    (user) => user.username === username && user.password === password
  );

  if (user) {
    req.user = user;
    next();
  } else {
    res.status(403).send({ message: "User authentication failed" });
  }
};

app.get("/", (req, res) => {
  res.send("Course App which let's you create course and publish it");
});

// Admin routes

// Signup
app.post("/admin/signup", (req, res) => {
  const { name, username, password } = req.body;
  const user = {
    name: name,
    username: username,
    password: password,
  };
  const existingAdmin = admins.find((user) => username === user.username);
  if (!existingAdmin) {
    admins.push(user);
    res.json({ message: "Admin created successfully" });
  } else {
    res.status(400).send({ meassge: "Admin already exists" });
  }
});

// Login
app.post("/admin/login", adminAuthentication, (req, res) => {
  res.json({ message: "Loggedin successfully" });
});

// Create Course
app.post("/admin/courses", adminAuthentication, (req, res) => {
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
app.put("/admin/courses/:id", adminAuthentication, (req, res) => {
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
app.get("/admin/courses", adminAuthentication, (req, res) => {
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
    res.json({ message: "User created successfully" });
  } else {
    res.status(400).send({ message: "User already exists" });
  }
});

// Login
app.post("/users/login", userAuthentication, (req, res) => {
  res.send({ message: "Logged in successfully" });
});

// Get courses Available
app.get("/users/courses", userAuthentication, (req, res) => {
  res.json(courses);
});

// Buy Course
app.post("/users/courses/:id", userAuthentication, (req, res) => {
  const id = Number(req.params.id);
  const courseAvailable = req.user.purchasedCourses.find(
    (course) => course.id === id
  );
  if (!courseAvailable) {
    req.user.purchasedCourses.push(courses.find((course) => course.id === id));
    res.send({ message: `Course purchased successfully id ${id}` });
  } else {
    res.status(400).send({ message: "course already purchased" });
  }
});

// Show Purchased courses
app.get("/users/purchasedCourses", userAuthentication, (req, res) => {
  res.json(req.user.purchasedCourses);
});

// Invalid Routes
app.all("*", (req, res) => {
  res.status(404).send("Route not found");
});

app.listen(PORT, () => {
  console.log(`App is listening at the port ${PORT}`);
});
