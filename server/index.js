const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/test');
  console.log("db created");
}

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        unique : true,
        lowercase : true,
    },
    password : String,
    name : String, 
    phone : Number,
    address : String,
    age : Number, 
    credits : {
        type : Number,
        default : 5,
    },
    date : {
        type : Date,
        default : Date.now,
    }
});

const User = mongoose.model('User', userSchema);

const server = express();

server.use(cors());
server.use(bodyParser.json());

server.post('/signin',async (req, res) => {

    const {email, password} = req.body;

    let user = await User.findOne({email});

    const isMatch = bcrypt.compare(password, user.password);

    if(!isMatch) return res.json({
        message : "Incorrect password",
        status : 0,
        userdata : user
    });

    if(user){
        return res.json({
            message : "Successfully logged in",
            status : 1,
            userdata : user
        });
    }
    else return res.json({
        message : "User doesn't exist",
        status : 0,
        userdata : user
    });

})

server.post('/signup',async (req, res) => {

    const {email, password, name, phone, address, age} = req.body;

    let user = await User.findOne({email});
    if(user){
        return res.json({
            message : "User already exists...",
            status : 0,
            userdata : user
        });
    }

    const hashedpwd = await bcrypt.hash(password,10);

    user = await User.create({
        email, 
        password : hashedpwd,
        name,
        phone,
        address,
        age
    });
    const doc = await user.save();

    console.log(doc);
    res.json({
        message : "User created",
        status : 1,
        userdata : user
    });
})

server.get('/',async (req, res)=>{
    const docs = await User.find({});
    res.json({docs})
})

server.listen(8080, ()=>{
    console.log("server started")
})