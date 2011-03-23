var fs = require('fs');
var Parser = require('../parser');

var stream = fs.createReadStream(__dirname + '/dumps/multipart-folded-headers.eml');
var parser = new Parser(stream);
parser.on('headers', function(headers) {
  console.log(headers.length);
  console.log(headers);
});
parser.on('data', function(chunk) {
  console.log("got 'data' event:");
  console.log(chunk);
});
parser.on('end', function() {
  console.log("got 'end' event");
});
