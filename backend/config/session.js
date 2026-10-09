const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);

const pool = require("./database");

const sessionMiddleware = session({
  store: new pgSession({
    pool,
    tableName: "user_sessions",
    createTableIfMissing: true,
  }),

  secret: process.env.SESSION_SECRET,

  resave: false,
  saveUninitialized: false,

  cookie: {
    httpOnly: true,

    // HTTPS di production
    secure: process.env.NODE_ENV === "production",

    sameSite: "lax",

    // 8 jam
    maxAge: 1000 * 60 * 60 * 8,
  },
});

module.exports = sessionMiddleware;