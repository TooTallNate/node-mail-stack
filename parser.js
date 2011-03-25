var Stream = require('stream').Stream;
var StreamStack = require('stream-stack').StreamStack;
var HeaderParser = require('header-stack').Parser;
var inherits = require('util').inherits;


/**
 * The main mail Parser accepts a ReadableStream that emits
 * MIME-compliant email, as in the SMTP protocol. Meh, this is really
 * only a simple wrapper around the header parser.
 */
function Parser(stream) {
  StreamStack.call(this, stream, {
    data: function onData(chunk) {
      this._onData(chunk);
    }
  });
  this._onData = this._parseHeaders;
  this._headerParser = new HeaderParser(new Stream(), {
    allowFoldedHeaders: true
  });
  this._headerParser.once('headers', this._onHeaders.bind(this));
}
inherits(Parser, StreamStack);
module.exports = Parser;


// After the headers have been parsed, this is the 'data' event function
Parser.prototype._proxyData = function onData(chunk) {
  this.emit('data', chunk);
}

// Initially, the parser is in the header-parsing phase. This is the
// initial 'data' event handler
Parser.prototype._parseHeaders = function parseHeaders(chunk) {
  this._headerParser.stream.emit('data', chunk);
}

// Parse the _headers Buffer into an Array, then emit a 'headers' event
Parser.prototype._onHeaders = function onHeaders(headers, leftover) {

  // For the GC
  delete this._headerParser;

  // Now that we're done parsing the header, any additional 'data' events
  // from the parent stream will be part of the message body, and should
  // be regularly emitted from the Parser.
  this._onData = this._proxyData;

  // Fire a 'headers' event so that the user can inspect them before
  // any 'data' events from the message body are fired.
  this.emit('headers', headers);

  if (leftover) {
    this._onData(leftover);
  }
}
