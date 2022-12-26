const express = require('express');
let io = require('socket.io');
const helmet = require('helmet');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

require('./database');
const middleware = require('./middleware');
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const logoutRoute = require('./routes/logout');
const profileRoutes = require('./routes/profileRoutes');
const postRoutes = require('./routes/postRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const searchRoutes = require('./routes/searchRoutes');
const messagesRoute = require('./routes/messagesRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const postsApiRoutes = require('./routes/api/posts');
const usersApiRoutes = require('./routes/api/users');
const chatsApiRoutes = require('./routes/api/chats');
const messagesApiRoutes = require('./routes/api/messages');
const notificationApiRoutes = require('./routes/api/notifications');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// static file
app.use(express.static(`${__dirname}/public`));
app.use(cors());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false
}));
app.use(helmet());

app.set("view engine", "pug");
app.set("views", "views");

// API Routes\
app.get("/", middleware.requireLogin, (req, res, next) => {
  const payload = {
    pageTitle: "Home",
    userLoggedIn: req.session.user,
    userLoggedInJs: JSON.stringify(req.session.user)
  };

  res.status(200)
    .set("Content-Security-Policy", "default-src *; img-src 'self' data:; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
    .render("home", payload);
});
app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/logout", logoutRoute);
app.use("/posts", middleware.requireLogin, postRoutes);
app.use("/profile", middleware.requireLogin, profileRoutes);
app.use("/uploads", uploadRoutes);
app.use("/search", middleware.requireLogin, searchRoutes);
app.use("/messages", middleware.requireLogin, messagesRoute);
app.use("/notifications", middleware.requireLogin, notificationRoutes);
app.use("/api/posts", postsApiRoutes);
app.use("/api/users", usersApiRoutes);
app.use("/api/chats", chatsApiRoutes);
app.use("/api/messages", messagesApiRoutes);
app.use("/api/notifications", notificationApiRoutes);

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
});
io = io(server, { pingTimeout: 60000 });

io.on("connection", socket => {
  socket.on("setup", userData => {
   socket.join(userData._id);
   socket.emit("connected");
  });

  socket.on("join room", room => socket.join(room));
  socket.on("typing", room =>  socket.in(room).emit("typing"));
  socket.on("stop typing", room => socket.in(room).emit("stop typing"));

  socket.on("new message", newMessage => {
    const chat = newMessage.chat;

    if(!chat.users) return console.log("chat.users not defined");

    chat.users.forEach(user => {
      if (user._id === newMessage.sender._id) return;

      socket.in(user._id).emit("message received", newMessage);
    });
  });
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