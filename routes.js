require("dotenv").config();

const express = require("express");
const db = require("./db");
const cryptojs = require("crypto-js");
const jwt = require("jsonwebtoken");

const router = express.Router();

const posts = [
  {
    heading: "This is first post",
    body: "Welcome to my profile",
  },
  {
    heading: "This is second post",
    body: "I'm done with this platform",
  },
];

router.post("/auth/token", (req, res) => {
  const header = req.headers["refresh"];
  const refreshToken = header && header.split(" ")[1];

  if (refreshToken) {
    try {
      const id = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const token = jwt.sign(
        {
          user_id: id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "20s",
        }
      );
      res.status(201).send({ token: token });
    } catch (exp) {
      res.status(404).send("Invalid Refresh Token or Refresh token expired");
    }
  } else {
    res.status(404).send("No refresh token");
  }
});

router.post("/auth/login", (req, res) => {
  // code to authenticate user with db

  const { email, password } = req.body;

  const encPassword = String(cryptojs.MD5(password));

  const statement = "SELECT id, mobile FROM USER WHERE email=? AND password=?";

  db.pool.query(statement, [email, encPassword], (err, result) => {
    if (err) {
      res.send({ status: "error", reason: err });
    } else if (result.length === 0) {
      res.send({ status: "error", reason: "No user found" });
    } else {
      const { id } = result[0];

      const token = jwt.sign(
        {
          user_id: id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "20s" }
      );

      const refreshToken = jwt.sign(
        {
          user_id: id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "1m",
        }
      );

      res.send({ status: "success", token: token, refreshToken: refreshToken });
    }
  });
});

router.post("/auth/signup", (req, res) => {
  // code to register new user
  const { name, email, password, mobile } = req.body;

  const encPassword = String(cryptojs.MD5(password));

  const statement =
    "INSERT INTO USER ( name, email, password, mobile) VALUES (?,?,?,?)";

  db.pool.query(
    statement,
    [name, email, encPassword, mobile],
    (err, result) => {
      if (err) {
        res.send(err);
      } else {
        res.send(result);
      }
    }
  );
});

router.get("/posts", (req, res) => {
  res.send(posts);
});

module.exports = router;
