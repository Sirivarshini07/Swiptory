const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv= require("dotenv");
dotenv.config();

const User = require("../models/user");
const requireAuth = require("../middlewares/requireAuth");


// Error handlling middleware
const errorHandler = (res, error) => {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
};


//Register Api
router.post("/register", async (req,res)=>{
    try {
        const { username, password} = req.body;

        if(!username || !password ){
            return res.status(400).json({message:"Username and password required!!"});
        }

        //checking for existing user
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return res.status(409).json({ message: "Username is already taken" });
        }

        //encrypting password
        const hashedPassword = await bcrypt.hash(password, 10);


        const newUser = new User({
            username,

            password: hashedPassword,
        });
        await newUser.save();

        res.json({ message: "User created!!" });

    } catch (error) {
        errorHandler(res, error);
        
    }
});



//Login Api
router.post("/login", async(req, res)=>{
    try {
        const { username, password } = req.body;

        if (!username || !password) {
          return res
            .status(400)
            .json({ error: "Username and password are required" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign({user: user._id, username: user.username},process.env.JWT_SECRET,{expiresIn: "2h"});
        //console.log(token);

        res.json({
            success: true,
            token,
            userId: user._id,
            username: user.username,
          });

    } catch (error) {
        errorHandler(res, error);
    }
});


// logout
router.post("/logout", requireAuth, async (req, res) => {
    try {
        // Invalidate the token by setting its expiration time to a past date
        const expiredToken = jwt.sign({ user: req.user.username }, process.env.JWT_SECRET, { expiresIn: 0 });
      
        // Respond with the expired token to ensure it's invalidated on the client side
        res.json({ success: true, token: expiredToken, message: "Logout successful" });
    } catch (error) {
        errorHandler(res, error);
    }
});
  
  router.get("/validate", requireAuth, async (req, res) => {
    try {
      res.status(200).json({ message: "Token is valid", user: req.user });
    } catch (error) {
      errorHandler(res, error);
    }
  });
  
  module.exports = router;