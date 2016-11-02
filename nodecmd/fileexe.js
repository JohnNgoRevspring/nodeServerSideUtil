var express = require('express');

module.exports = (function() {

    var router = express.Router();
    var exec = require('child_process').exec;
    var config = require('./config');


    // var exeTheFile = function(){
    // console.log(config.file_exe_fullpath + " start");
    // exec(config.file_exe_fullpath + config.file_exe_args_jsonObj, function(err, data) {  
    //         console.log(err)
    //         console.log(data.toString());                       
    //     });  
    // }

    function handleFileExe (req, res) {
        console.log(config.file_exe_fullpath + " start");
        if (req.params.json_obj) {
            config.file_exe_args_jsonObj = req.params.json_obj;
        }
        exec(config.file_exe_fullpath + ' ' + config.file_exe_args_jsonObj, 
            function(err, data) { 
                if (err === null){ 
                    console.log(err);
                    res.status(404);
                    res.send({
                        "success" : 0,
                        "message" : err
                    });
                } else {
                    res.status(200);
                    res.json({
                        "success": 1,
                        "message": "success"
                    });
                    console.log(data.toString());  
                }                     
        });  
    };

    router.get ('/', handleFileExe);
    router.get('/:json_obj', handleFileExe);

    return router;

})();