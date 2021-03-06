
var request = require('request');
var fs = require('fs');
var Promise = require('bluebird');
var path = require('path');
var _ = require('underscore');
var Joi = require('joi');
var clustermodel = require("clusterpost-model");
var qs = require('querystring');

var clusterpost = {};

clusterpost.joiokres = Joi.object().keys({
    ok: Joi.boolean().valid(true),
    id: Joi.string(),
    rev: Joi.string()
});

var setClusterPostServer = function(uri){
    clusterpost.uri = uri;
}

var getClusterPostServer = function(){
    return clusterpost.uri 
}

clusterpost.agentOptions = {};

var setAgentOptions = function(agentOptions){
    clusterpost.agentOptions = agentOptions;
}

var createUser = function(user){
    return new Promise(function(resolve, reject){
        var options = {
            url: getClusterPostServer() + "/auth/user",
            method: 'POST',
            json: user,
            agentOptions: clusterpost.agentOptions
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(body);
            }
        });
    });
}

var userLogin = function(user){
    return new Promise(function(resolve, reject){
        var options = {
            url: getClusterPostServer() + "/auth/login",
            method: 'POST',
            json: user,
            agentOptions: clusterpost.agentOptions
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                clusterpost.tokenraw = body.token;
                clusterpost.token = "Bearer " + body.token;
                resolve(body);
            }
        });
    });
}

var setUserToken = function(token){
    clusterpost.tokenraw = token;
    clusterpost.token = "Bearer " + token;
}

var getUserToken = function(){
    return clusterpost.tokenraw;
}

var getUser = function(){
    return new Promise(function(resolve, reject){
        var options = {
            url: getClusterPostServer() + "/auth/user",
            method: 'GET',
            headers: { authorization: clusterpost.token }
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(body);
            }
        });
    });
}

var getUsers = function(){
    return new Promise(function(resolve, reject){
        var options = {
            url: getClusterPostServer() + "/auth/users",
            method: 'GET',
            headers: { authorization: clusterpost.token }
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(body);
            }
        });
    });
}

var updateUser = function(userinfo){

    return new Promise(function(resolve, reject){
        var options = {
            url: getClusterPostServer() + "/auth/user",
            method: 'PUT',
            json: userinfo,
            headers: { authorization: clusterpost.token }
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(body);
            }
        });
    });
}

var deleteUser = function(){
    return new Promise(function(resolve, reject){
        var options = {
            url: getClusterPostServer() + "/auth/user",
            method: 'DELETE',
            agentOptions: clusterpost.agentOptions,
            headers: { authorization: clusterpost.token }
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(body);
            }
        });
    });
}

var deleteUsers = function(user){
    return new Promise(function(resolve, reject){
        var options = {
            url: getClusterPostServer() + "/auth/users",
            method: 'DELETE',
            agentOptions: clusterpost.agentOptions,
            headers: { authorization: clusterpost.token },
            json: user
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(body);
            }
        });
    });
}

var getExecutionServers = function(){
    return new Promise(function(resolve, reject){
        var options = {
            url : getClusterPostServer() + "/executionserver",
            method: "GET",
            agentOptions: clusterpost.agentOptions,
            headers: { authorization: clusterpost.token }
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(JSON.parse(body));
            }
        });


    });
}

var createDocument = function(job){

    return new Promise(function(resolve, reject){
        var options = {
            url : getClusterPostServer() + "/dataprovider",
            method: "POST",
            json: job,
            agentOptions: clusterpost.agentOptions,
            headers: { authorization: clusterpost.token }
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else if(res.statusCode !== 200){
                reject(body);
            }else{
                resolve(body);
            }
        });


    });
}

var getDocument = function(id){

    return new Promise(function(resolve, reject){
        var options = {
            url : getClusterPostServer() + "/dataprovider/" + id,
            method: "GET",
            agentOptions: clusterpost.agentOptions,
            headers: { authorization: clusterpost.token }
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(JSON.parse(body));
            }
        });
    });
}

var getJobs = function(executable, jobstatus, email){
    return new Promise(function(resolve, reject){

        var params = {};

        if(executable){
            params.executable = executable;
        }

        if(jobstatus){
            params.jobstatus = jobstatus;
        }

        if(email){
            params.email = email;
        }

        var options = {
            url : getClusterPostServer() + "/dataprovider/user?" + qs.stringify(params),
            method: "GET",
            agentOptions: clusterpost.agentOptions,
            headers: { authorization: clusterpost.token }
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(JSON.parse(body));
            }
        });
    });
}

var getDocumentAttachment = function(id, name){

    return new Promise(function(resolve, reject){
        var options = {
            url : getClusterPostServer() + "/dataprovider/" + id + "/" + name,
            method: "GET",
            agentOptions: clusterpost.agentOptions,
            headers: { authorization: clusterpost.token }
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(body);
            }
        });
    });
}

var getDocumentAttachmentSave = function(id, name, filename){

    return new Promise(function(resolve, reject){
        var options = {
            url : getClusterPostServer() + "/dataprovider/" + id + "/" + name,
            method: "GET",
            agentOptions: clusterpost.agentOptions,
            headers: { authorization: clusterpost.token }
        }

        var write = fs.createWriteStream(filename);
        request(options).pipe(write);

        write.on('finish', function(err){
            if(err){
                reject(err);
            }else{
                resolve(filename);
            }
        });
    });
}

var getDownloadToken = function(id, name){

    return new Promise(function(resolve, reject){
        var options = {
            url : getClusterPostServer() + "/dataprovider/download/" + id + "/" + name,
            method: "GET",
            agentOptions: clusterpost.agentOptions,
            headers: { authorization: clusterpost.token }
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(JSON.parse(body));
            }
        });
    });
}

var downloadAttachment = function(token){

    return new Promise(function(resolve, reject){
        var options = {
            url : getClusterPostServer() + "/dataprovider/download/" + token,
            method: "GET",
            agentOptions: clusterpost.agentOptions
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(body);
            }
        });
    });
}

var uploadFile = function(jobid, filename){

	return new Promise(function(resolve, reject){

        try{
            var options = {
                url : getClusterPostServer() + "/dataprovider/" + jobid + "/" + path.basename(filename),
                method: "PUT",
                agentOptions: clusterpost.agentOptions,
                headers: { 
                    authorization: clusterpost.token,
                    "Content-Type": "application/octet-stream"
                }
            }

            var stream = fs.createReadStream(filename);

            stream.pipe(request(options, function(err, res, body){
                    if(err){
                        reject(err);
                    }else{
                        resolve(JSON.parse(body));
                    }
                })
            );
        }catch(e){
            reject(e);
        }

	});
}

var uploadFiles = function(jobid, filenames){
    return Promise.map(filenames, function(filename){
        return uploadFile(jobid, filename);
    }, {concurrency: 1})
    .then(function(allupload){
        return allupload;
    });
}

var executeJob = function(jobid, force){
    return new Promise(function(resolve, reject){
        try{
            var options = {
                url : getClusterPostServer() + "/executionserver/" + jobid,
                json: {
                    force: force
                },
                method: "POST",
                agentOptions: clusterpost.agentOptions,
                headers: { authorization: clusterpost.token }
            }

            request(options, function(err, res, body){
                if(err){
                    reject(err);
                }else{
                    resolve(body);
                }
            });
        }catch(e){
            reject(e);
        }
    });
}

var updateJobStatus = function(jobid){
    return new Promise(function(resolve, reject){
        try{
            var options = {
                url : getClusterPostServer() + "/executionserver/" + jobid,
                method: "GET",
                agentOptions: clusterpost.agentOptions,
                headers: { authorization: clusterpost.token }
            }

            request(options, function(err, res, body){
                if(err){
                    reject(err);
                }else{
                    resolve(JSON.parse(body));
                }
            });
        }catch(e){
            reject(e);
        }
    });
}

var killJob = function(jobid){
    return new Promise(function(resolve, reject){
        var options = {
            url : getClusterPostServer() + "/executionserver/" + jobid,
            method: "DELETE",
            agentOptions: clusterpost.agentOptions,
            headers: { authorization: clusterpost.token }
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(JSON.parse(body));
            }
        });
    });
}

var deleteJob = function(jobid){
    return new Promise(function(resolve, reject){
        var options = {
            url : getClusterPostServer() + "/dataprovider/" + jobid,
            method: "DELETE",
            agentOptions: clusterpost.agentOptions,
            headers: { authorization: clusterpost.token }
        }

        request(options, function(err, res, body){
            if(err){
                reject(err);
            }else{
                resolve(JSON.parse(body));
            }
        });
    });
}

var checkFiles = function(files){
    return Promise.map(files, function(filename){
        var stat = fs.statSync(filename);
        if(stat){
            return true;
        }
    });
}

var createAndSubmitJob = function(job, files){
    var jobid;

    return checkFiles(files)
    .then(function(){
        return createDocument(job);
    })
    .then(function(res){
        jobid = res.id;
        return uploadFiles(jobid, files);
    })
    .then(function(res){
        return executeJob(jobid);
    })
    .then(function(res){
        return jobid;
    });
}

var mkdirp = function(outputdir){
    var allpatharray = outputdir.split(path.sep);
    var currentpath = '';
    _.each(allpatharray, function(p){
        currentpath = path.join(currentpath, p);
        try{
            fs.statSync(currentpath);
        }catch(e){
            try{
                fs.mkdirSync(currentpath);
            }catch(e){
                console.error(e);
                throw e;
            }
        }
    });
}

var getJobOutputs = function(job, outputdir){
    
    var outputs = job.outputs;
    
    return Promise.map(outputs, function(output){
        var name = output.name;
        if(output.type === "tar.gz" && name === "./"){
            name = job._id + ".tar.gz";
        }
        if(outputdir){
            
            mkdirp(outputdir);
            
            var filename = path.join(outputdir, name);
            return getDocumentAttachmentSave(job._id, name, filename);
        }else{
            return getDocumentAttachment(job._id, name);
        }
    });
}


exports.setClusterPostServer = setClusterPostServer;
exports.getClusterPostServer = getClusterPostServer;
exports.setAgentOptions = setAgentOptions;
exports.createUser  =   createUser;
exports.userLogin   =   userLogin;
exports.getUserToken = getUserToken
exports.setUserToken = setUserToken
exports.getUser =   getUser;
exports.getUsers    =   getUsers;
exports.updateUser  =   updateUser;
exports.deleteUser  =   deleteUser;
exports.deleteUsers  =   deleteUsers;
exports.getExecutionServers =   getExecutionServers;
exports.createDocument  =   createDocument;
exports.getDocument =   getDocument;
exports.getDocumentAttachment   =   getDocumentAttachment;
exports.getJobs = getJobs;
exports.getJobOutputs = getJobOutputs;
exports.getDownloadToken    =   getDownloadToken;
exports.downloadAttachment  =   downloadAttachment;
exports.uploadFile  =   uploadFile;
exports.uploadFiles =   uploadFiles;
exports.executeJob  =   executeJob;
exports.updateJobStatus =   updateJobStatus;
exports.killJob =   killJob;
exports.deleteJob   =   deleteJob;
exports.createAndSubmitJob  =   createAndSubmitJob;