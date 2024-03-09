import express from "express";
import { register, login, logout, current, subscriptionUpdate } from "../controllers/authControllers.js";
import validateBody from "../helpers/validateBody.js";
import { userSchema, subscriptionUpdateSchema } from "../schemas/usersSchemas.js";
import auth from "../middleware/auth.js";

const usersRouter = express.Router();

usersRouter.post("/register", validateBody(userSchema), register);
usersRouter.post("/login", validateBody(userSchema), login);
usersRouter.post("/logout", auth, logout);
usersRouter.get("/current", auth, current);
usersRouter.patch(
  "/",
  auth,
  validateBody(subscriptionUpdateSchema),
  subscriptionUpdate
);


export default usersRouter;
