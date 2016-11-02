const Sequelize = require('sequelize');
var config = require('./mssqlconfig');

	//Initialize database config.db.host ???	
	var sequelizeDB = new Sequelize(config.db.database, config.db.username, config.db.password, {
		host:  config.db.host,
		dialect: config.db.dialect
	});

var dfd = $.Deferred();

dfd.pipe(function(qryObj){ // this is get column query
    function transformColumns(rows){

    };

    if (qryObj.sql.startWith('SELECT *')){
        qryObj.query()
            .then (function(rows){
                var newColumns = transformColumns(rows);
                qryObj.sql = "SELECT " + newColumns + ' ' + qryObj.req.parameter.table + qryObj.where;
                return qryObj
            })
    } else
    {
        return qryObj;
    }

}).pipe(function(qryObj){ // this is the actual query run
    qryObj.sqlize.query(res,sql, {}, qryType,qryObj.callback);
})

// dfd.pipe(function (data) {
//     // Normal blocking computations...
//     var result = data.a + data.b;
//     var output = $('<p>').text('Add: ' + result);
//     $('body').append(output);
    
//     return result;
// }).pipe(function (data) {
//     // Async AJAX call...
//     return $.post('/echo/json/', { json: '{ "value": ' + data + ' }' });
// }).pipe(function (data) {
//     // Again some normal computations...
//     var result = data.value * data.value;
//     var output = $('<p>').text('Square: ' + result);
//     $('body').append(output);
    
//     return result;
// }).pipe(function (data) {
//     // AJAX...
//     return $.post('/echo/json/', { json: '{ "value": ' + data + ' }' });
// }).pipe(function (data) {
//     // Normal...
//     var result = data.value + 1;
//     var output = $('<p>').text('Increment: ' + result);
    
//     $('body').append(output);
// });

dfd.resolve({ sql: 'SELECT * FROM [user];', sqlize: sequelizeDB, req: req}); // Test select *
//dfd.resolve({ sql: 'SELECT Id FROM [user];', sqlize: sequelize, req: req}); // Test none * select