const knex = require ("../database/connection");
const bcrypt = require("bcrypt");
const PasswordToken = require("../models/PasswordToken");

class User{

    async new(email, name, password){
        try{
            const hash  = await bcrypt.hash(password, 10);
            await knex.insert({email, name, password: hash, role: 0}).table("users");

        }catch(err){
            console.log(err);
        }
    }

    async findEmail(email){
        try{
            const result = await knex.select("*").from("users").where({email: email});
            
            if(result.length > 0){
                return true;
            }else{
                return false;
            }
        }catch(err){
            console.log(err);
        }
    }

    async findAll(){
        try{
            const result = await knex.select("id","name", "email", "role").table("users");
            return result;
        }catch(err){
            console.log(err);
            return []
        }
    }
    async findById(id){
        try{
            const result = await knex.select("id","name", "email", "role").where({id: id}).table("users");
           if(result.length > 0){
               return result[0];
           }else{
               return undefined;
           }
        }catch(err){
            console.log(err);
            return undefined;
        }
    }
    
    async update(id, email, name, role){

        const user = await this.findById(id);

        if(user != undefined){
            
            var editUser = {};

            if(email != undefined){
                if(email != user.email){
                    var result = await this.findEmail(email);
                    if(result == false){
                        editUser.email = email;
                    }else{
                        return res.status(400).send({Error: "User already exist"});
                    }
                }
            }
            if(name != undefined){
                editUser.name = name 
            }

            if(role != undefined){
                editUser.role = role 
            }

            try{
                await knex.update(editUser).where({id: id}).table("users");
                return res.status(200);
            }catch(err){
                return res.status(400).send({Error: err});
            }

        }else{
            return res.status(404).send({Error: "User not found"});
        }
    }
    async delete(id){
        const user = await this.findById(id);

        if(user != undefined){

            try{
                await knex.delete().where({id: id}).table("users");
                return res.status(200);
            }catch(err){
                return {status: true, err: err};
            }

        }else{
            return { status: false, err: "O usuario não existe, portanto não pode ser deletado."};
        }
    }
    async findByEmail(email){
        try{
            const result = await knex.select("id","name", "password", "email", "role").where({email: email}).table("users");
           if(result.length > 0){
               return result[0];
           }else{
               return undefined;
           }
        }catch(err){
            console.log(err);
            return undefined;
        }
    }

    async changePassword(newPassword, id, token){
        const hash  = await bcrypt.hash(newPassword, 10);
        await knex.update({password: hash}).where({id: id}).table("users");
        await PasswordToken.setUsed(token);
    }
}


module.exports = new User();