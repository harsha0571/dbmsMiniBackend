const router = require('express').Router();

const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: 'brfz6uddsjfdawqruisq-mysql.services.clever-cloud.com',
        port: 3306,
        user: process.env.USERNAME,
        password: process.env.PASSWORD,
        database: 'brfz6uddsjfdawqruisq'
    }
});

router.route('/').get((req, res) => {
    // User.find()
    //     .then(user => res.json(user))
    //     .catch(err => res.status(400).json("error " + err))

    knex.from('TEST').select('*').then(no => {

        console.log(no.length)
        for (var i = 0; i < no.length; i++) {
            console.log(no[i].phno)
        }

    });


});


// knex.from('TEST').select('phno')
//     .then(no => {
//         console.log(no.length)
//         for (var i = 0; i < no.length; i++) {
//             console.log(no[i].phno)
//         }

//     });

// knex('TEST').insert({ name: 'haddj', phno: 4343 }).then(res => {
//     console.log(res)
// });

// knex('TEST').where({ name: 'haddj' }).del().then(res => {
//     console.log(res)
// });

module.exports = router;