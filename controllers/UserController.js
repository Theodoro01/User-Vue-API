const User = require("../models/User");
const PasswordToken = require("../models/PasswordToken");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const bcrypt = require("bcrypt");

class UserController{

    async index(req, res){
        try{

            const users = await User.findAll();
            res.json(users);

        }catch(err){
            console.log(err);
        }
    }

    async findUser(req, res){
        const id = req.params.id;
        const user = await User.findById(id);

        if(user === undefined){
            return res.status(404).send({error: "User already exist"});

        }else{
            return res.status(200).json(user);
        }
    } 

    async create(req, res){
        const {email, name, password} = req.body;

        try{
            if(email === undefined || email === "" || email === " ")
                return res.status(401).send({error: "Email is not defined"});

        }catch(err){
            return res.status(401).send({error: "Unauthorized"});
        }

        const emailExist = await User.findEmail(email);

        if(emailExist)
            return res.status(406).send({error: "E-mail already exist"});
        
        await User.new( email, name, password)
        res.send("Tudo OK!");
    }

    async edit(req, res){

        console.log(req.body)

        const {id, email, name, role} = req.body;

        try{
            const result = await User.update( id, email, name, role);

            if(result != undefined){
                if(result.status){
                    return res.status(200).send({msg: "Tudo OK"});
                }else{
                    return res.status(406).send(result.err);
                }
            }else{
                return res.status(406).send({error: "Ocorreu algum erro!"});
            } 
        }catch(err){
            return res.status(400).send({error: "Ocorreu algum erro! 2"});
        }
    }

    async remove(req, res){
        const id = req.params.id;

        try{
            const result = await User.delete(id);

            if(result.status){
                return res.status(200).send({msg: "Tudo OK"});
            }else{
                return res.status(406).send(result.err);
            }
        }catch(err){
            console.log(err)
        }
    }

    async recoverPassword(req, res){
        const email = req.body.email;
        const result = await PasswordToken.create(email);

        console.log(result.token)

        if (result.status){
            res.status(200).send("" + result.token)
        }else{
            res.status(400).send(result.err)
        }

    }

    async changePassword(req, res){
        var token = req.body.token;
        var password = req.body.password;

        var isTokenValid = await PasswordToken.validate(token);

        if(isTokenValid.status){
            
            await User.changePassword(password, isTokenValid.token.user_id, isTokenValid.token.token);

            res.status(200).send("Changed password!");

        }else{
            res.status(406).send("Token Invalido");
        }
    }

    async login(req,res){
        const {email, password} = req.body;

        const user = await User.findByEmail(email);

        if(user != undefined){

            var result = await bcrypt.compare(password, user.password);

            if(result){
                var token = jwt.sign({email: user.email, role: user.role}, process.env.SECRET_TOKEN);

                res.status(200).json({token: token})
            }else{
                res.status(400).send({error: "Invalid Password"})
            }

            res.json({ status: result });
            
        }else{
            res.status(400).send({ status: false, error: "User already exist"});
        }
    }

}

module.exports = new UserController();