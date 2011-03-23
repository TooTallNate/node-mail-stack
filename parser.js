require('bufferjs');
var StreamStack = require('stream-stack').StreamStack;
var inherits = require('util').inherits;

var LF = '\n';
var CR = '\r';
var CRLF = CR+LF;
// A Buffer since we use it with `Buffer#indexOf`
var DOUBLE_CRLF = new Buffer(CRLF+CRLF);


/**
 * The main mail Parser accepts a ReadableStream that emits
 * MIME-compliant email, as in the SMTP protocol.
 */
function Parser(stream) {
  StreamStack.call(this, stream, {
    data: function onData(chunk) {
      this._onData(chunk);
    }
  });
  this._onData = this._parseHeaders;
  this._headers = new Buffer(0);
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
  this._headers = Buffer.concat(this._headers, chunk);
  var index = this._headers.indexOf(DOUBLE_CRLF);
  if (index > 0) {
    var leftover = this._headers.slice(index + DOUBLE_CRLF.length);
    this._headers = this._headers.slice(0, index);
    this._onHeadersComplete();
    if (leftover.length > 0) {
      this._onData(leftover);
    }
  }
}

// Parse the _headers Buffer into an Array, then emit a 'headers' event
Parser.prototype._onHeadersComplete = function onHeadersComplete() {

  // The headers are formatted into an Array, since
  // duplicate header keys are possible
  var headers = [];

  var lines = this._headers.toString().split(CRLF);
  for (var i=0, l=lines.length; i<l; i++) {
    var line = lines[i];
    var firstColon = line.indexOf(':');
    var name = line.substring(0, firstColon);
    var value = line.substring(firstColon+(line[firstColon+1] == ' ' ? 2 : 1));
    // Each line is pushed to the 'headers' Array, so that the user
    // can determine the order the headers were sent, and retreive values
    // for duplicate header keys
    headers.push(line);
    // For convenience, the header name is also attached as a key to
    // the Array, as well as a lower-case version. For duplicates, only
    // the last occurence will be the value.
    headers[name] = headers[name.toLowerCase()] = value;
  }
  
  // Now that we're done parsing the header, any additional 'data' events
  // from the parent stream will be part of the message body, and should
  // be regularly emitted from the Parser.
  this._onData = this._proxyData;

  // Fire a 'headers' event so that the user can inspect them before
  // any 'data' events from the message body are fired.
  this.emit('headers', headers, this._headers);
}
