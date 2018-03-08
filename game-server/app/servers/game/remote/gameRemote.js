let co = require("co");

module.exports = function(app) {
    return new gameRemote(app);
};

let gameRemote = function(app) {
    this.app = app;
};

let pro = gameRemote.prototype;
let config = require("../../../config/game.json");


pro.spain = function (uid, linesnum, linevalue, cb) {
    console.log(`uid = ${uid},linesnum = ${linevalue},linevalue`);
}