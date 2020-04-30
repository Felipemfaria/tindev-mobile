const axios = require('axios');
const Dev = require('../models/Dev');

module.exports = {
    async index(req, res) {
        const { user } = req.headers;

        const loggedDev = await Dev.findById(user).catch(err => {return console.log(`Erro ao encontrar usuário: ${err.message}`)});

        if(loggedDev){
            const users = await Dev.find({
                $and: [
                    { _id: { $ne: user } },
                    { _id: { $nin: loggedDev.likes} },
                    { _id: { $nin: loggedDev.dislikes} },
                ],
            });

            return res.json(users);
        }else{
            return res.json({Erro: 'Usuário inválido ou não autorizado!'})
        }
    },

    async store(req, res) {
        const { username } = req.body;

        const userExistis = await Dev.findOne({ user: username });
        if( userExistis ){
            return res.json(userExistis);
        }

        const response = await axios.get(`https://api.github.com/users/${username}`).catch(function (error) {
            if (error.response) {
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
            } else if (error.request) {
                console.log(error.request);
            } else {
                console.log('Error', error.message);
            }
            console.log(error.config);
        });

        if(response && response.data.name){
            const { name, bio, avatar_url: avatar } = response.data;

            const dev = await Dev.create({ 
                name,
                user: username,
                bio,
                avatar
            });
            return res.json(dev);
        }else {
            return res.json({message: 'Usuário incorreto ou inexistente!'});    
        }
    }
}