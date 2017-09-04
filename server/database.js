var Bookshelf = require('bookshelf');

var config = {
    host: 'my02.winhost.com',
    user: 'dustin',
    password: 'ballard123',
    database: 'mysql_74827_xcel',
    charset: 'UTF8_GENERAL_CI'
};

var DB = Bookshelf.initialize({
    client: 'mysql',
    connection: config
});

module.exports.DB = DB;