#!/usr/bin/env node

var smtp = require('smtp')
  , mail = require('../');

// Works with `smtp@0.1.5`
var server = smtp.createServer(function(conn) {
  conn.on('DATA', function(message) {
    message.accepted = true;

    var mailParser = new mail.Parser(message);
    mailParser.on('headers', function(headers) {
      // 'headers' is an Array, with 'key' and 'value' properties
      // for each entry. Duplicate values are handled fine.
      // Header names are also attached directly to the 'headers'
      // object for programmatic convenience:   headers.From  -> 'sender@example.com'
      console.log(headers);

      // Any 'data' events from the parser are part of the message body.
      mailParser.pipe(process.stdout, {end:false});
    });
  });
});
server.listen(25);
