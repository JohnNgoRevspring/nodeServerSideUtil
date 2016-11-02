var express = require('express');

module.exports = (function() {

	var router = express.Router();
	var Sequelize = require('sequelize');
	var config = require('./mssqlconfig');

	//Initialize database config.db.host ???	
	var sequelizeDB = new Sequelize(config.db.database, config.db.username, config.db.password, {
		host:  config.db.host,
		dialect: config.db.dialect
	});

	var TABLE_PREFIX = config.db.table_prefix;

	//Pagination settings
	var paginate = config.paginate;
	var page_limit = config.page_limit;

	var addSingleQuote = function (str) {
		if (str.startsWith("'"))
			return str;
		else 
			return sequelizeDB.getQueryInterface().escape(str);
	};

	function getPrimaryColumnNameSQL(database, table){
		return "SELECT COLUMN_NAME FROM ["+ database +"].INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = '"+ table + "' AND CONSTRAINT_NAME LIKE 'PK%'";
	};

	function mapMssqlToSequelizeDataType(sequelizeComp, dataTypestr){
		var dataType = sequelizeComp.STRING;
		switch(dataTypestr){
			case 'var','nchar','ntext':
				break;
			case 'uniqueidentifier':
				dataType = sequelizeComp.UUID; break;
			case 'date':
				dataType = sequelizeComp.DATE; break;				
			case 'bigint':
				dataType = sequelizeComp.BIGINT; break;
			case 'bit':
				dataType = sequelizeComp.BOOLEAN; break;
			case 'int':
				dataType = sequelizeComp.INTEGER; break;
			case 'float':
				dataType = sequelizeComp.FLOAT; break;
			case 'decimal':
				dataType = sequelizeComp.DECIMAL; break;																	
			case 'datetime','datetime2':
				dataType = sequelizeComp.TIME; break;
			// case '':
			// 	dataType = sequelizeComponent.REAL; break;
			// case '':
			// 	dataType = sequelizeComponent.DATEONLY; break;
			// case '':
			// 	dataType = sequelizeComponent.HSTORE; break;
			// case '':
			// 	dataType = sequelizeComponent.JSON; break;
			// case '':
			// 	dataType = sequelizeComponent.JSONB; break;
			// case '':
			// 	dataType = sequelizeComponent.NOW; break;
			// case '':
			// 	dataType = sequelizeComponent.BLOB; break;																	
			// case '':
			// 	dataType = sequelizeComponent.RANGE; break;	
			// case '':
			// 	dataType = sequelizeComponent.UUIDV1; break;
			// case '':
			// 	dataType = sequelizeComponent.UUIDV4; break;																	
			// case '':
			// 	dataType = sequelizeComponent.VIRTUAL; break;
			// case '':
			// 	dataType = sequelizeComponent.ENUM; break;
			// case '':
			// 	dataType = sequelizeComponent.ARRAY; break;			
		}				
		return dataType;
	}

	function lowerCaseFirstLetter(str) {
    	return str[0].toLowerCase() + str.slice(1);
	}

	const tableStructSQL = "SELECT * FROM Information_schema.Columns WHERE table_name = '!table'";	
	function iniTableModel(res, table, callback){
		var sql = tableStructSQL.replace('!table', table);
		runQuery(res, sql, {}, sequelizeDB.QueryTypes.SELECT, function(rows){
			var modelTable = {};
			rows.map( function (row) {
				modelTable[lowerCaseFirstLetter(row.COLUMN_NAME)] =  mapMssqlToSequelizeDataType(Sequelize, row.DATA_TYPE);
			});
			callback(modelTable);
		});
	}

	function iniTableColumns(res, table, callback){
		var sql = tableStructSQL.replace('!table', table);
		runQuery(res, sql, sequelizeDB.QueryTypes.SELECT, function(rows){
			var modelTable = {};
			rows.map( function (row) {
				modelTable[lowerCaseFirstLetter(row.COLUMN_NAME)] =  mapMssqlToSequelizeDataType(Sequelize, row.DATA_TYPE);
			});
			callback(modelTable);
		});
	}
	
	function removeQuoteString(str){
		if (str.startsWith("'") || str.startsWith('"')) {
			return str.replace(/^["']/g, "").replace(/["']$/g, "");
		} else {
			return str;
		}
	}

	function runQuery(res, sql, replacements, qryType, callback){
		console.log('executing ' + sql + ' ' + qryType);
			sequelizeDB.query(sql, { replacements: replacements, type: qryType })
			.then(callback)
			.catch( function(err) {
				res.status(404);
				res.send({
					"success" : 0,
					"message" : err.message
				});
			});
	};

	//Create 
	router.post('/:table', function(req, res) {
		if(JSON.stringify(req.body) == '{}') {
			res.status(404);
			res.json({
				"success" : 0,
				"message" : "Parameters missing"
			});
			return false;
		}
		var keys = '';
		var values = '';
		Object.keys(req.body).forEach(function(key, index) {
			var val = req.body[key];
			keys += "`"+key+"`";
			values += addSingleQuote(val);
			if(Object.keys(req.body).length != (index+1)) {
				keys += ',';
				values += ',';
			}
		});
		var sql = "INSERT INTO [" + ( TABLE_PREFIX + req.params.table ) + "] (" + keys + ") VALUES ("+ values +")";
		runQuery(res, sql, {}, sequelizeDB.QueryTypes.INSERT, function(id) {
			res.status(201);
			res.json({
				"success" : 1,
				"id" : id
			});
		});
	});

	//Update by ID 
	router.put('/:table/:id', function(req, res) {
		var sql = getPrimaryColumnNameSQL(config.db.database, TABLE_PREFIX+req.params.table);
		runQuery(res, sql, {}, sequelizeDB.QueryTypes.SELECT, function(keys) {
			var primary_key = keys[0].COLUMN_NAME;
			if(JSON.stringify(req.body) == '{}') {
				res.status(200);
				res.json({
					"success" : 0,
					"message" : "Parameters missing"
				});
				return false;
			}
			var update_string = '';
			Object.keys(req.body).forEach(function(key, index) {
				var val = req.body[key];
				update_string += "`" + key + "` = " + addSingleQuote(val); 
				if(Object.keys(req.body).length != (index+1)) {
					update_string += ',';
				}
			});
			sql = "UPDATE [" + ( TABLE_PREFIX + req.params.table ) + "] SET " + update_string + " WHERE ["+ primary_key +"] = "+addSingleQuote(req.params.id);
			runQuery(res, sql, {}, sequelizeDB.QueryTypes.UPDATE, function() {
				res.status(200);
				res.json({
					"success" : 1,
					"message" : "Updated"
				});
			});
		});
	});

// {"where": {"Id": "C004EF05-5303-E611-80DA-0050569A5956"}}
	function buildFindObj(req){
		if (req.query.find !== undefined){
			return JSON.parse(removeQuoteString(findString));
		} else {
			var findAllObj = {where:{}};
			findAllObj.where = 	req.query;
			return findAllObj;
		}
	};

	function buildPaginateObj(isPaginateSet, sortByColumn, page){
		var paginateObj = { sqlSegment : "", pages: {}, isPaginate: isPaginateSet && sortByColumn !== undefined };
		if(paginateObj.isPaginate) {
			var page = 1;
			if(page)
				page = page;
			var offset = (page-1) * page_limit;

			//Calculate pages
			var next = Number(page)+1;
			if(page != 1)
				var previous = Number(page)-1;
			else
				var previous = Number(page);
			
			paginateObj.sqlSegment = " ORDER BY "+ sortByColumn + " OFFSET " + offSet + " ROWS FETCH NEXT "+ pageLimit +" ROWS ONLY";
			paginateObj.pages =  {"next": next,"previous": previous,"last": 0};
			pagenateObj.setLastPage = function(totalRowsReturn){
				pagenateObj.pages.last = Math.ceil(rows.length/page_limit);
			}
		}
		return paginateObj;
	}

	function buildWhereStr(req){
		var where = [];
		for(var q in req.query){
			where.push({q:req.query[q]});
		};
		return where.length > 0 ? '' : 'WHERE ' + where.join(' AND ');
	}

	//Read 
	//http://localhost:3000/mssqlapi/user?query="DECLARE @OrgIdTable udtIdTable; INSERT INTO @OrgIdTable([Id]) VALUES ('823EA6D0-5403-E611-80DA-0050569A5956'); EXEC dbo.spPaymentQueryV2 @EndDate='07/20/2016 23:59:59',@StartDate='01/02/2016',@ptDateColumn='CreatedAt', @OrgId=@OrgIdTable,@includeChildren = 1;"
	//http://localhost:3000/mssqlapi/Organization?find={"where":{"Id":"C004EF05-5303-E611-80DA-0050569A5956"}}
	router.get('/:table', function (req, res) {
		var paginateObj = buildPaginateObj(paginate, req.query.sortByColumn, req.query.page);
		if (req.query.find !== undefined  || req.query.query === undefined) {

			var findAllObj = buildFindObj(req);

			iniTableModel(res, req.params.table, function (tableStructure) {
				var tableDefine  = sequelizeDB.define(req.params.table, tableStructure);
				tableDefine.tableName = req.params.table;
				const tableConstant = tableDefine;
				tableDefine.findAll(findAllObj)
					.then(function(rows){
						if(!rows.length) {
							res.status(404);
							res.json({
								"success" : 0,
								"data" : "No rows found"
							});
						}
						res.status(200);
						if(!paginateObj.isPaginate) {
							res.json({
								"success" : 1,
								"data" : rows
							});
						}
						// else
						// 	var last = Math.ceil(rows.length/page_limit);
						// res.json({
						// 	"success" : 1,
						// 	"data" : rows,
						// 	"pages" : {
						// 		"next": next,
						// 		"previous": previous,
						// 		"last": last
						// 	}
						// });
					});
				});
		} else {
			var read_query = removeQuoteString(req.query.query);
			
			runQuery (res, read_query, {}, sequelizeDB.QueryTypes.SELECT, function(rows) {
				if(!rows.length) {
					res.status(404);
					res.json({
						"success" : 0,
						"data" : "No rows found"
					});
				}
				res.status(200);
				if(!paginateObj.isPaginate)
					res.json({
						"success" : 1,
						"data" : rows
					});
				else
					pagenateObj.setLastPage(rows.length);
				res.json({
					"success" : 1,
					"data" : rows,
					"pages" : paginateObj.pages
				});
			});
		}
	});

	//Read by ID 
	router.get('/:table/:id', function(req, res) {
		var sql = getPrimaryColumnNameSQL(config.db.database, TABLE_PREFIX+req.params.table);
		runQuery(res, sql, {}, sequelizeDB.QueryTypes.SELECT, function(keys) {
			//var primary_key = keys[0].COLUMN_NAME;
			// sql = "SELECT * FROM ["+TABLE_PREFIX+req.params.table+"] WHERE ["+ primary_key +"] = " + addSingleQuote(req.params.id);
			// runQuery(res, sql, sequelize.QueryTypes.SELECT, function(rows) {
			// 	if(!rows.length) {
			// 		res.status(404);
			// 		res.json({
			// 			"success" : 0,
			// 			"data" : "No rows found"
			// 		});
			// 	}
			// 	res.status(200);
			// 	res.json({
			// 		"success" : 1,
			// 		"data" : rows
			// 	});
			// });
			var findAllObj = {where:{}};
			findAllObj.where[keys[0].COLUMN_NAME] = removeQuoteString(req.params.id);
			iniTableModel(res, req.params.table, function (tableStructure) {
				var tableDefine  = sequelizeDB.define(req.params.table, tableStructure);
				tableDefine.tableName = req.params.table;
				const tableConstant = tableDefine;
				tableDefine.findAll(findAllObj)
					.then(function(rows){
						if(!rows.length) {
							res.status(404);
							res.json({
								"success" : 0,
								"data" : "No rows found"
							});
						}
						res.status(200);
						res.json({
								"success" : 1,
								"data" : rows
							});
					});
				});
		});
	});

	//Delete by ID 
	router.delete('/:table/:id', function(req, res) {
		var sql = getPrimaryColumnNameSQL(config.db.database, TABLE_PREFIX+req.params.table);
		runQuery(res, sql, sequelizeDB.QueryTypes.SELECT, function(keys) {
			var primary_key = keys[0].COLUMN_NAME;
			sql = "DELETE FROM ["+TABLE_PREFIX+req.params.table+"] WHERE ["+ primary_key +"] = "+addSingleQuote(req.params.id);
			runQuery(res, sql, sequelizeDB.QueryTypes.DELETE, function() {
				res.status(200);
				res.json({
					"success": 1,
					"message": "Deleted"
				});
			});
		});
	});

	return router;

})();