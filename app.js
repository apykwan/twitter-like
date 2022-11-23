const express = require('express');
const helmet = require('helmet');
require('dotenv').config();
const session = require('express-session');

require('./database');
const middleware = require('./middleware');
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logout');
const postsApiRoute = require('./routes/api/posts');

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
    userLoggedIn: req.session.user
  };

  res.status(200).render("home", payload);
});
app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);

app.use("/api/posts", postsApiRoute);



const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
});