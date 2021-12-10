
const knex = require('knex')({
    client: 'mysql',
    connection: {
        host: 'brfz6uddsjfdawqruisq-mysql.services.clever-cloud.com',
        port: 3306,
        user: 'ugqicjvs0qqhx05z',
        password: 'wCDPgvfAbE0mKOqhDNIl',
        database: 'brfz6uddsjfdawqruisq'
    }
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

knex('TEST').where({ name: 'haddj' }).del().then(res => {
    console.log(res)
});

