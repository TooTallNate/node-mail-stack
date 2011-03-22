node-mail-stack
===============
### A `StreamStack` subclass that parses raw e-mail messages.


This module implements [RFC 5322][rfc5322]. Specifically, it parses the
e-mail headers into an Object and fires a "headers" events. Then the
body of the message is emitted as 'data' events, and can be `.pipe()`ed
into other node `WritableStream` instances.


Usage
-----

See `examples/smtp-server.js` for an example of a SMTP server.

[Node]: http://nodejs.org
[rfc5322]: http://tools.ietf.org/html/rfc5322
