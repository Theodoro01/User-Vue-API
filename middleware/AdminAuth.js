const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

module.exports = function(req, res, next){
    const authToken = req.headers['authorization'];

    if(!authToken)
        return res.status(401).send({ error: 'No token provided'});

    if(authToken != undefined){

        const bearer = authToken.split(" ");

        if(!bearer.length === 2)
            return res.status(401).send({ error: 'Token error'});

        var token = bearer[1];

        try{
            const decoded = jwt.verify(token, process.env.SECRET_TOKEN);

            if(decoded.role == 1){
                next();
            }else{
                res.status(400).send("You do not have permission")
            }

            console.log(decoded)
            next()
        }catch(err){
            return res.status(400).send("Token invalid'");
        }

    }else{
        res.status(400).send("Token invalid'");
    }

}