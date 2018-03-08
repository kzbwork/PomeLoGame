'use strict'

let pomelo = require("pomelo").app;
let co = require("co");
let gameremote = require("./game/gameRemote.js");

module.exports = function(app) {
    return new Handler(app);
};

let Handler = function(app) {
    this.app = app;
};

let act = Handler.prototype;

/**
 * 请求滚动函数
 **/

act.spain = function (msg, session, next) {
    let linesnum = msg.linesnum;
    let linevalue = msg.linevalue;

    if (linesnum == undefined || linevalue == undefined)
    {
        console.log("param is null");
        next(null,{
            code: pomelo.CODE.SPAIN_FAILD
        })
        return;
    }

    let uid = session.uid;

    if (uid == undefined)
    {
        console.log("login is not exist");
        next(null,{
            code:pomelo.CODE.LOGIN_NOT_EXIST
        })
        return;
    }

    co(function*(){
        let result = gameremote.spain(uid,linesnum,linevalue);
    }).catch(function (err) {
        console.log(err.showStack);
        next(null, {code: pomelo.CODE.GAME_EROOR});
    });

}