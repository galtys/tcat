var forge = require('node-forge');

function calc_sha1(msg) {
   var md1 = forge.md.sha1.create();
   md1.update(msg);
   return md1.digest().toHex();
}

function calc_sha256(msg) {
   var md1 = forge.md.sha256.create();
   md1.update(msg);
   return md1.digest().toHex();
}
