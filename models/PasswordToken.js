const knex = require ("../database/connection");
const User = require("../models/User");
const { v4: uuidv4 } = require('uuid');

class PasswordToken{
    async create(email){
        const user = await User.findByEmail(email);

        if(user != undefined){
            try{

                const token = uuidv4();
                
                await knex.insert({
                    user_id: user.id, 
                    used: 0,
                    token: token,
                }).table("passwordtokens");

                return {status: true, token: token }
            }catch(err){
                console.log(err);
                return {status: false, err: err};
            }
        }else{
            return {status: false, err: "Invalid Email"};
        }
    }

    async validate(token){
        try{
            var result = await knex.select().where({token: token}).table("passwordtokens");

            if(result.length > 0){
                var tk = result[0];

                if(tk.used){
                    return {status: false };
                }else{
                    return {status: true, token: tk};
                }
            }else{
                return false;
            }
        }catch(err){
            console.log(err);
            return false;
        }
    }

    async setUsed(token){
        await knex.update({used: 1 }).where({token: token}).table("passwordtokens")
    }
}

module.exports = new PasswordToken();