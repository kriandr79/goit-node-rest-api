import jwt from "jsonwebtoken";
import HttpError from "../helpers/HttpError.js";
import User from "../models/users.js";

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // чи є хеадер?
    if (typeof authHeader === "undefined") {
        next(HttpError(401, "Not authorized"));
        return;
  }

  const [bearer, token] = authHeader.split(" ", 2);

  // чи є в заголовку беарер?
  if (bearer !== "Bearer") {
    next(HttpError(401, "Not authorized"));
  }

  try {
    // чи валідний токен і є юзер в базі?
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) {
      next(HttpError(401, "Not authorized"));
    }

    req.user = { id };

    next();
  } catch  {
    next(HttpError(401, "Not authorized"));
  }
};

export default auth;
