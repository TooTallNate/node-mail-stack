node-mail-stack
===============
### A `StreamStack` subclass that parses raw e-mail messages.


This module implements [RFC 5322][rfc5322]. Specifically, it parses the
e-mail headers into an Object and fires a "headers" events. Then the
body of the message is emitted as 'data' events, and can be `.pipe()`ed
into other [node][Node] `WritableStream` instances.


Usage
-----

``` javascript
var smtp = require('smtp')
var mail = require('mail-stack');

smtp.createServer(function(conn) {
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
```

See the `examples/` directory for some more usage examples.


[Node]: http://nodejs.org
[rfc5322]: http://tools.ietf.org/html/rfc5322
