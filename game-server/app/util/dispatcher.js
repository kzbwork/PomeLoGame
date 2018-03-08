var crc = require('crc');

module.exports.dispatch = function(uid, connectors) {
	var index = Math.abs(crc.crc32(uid)) % connectors.length;
	return connectors[index];
};

module.exports.getoneserver = function (uid, connectors){
    return connectors[0];
}