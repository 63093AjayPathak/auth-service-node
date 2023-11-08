const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.url);
  if (
    req.url === "/auth/login" ||
    req.url === "/auth/signup" ||
    req.url === "/auth/token"
  ) {
    next();
  } else {
    // extrating the access token from request and validating it
    const header = req.headers["authorization"];
    const token = header && header.split(" ")[1];

    if (token == null) {
      res.status(404).send("No token available");
    } else {
      try {
        const user_id = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user_id = user_id;
        next();
      } catch (ex) {
        if (ex instanceof jwt.TokenExpiredError)
          res.status(206).send("Access token expired");
        else {
          res.status(404).send("Invalid token");
        }
      }
    }
  }
});

const router = require("./routes");

app.use("/", router, (req, res, next) => {
  console.log(req.url);
  next();
});

app.listen(3001, "0.0.0.0", () => {
  console.log("server started at post 3001");
});
