const express = require("express");
const bodyParser = require("body-parser");
const PORT = 3000;

const app = express();
app.use(express.json());
app.use(bodyParser.json());

let admins = [];
let courses = [];
let users = [];

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
app.post("/admin/login", (req, res) => {
  // const { username, password } = req.headers;
  const username = req.headers.username;
  const password = req.headers.password;
  const existingAdmin = admins.find(
    (admin) => username === admin.username && password === admin.password
  );
  if (existingAdmin) {
    res.json({ message: "Logged in successfully" });
  } else {
    res.status(400).send({ message: "Invalid Credentials" });
  }
});

// Create Course
app.post("/admin/courses", (req, res) => {
  const username = req.headers.username;
  const password = req.headers.password;
  const course = {
    id: Math.floor(Math.random() * 10000),
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    image: "https://source.unsplash.com/random",
    published: req.body.published,
  };
  const authenticatedAdmin = admins.find(
    (admin) => username === admin.username && password === admin.password
  );
  if (authenticatedAdmin) {
    courses.push(course);
    res.json({ message: "Course created successfully", courseId: course.id });
  } else {
    res.status(401).send({ meassge: "You are not authenicated" });
  }
});

// Update specific course
app.put("/admin/courses/:id", (req, res) => {
  const username = req.headers.username;
  const password = req.headers.password;
  const authenticatedAdmin = admins.find(
    (admin) => username === admin.username && password === admin.password
  );
  if (authenticatedAdmin) {
    const id = Number(req.params.id);
    const existingCourse = courses.find((course) => id === course.id);
    if (existingCourse) {
      existingCourse.title = req.body.title;
      existingCourse.description = req.body.description;
      existingCourse.price = req.body.price;
      existingCourse.image = "https://source.unsplash.com/random";
      existingCourse.published = req.body.published;
      res.json(existingCourse);
    } else {
      res.status(400).send({ message: "course not found" });
    }
  } else {
    res.status(401).send({ meassge: "You are not authenicated" });
  }
});

// Get courses
app.get("/admin/courses", (req, res) => {
  const username = req.headers.username;
  const password = req.headers.password;
  const authenticatedAdmin = admins.find(
    (admin) => username === admin.username && password === admin.password
  );
  if (authenticatedAdmin) {
    res.json(courses);
  } else {
    res.status(401).send({ meassge: "You are not authenicated" });
  }
});

// Users Routes

// Signup
app.post("/users/signup", (req, res) => {
  const { name, email, username, password } = req.body;
  const user = {
    name: name,
    email: email,
    username: username,
    password: password,
    courses: [],
  };
  const existingUser = users.find(
    (user) => user.username === username && user.email === email
  );
  if (!existingUser) {
    users.push(user);
    res.json({ message: "User created successfully" });
  } else {
    res.status(400).send({ message: "User already exists" });
  }
});

// Login
app.post("/users/login", (req, res) => {
  const username = req.headers.username;
  const password = req.headers.password;

  const existingUser = users.find(
    (user) => user.username === username && user.password === password
  );
  if (existingUser) {
    res.send({ message: "Logged in successfully" });
  } else {
    res.status(400).send({ message: "Invalid credentials" });
  }
});

app.get("/users/courses", (req, res) => {
  res.json(courses);
});
app.post("/users/courses/:id", (req, res) => {
  const username = req.headers.username;
  const password = req.headers.password;
  const id = Number(req.params.id);
  const existingUser = users.find(
    (user) => user.username === username && user.password === password
  );
  if (existingUser) {
    const courseAvailable = existingUser.courses.find(
      (course) => course.id === id
    );
    if (!courseAvailable) {
      existingUser.courses.push(courses.find((course) => course.id === id));
      res.json(existingUser.courses);
    } else {
      res.status(400).send({ message: "course already purchased" });
    }
  } else {
    res.status(400).send("Please login or create account to purchase course");
  }
});

app.get("/users/purchasedCourses", (req, res) => {
  const username = req.headers.username;
  const password = req.headers.password;
  const existingUser = users.find(
    (user) => user.username === username && user.password === password
  );
  if (existingUser) {
    res.json(existingUser.courses);
  } else {
    res.status(404).send("User not found");
  }
});

app.all("*", (req, res) => {
  res.status(404).send("Route not found");
});

app.listen(PORT, () => {
  console.log(`App is listening at the port ${PORT}`);
});
