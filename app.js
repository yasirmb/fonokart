// app.js

// Import required modules
let createError = require("http-errors");
let express = require("express");
const path = require("path");
let cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
let logger = require("morgan");
let hbs = require("express-handlebars");
let multer = require("multer");
let userRouter = require("./routes/user");
let adminRouter = require("./routes/admin");
let flash = require("connect-flash");
let session = require("express-session");
let app = express();
const upload = multer({ dest: "uploads/" });
let db = require("./dbconfig/connection");
// Require the user router

// ...

// Mount the user router

// ...

require("dotenv").config();
// const multer = require('multer');

// view engine setup

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(session({ secret: "key", cookie: { maxAge: 600000 } }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "Key",
    cookie: { maxAge: 6000000 },
  })
);
app.use(flash());

db.connect((err) => {
  if (err) console.log("Connection Error" + err);
  else console.log("Database connected");
});

app.use("/", userRouter);
app.use("/admin", adminRouter);
app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: "views/layout/",
    partialsDir: __dirname + "/views/partials/",
  })
);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

// Export the app for use with PM2
module.exports = app;
