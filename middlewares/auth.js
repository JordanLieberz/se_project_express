const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../utils/config");
const { UNAUTHORIZED } = require("../utils/errors");

const auth = (req, res, next) => {
  const exemptedRoutes = [
    { method: "POST", path: "/signin" },
    { method: "POST", path: "/signup" },
    { method: "GET", path: "/items" },
  ];

  const isExempted = exemptedRoutes.some(
    (route) => route.method === req.method && req.path.startsWith(route.path)
  );

  if (isExempted) {
    return next();
  }

  const token =
    req.headers.authorization &&
    req.headers.authorization.replace("Bearer ", "");

  if (!token) {
    return res.status(UNAUTHORIZED).send({ message: "Authorization required" });
  }

  return jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err) {
      return res
        .status(UNAUTHORIZED)
        .send({ message: "Unauthorized: Invalid token" });
    }

    req.user = payload;
    return next();
  });
};

module.exports = auth;
