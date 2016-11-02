var config = {};

config.port = 3000;


//Authentication
config.auth = false;

//Database mssql
config.db = {};
config.db.dialect = 'mssql';
config.db.host = '172.28.233.20';
config.db.port = '1433';
config.db.database = 'development';
config.db.username = 'DAP-3F4D78CD-A74E-4EE8-8DCA-BA2EED3F7CF3';
config.db.password = '4~HtisM01~FLJ^Q';
config.db.table_prefix = '';

//Pagination
config.paginate = true;
config.page_limit = 10;

config.file_exe_fullpath = 'C:\\dev\\github\\revspring\\Obsidian.NETMainSolution\\RemitScript\\bin\\x64\\x64\\RemitScript.exe';
config.file_exe_args_jsonObj = '';

module.exports = config;