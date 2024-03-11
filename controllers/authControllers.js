import User from "../models/users.js";
import HttpError from "../helpers/HttpError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import gravatar from "gravatar";
import Jimp from "jimp";

export const register = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user !== null) {
      throw HttpError(409, "Email in use");
    }

    const firstAvatar = gravatar.url(email, { s: "250", d: "robohash" }, true);
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await User.create({
      email,
      password: passwordHash,
      avatarURL: firstAvatar,
    });

    res.status(201).send({
      user: {
        email,
        subscription: "starter",
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user === null) {
      throw HttpError(401, "Email or password is wrong");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw HttpError(401, "Email or password is wrong");
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    await User.findByIdAndUpdate(user.id, { token });

    res.status(200).send({
      token,
      user: {
        email: email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { token: null });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const current = async (req, res, next) => {
  try {
    const { email, subscription } = await User.findById(req.user.id);
    res.status(200).send({
      email: email,
      subscription: subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const subscriptionUpdate = async (req, res, next) => {
  try {
    const { subscription } = req.body;
    await User.findByIdAndUpdate(req.user.id, { subscription });
    res.status(200).send({
      subscription: subscription,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  const owner = req.user.id;
  const avatarURL = req.file.filename;

  try {
    await Jimp.read(req.file.path)
      .then((image) => {
        return image
          .resize(250, 250) // resize
          .write(req.file.path); // save
      })
      .catch((err) => {
        console.error(err);
      });  

    await fs.rename(
      req.file.path,
      path.join(process.cwd(), "public/avatars", avatarURL)
    );

    const user = await User.findByIdAndUpdate(
      owner,
      { avatarURL },
      { new: true }
    );

    if (user === null) {
      return res.status(404);
    }

    res.status(200).send({ avatarURL });
  } catch (error) {
    next(error);
  }
};
