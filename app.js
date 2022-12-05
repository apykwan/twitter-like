const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
require('dotenv').config();

require('./database');
const middleware = require('./middleware');
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logout');
const postsApiRoutes = require('./routes/api/posts');
const usersApiRoutes = require('./routes/api/users');
const profileRoutes = require('./routes/profileRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// static file
app.use(express.static(`${__dirname}/public`));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false
}));
app.use(helmet());

app.set("view engine", "pug");
app.set("views", "views");

// API Routes

app.get("/", middleware.requireLogin, (req, res, next) => {
  const payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user)
  };

  res.status(200)
    .set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
    .render("home", payload);
});
app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);
app.use("/posts", middleware.requireLogin, postRoutes);
app.use("/profile", middleware.requireLogin, profileRoutes);
app.use("/api/posts", postsApiRoutes);
app.use("/api/users", usersApiRoutes);

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
});

process.on('uncaughtException', err => {
    console.log(`ERROR: ${err.message}`);
    console.log('Shutting down service due to uncaught exception');
    process.exit(1);
});

process.on('unhandledRejection', err => {
    console.log(`ERROR: ${err.stack}`);
    console.log('Shutting down the server due to Unhandled Promise rejection');
    server.close(() => {
        process.exit(1);
    });
});