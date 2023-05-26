const express = require("express");
const router = express.Router();
const SHA256 = require("crypto-js/sha256");
const encbase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");
const convertToBase64 = require("../outils/convertB64");
const cloudinary = require("cloudinary").v2;

const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    // console.log(req.body);

    const { email, username, newsletter, password } = req.body;

    // console.log(req.body.email);

    if (email && username && password && newsletter !== undefined) {
      const isUserExist = await User.findOne({ email });
      console.log("isUserExist==>", isUserExist);

      if (isUserExist) {
        return res.status(400).json("This elail is not available");
      } else {
        const salt = uid2(35);
        const hash = SHA256(password + salt).toString(encbase64);
        const token = uid2(35);
        console.log("hash===>", hash);
        const newUser = new User({
          email,
          account: {
            username,
            avatar: Object, // nous verrons plus tard comment uploader une image
          },
          newsletter,
          token,
          hash,
          salt,
        });
        if (req.files) {
          console.log(req.files);
          const avatarToUpload = convertToBase64(req.files.picture);
          const avatarResult = await cloudinary.uploader.upload(
            avatarToUpload,
            {
              folder: `/correction/vinted`,
            }
          );
          newUser.account.avatar = avatarResult;
        }
        await newUser.save();
        res.status(200).json({
          _id: newUser._id,
          token: newUser.token,
          account: {
            username: newUser.account.username,
            avatar: newUser.account.avatar,
          },
        });
      }
      //isUserExist==> null, l'utilisateur n'exite pas encore
      //alors nous pouvons le creer
    } else {
      return res.status(400).json("Missing parameters");
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log(req.body);
    const userFound = await User.findOne({ email });
    // console.log(userFound);
    // console.log("user", user.hash);

    if (userFound) {
      const newHash = SHA256(password + userFound.salt).toString(encbase64);

      // console.log("newHash==>", newHash);

      if (newHash !== userFound.hash) {
        return res.status(400).json("password or email is not valid");

        // console.log(userLogin);
      } else {
        return res.status(200).json({
          _id: userFound._id,
          token: userFound.token,
          account: userFound.account,
        });
      }
    } else {
      return res.status(400).json("password or email is not valid");
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

module.exports = router;
