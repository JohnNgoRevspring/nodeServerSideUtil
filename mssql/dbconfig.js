var config = {};

config.port = 3000;


//Authentication
config.auth = false;

//Database mssql
config.db = {};
config.db.dialect = 'mssql';
config.db.host = '';
config.db.port = '1433';
config.db.database = '';
config.db.username = '';
config.db.password = '';
config.db.table_prefix = '';

//Pagination
config.paginate = true;
config.page_limit = 10;

config.file_exe_fullpath = 'C:\\dev\\github\\revspring\\Obsidian.NETMainSolution\\RemitScript\\bin\\x64\\x64\\RemitScript.exe';
config.file_exe_args_jsonObj = '';

module.exports = config;