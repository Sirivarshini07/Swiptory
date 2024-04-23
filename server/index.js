require("dotenv").config();
console.log(process.env.MONGODB_URI);
const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const mongoose = require("mongoose");


const authRoutes = require("./routes/auth");



const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose
    .connect(process.env.MONGODB_URI)
    .then(()=> console.log(" MongoDB Connected!!"))
    .catch((error)=>console.log("Db failed to connect!",error))

app.get("/", (req, res)=>{
    console.log("Server is up and running");
    res.status(200).json({
        service:"story telling server",
        status: "Success",
        time: new Date(),
    })
})

app.use("/api/auth", authRoutes);
const PORT= process.env.PORT || 4000;

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});

