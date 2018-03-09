'use strict'

let pomelo = require("pomelo").app;
let co = require("co");
let gameremote = require("../../game/remote/gameRemote.js");

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

    co(function*(){.
        app.rpc.game.gameRemote.spainspin(session,uid,linesnum,linevalue
        let result = gameremote.spain();
        next(null,result);
    }).catch(function (err) {
        console.log(err.stack);
        next(null, {code: pomelo.CODE.GAME_EROOR});
    });
}