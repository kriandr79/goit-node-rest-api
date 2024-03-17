import User from "../models/users.js";
import HttpError from "../helpers/HttpError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import gravatar from "gravatar";
import Jimp from "jimp";
import "dotenv/config";
import { nanoid } from "nanoid";
import { transport } from "../helpers/sendMail.js";

export const register = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user !== null) {
      throw HttpError(409, "Email in use");
    }

    const firstAvatar = gravatar.url(email, { s: "250", d: "robohash" }, true);
    const passwordHash = await bcrypt.hash(password, 10);

    // Send verification email
    const verificationToken = nanoid();

    const message = {
      from: "andrey.krivrouchko@gmail.com", // sender address
      to: email, // list of receivers
      subject: "Please verify your email address", // Subject line
      text: `Open link http://localhost:3000/api/users/verify/${verificationToken} to verify your email.`, // plain text body
      html: `Click <a href="http://localhost:3000/api/users/verify/${verificationToken}">link</a> to verify your email.`, // html body
    };

    await transport
      .sendMail(message)
      .then((info) => console.log(info))
      .catch((err) => console.log(err));

    //

    const result = await User.create({
      email,
      password: passwordHash,
      avatarURL: firstAvatar,
      verificationToken,
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

    if (user.verify === false) {
      throw HttpError(401, "Email is not verified");
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
      { avatarURL: `/avatars/${avatarURL}` },
      { new: true }
    );

    if (user === null) {
      throw HttpError(404);
    }

    res.status(200).send({ avatarURL: `/avatars/${avatarURL}` });
  } catch (error) {
    next(error);
  }
};

export const verifyUser = async (req, res, next) => {
  const { verificationToken } = req.params;

  try {
    const user = await User.findOne({ verificationToken });

    if (user === null) {
      throw HttpError(404, "User not found");
    }

    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: "Verify token is required",
    });

    res.status(200).send({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};

export const resendVerifyEmail = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user.verify === true) {
      throw HttpError(404, "Verification has already been passed");
    }

    const message = {
      from: "andrey.krivrouchko@gmail.com", // sender address
      to: email, // list of receivers
      subject: "Please verify your email address", // Subject line
      text: `Open link http://localhost:3000/api/users/verify/${user.verificationToken} to verify your email.`, // plain text body
      html: `Click <a href="http://localhost:3000/api/users/verify/${user.verificationToken}">link</a> to verify your email.`, // html body
    };

    await transport
      .sendMail(message)
      .then((info) => console.log(info))
      .catch((err) => console.log(err));

    res.status(200).send({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};
