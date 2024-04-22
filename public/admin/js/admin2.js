import { u as utils } from "./utils.js";
const PACKET_TYPES = /* @__PURE__ */ Object.create(null);
PACKET_TYPES["open"] = "0";
PACKET_TYPES["close"] = "1";
PACKET_TYPES["ping"] = "2";
PACKET_TYPES["pong"] = "3";
PACKET_TYPES["message"] = "4";
PACKET_TYPES["upgrade"] = "5";
PACKET_TYPES["noop"] = "6";
const PACKET_TYPES_REVERSE = /* @__PURE__ */ Object.create(null);
Object.keys(PACKET_TYPES).forEach((key) => {
  PACKET_TYPES_REVERSE[PACKET_TYPES[key]] = key;
});
const ERROR_PACKET = { type: "error", data: "parser error" };
const withNativeBlob$1 = typeof Blob === "function" || typeof Blob !== "undefined" && Object.prototype.toString.call(Blob) === "[object BlobConstructor]";
const withNativeArrayBuffer$2 = typeof ArrayBuffer === "function";
const isView$1 = (obj) => {
  return typeof ArrayBuffer.isView === "function" ? ArrayBuffer.isView(obj) : obj && obj.buffer instanceof ArrayBuffer;
};
const encodePacket = ({ type, data }, supportsBinary, callback) => {
  if (withNativeBlob$1 && data instanceof Blob) {
    if (supportsBinary) {
      return callback(data);
    } else {
      return encodeBlobAsBase64(data, callback);
    }
  } else if (withNativeArrayBuffer$2 && (data instanceof ArrayBuffer || isView$1(data))) {
    if (supportsBinary) {
      return callback(data);
    } else {
      return encodeBlobAsBase64(new Blob([data]), callback);
    }
  }
  return callback(PACKET_TYPES[type] + (data || ""));
};
const encodeBlobAsBase64 = (data, callback) => {
  const fileReader = new FileReader();
  fileReader.onload = function() {
    const content = fileReader.result.split(",")[1];
    callback("b" + (content || ""));
  };
  return fileReader.readAsDataURL(data);
};
function toArray(data) {
  if (data instanceof Uint8Array) {
    return data;
  } else if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  } else {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  }
}
let TEXT_ENCODER;
function encodePacketToBinary(packet, callback) {
  if (withNativeBlob$1 && packet.data instanceof Blob) {
    return packet.data.arrayBuffer().then(toArray).then(callback);
  } else if (withNativeArrayBuffer$2 && (packet.data instanceof ArrayBuffer || isView$1(packet.data))) {
    return callback(toArray(packet.data));
  }
  encodePacket(packet, false, (encoded) => {
    if (!TEXT_ENCODER) {
      TEXT_ENCODER = new TextEncoder();
    }
    callback(TEXT_ENCODER.encode(encoded));
  });
}
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const lookup$1 = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
for (let i2 = 0; i2 < chars.length; i2++) {
  lookup$1[chars.charCodeAt(i2)] = i2;
}
const decode$1 = (base64) => {
  let bufferLength = base64.length * 0.75, len = base64.length, i2, p = 0, encoded1, encoded2, encoded3, encoded4;
  if (base64[base64.length - 1] === "=") {
    bufferLength--;
    if (base64[base64.length - 2] === "=") {
      bufferLength--;
    }
  }
  const arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
  for (i2 = 0; i2 < len; i2 += 4) {
    encoded1 = lookup$1[base64.charCodeAt(i2)];
    encoded2 = lookup$1[base64.charCodeAt(i2 + 1)];
    encoded3 = lookup$1[base64.charCodeAt(i2 + 2)];
    encoded4 = lookup$1[base64.charCodeAt(i2 + 3)];
    bytes[p++] = encoded1 << 2 | encoded2 >> 4;
    bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
    bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
  }
  return arraybuffer;
};
const withNativeArrayBuffer$1 = typeof ArrayBuffer === "function";
const decodePacket = (encodedPacket, binaryType) => {
  if (typeof encodedPacket !== "string") {
    return {
      type: "message",
      data: mapBinary(encodedPacket, binaryType)
    };
  }
  const type = encodedPacket.charAt(0);
  if (type === "b") {
    return {
      type: "message",
      data: decodeBase64Packet(encodedPacket.substring(1), binaryType)
    };
  }
  const packetType = PACKET_TYPES_REVERSE[type];
  if (!packetType) {
    return ERROR_PACKET;
  }
  return encodedPacket.length > 1 ? {
    type: PACKET_TYPES_REVERSE[type],
    data: encodedPacket.substring(1)
  } : {
    type: PACKET_TYPES_REVERSE[type]
  };
};
const decodeBase64Packet = (data, binaryType) => {
  if (withNativeArrayBuffer$1) {
    const decoded = decode$1(data);
    return mapBinary(decoded, binaryType);
  } else {
    return { base64: true, data };
  }
};
const mapBinary = (data, binaryType) => {
  switch (binaryType) {
    case "blob":
      if (data instanceof Blob) {
        return data;
      } else {
        return new Blob([data]);
      }
    case "arraybuffer":
    default:
      if (data instanceof ArrayBuffer) {
        return data;
      } else {
        return data.buffer;
      }
  }
};
const SEPARATOR = String.fromCharCode(30);
const encodePayload = (packets, callback) => {
  const length2 = packets.length;
  const encodedPackets = new Array(length2);
  let count = 0;
  packets.forEach((packet, i2) => {
    encodePacket(packet, false, (encodedPacket) => {
      encodedPackets[i2] = encodedPacket;
      if (++count === length2) {
        callback(encodedPackets.join(SEPARATOR));
      }
    });
  });
};
const decodePayload = (encodedPayload, binaryType) => {
  const encodedPackets = encodedPayload.split(SEPARATOR);
  const packets = [];
  for (let i2 = 0; i2 < encodedPackets.length; i2++) {
    const decodedPacket = decodePacket(encodedPackets[i2], binaryType);
    packets.push(decodedPacket);
    if (decodedPacket.type === "error") {
      break;
    }
  }
  return packets;
};
function createPacketEncoderStream() {
  return new TransformStream({
    transform(packet, controller) {
      encodePacketToBinary(packet, (encodedPacket) => {
        const payloadLength = encodedPacket.length;
        let header;
        if (payloadLength < 126) {
          header = new Uint8Array(1);
          new DataView(header.buffer).setUint8(0, payloadLength);
        } else if (payloadLength < 65536) {
          header = new Uint8Array(3);
          const view = new DataView(header.buffer);
          view.setUint8(0, 126);
          view.setUint16(1, payloadLength);
        } else {
          header = new Uint8Array(9);
          const view = new DataView(header.buffer);
          view.setUint8(0, 127);
          view.setBigUint64(1, BigInt(payloadLength));
        }
        if (packet.data && typeof packet.data !== "string") {
          header[0] |= 128;
        }
        controller.enqueue(header);
        controller.enqueue(encodedPacket);
      });
    }
  });
}
let TEXT_DECODER;
function totalLength(chunks) {
  return chunks.reduce((acc, chunk) => acc + chunk.length, 0);
}
function concatChunks(chunks, size) {
  if (chunks[0].length === size) {
    return chunks.shift();
  }
  const buffer = new Uint8Array(size);
  let j = 0;
  for (let i2 = 0; i2 < size; i2++) {
    buffer[i2] = chunks[0][j++];
    if (j === chunks[0].length) {
      chunks.shift();
      j = 0;
    }
  }
  if (chunks.length && j < chunks[0].length) {
    chunks[0] = chunks[0].slice(j);
  }
  return buffer;
}
function createPacketDecoderStream(maxPayload, binaryType) {
  if (!TEXT_DECODER) {
    TEXT_DECODER = new TextDecoder();
  }
  const chunks = [];
  let state = 0;
  let expectedLength = -1;
  let isBinary2 = false;
  return new TransformStream({
    transform(chunk, controller) {
      chunks.push(chunk);
      while (true) {
        if (state === 0) {
          if (totalLength(chunks) < 1) {
            break;
          }
          const header = concatChunks(chunks, 1);
          isBinary2 = (header[0] & 128) === 128;
          expectedLength = header[0] & 127;
          if (expectedLength < 126) {
            state = 3;
          } else if (expectedLength === 126) {
            state = 1;
          } else {
            state = 2;
          }
        } else if (state === 1) {
          if (totalLength(chunks) < 2) {
            break;
          }
          const headerArray = concatChunks(chunks, 2);
          expectedLength = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length).getUint16(0);
          state = 3;
        } else if (state === 2) {
          if (totalLength(chunks) < 8) {
            break;
          }
          const headerArray = concatChunks(chunks, 8);
          const view = new DataView(headerArray.buffer, headerArray.byteOffset, headerArray.length);
          const n = view.getUint32(0);
          if (n > Math.pow(2, 53 - 32) - 1) {
            controller.enqueue(ERROR_PACKET);
            break;
          }
          expectedLength = n * Math.pow(2, 32) + view.getUint32(4);
          state = 3;
        } else {
          if (totalLength(chunks) < expectedLength) {
            break;
          }
          const data = concatChunks(chunks, expectedLength);
          controller.enqueue(decodePacket(isBinary2 ? data : TEXT_DECODER.decode(data), binaryType));
          state = 0;
        }
        if (expectedLength === 0 || expectedLength > maxPayload) {
          controller.enqueue(ERROR_PACKET);
          break;
        }
      }
    }
  });
}
const protocol$1 = 4;
function Emitter(obj) {
  if (obj)
    return mixin(obj);
}
function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}
Emitter.prototype.on = Emitter.prototype.addEventListener = function(event, fn) {
  this._callbacks = this._callbacks || {};
  (this._callbacks["$" + event] = this._callbacks["$" + event] || []).push(fn);
  return this;
};
Emitter.prototype.once = function(event, fn) {
  function on2() {
    this.off(event, on2);
    fn.apply(this, arguments);
  }
  on2.fn = fn;
  this.on(event, on2);
  return this;
};
Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event, fn) {
  this._callbacks = this._callbacks || {};
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }
  var callbacks = this._callbacks["$" + event];
  if (!callbacks)
    return this;
  if (1 == arguments.length) {
    delete this._callbacks["$" + event];
    return this;
  }
  var cb;
  for (var i2 = 0; i2 < callbacks.length; i2++) {
    cb = callbacks[i2];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i2, 1);
      break;
    }
  }
  if (callbacks.length === 0) {
    delete this._callbacks["$" + event];
  }
  return this;
};
Emitter.prototype.emit = function(event) {
  this._callbacks = this._callbacks || {};
  var args = new Array(arguments.length - 1), callbacks = this._callbacks["$" + event];
  for (var i2 = 1; i2 < arguments.length; i2++) {
    args[i2 - 1] = arguments[i2];
  }
  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i2 = 0, len = callbacks.length; i2 < len; ++i2) {
      callbacks[i2].apply(this, args);
    }
  }
  return this;
};
Emitter.prototype.emitReserved = Emitter.prototype.emit;
Emitter.prototype.listeners = function(event) {
  this._callbacks = this._callbacks || {};
  return this._callbacks["$" + event] || [];
};
Emitter.prototype.hasListeners = function(event) {
  return !!this.listeners(event).length;
};
const globalThisShim = (() => {
  if (typeof self !== "undefined") {
    return self;
  } else if (typeof window !== "undefined") {
    return window;
  } else {
    return Function("return this")();
  }
})();
function pick(obj, ...attr) {
  return attr.reduce((acc, k) => {
    if (obj.hasOwnProperty(k)) {
      acc[k] = obj[k];
    }
    return acc;
  }, {});
}
const NATIVE_SET_TIMEOUT = globalThisShim.setTimeout;
const NATIVE_CLEAR_TIMEOUT = globalThisShim.clearTimeout;
function installTimerFunctions(obj, opts) {
  if (opts.useNativeTimers) {
    obj.setTimeoutFn = NATIVE_SET_TIMEOUT.bind(globalThisShim);
    obj.clearTimeoutFn = NATIVE_CLEAR_TIMEOUT.bind(globalThisShim);
  } else {
    obj.setTimeoutFn = globalThisShim.setTimeout.bind(globalThisShim);
    obj.clearTimeoutFn = globalThisShim.clearTimeout.bind(globalThisShim);
  }
}
const BASE64_OVERHEAD = 1.33;
function byteLength(obj) {
  if (typeof obj === "string") {
    return utf8Length(obj);
  }
  return Math.ceil((obj.byteLength || obj.size) * BASE64_OVERHEAD);
}
function utf8Length(str) {
  let c = 0, length2 = 0;
  for (let i2 = 0, l = str.length; i2 < l; i2++) {
    c = str.charCodeAt(i2);
    if (c < 128) {
      length2 += 1;
    } else if (c < 2048) {
      length2 += 2;
    } else if (c < 55296 || c >= 57344) {
      length2 += 3;
    } else {
      i2++;
      length2 += 4;
    }
  }
  return length2;
}
function encode$1(obj) {
  let str = "";
  for (let i2 in obj) {
    if (obj.hasOwnProperty(i2)) {
      if (str.length)
        str += "&";
      str += encodeURIComponent(i2) + "=" + encodeURIComponent(obj[i2]);
    }
  }
  return str;
}
function decode(qs) {
  let qry = {};
  let pairs = qs.split("&");
  for (let i2 = 0, l = pairs.length; i2 < l; i2++) {
    let pair = pairs[i2].split("=");
    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return qry;
}
class TransportError extends Error {
  constructor(reason, description, context) {
    super(reason);
    this.description = description;
    this.context = context;
    this.type = "TransportError";
  }
}
class Transport extends Emitter {
  /**
   * Transport abstract constructor.
   *
   * @param {Object} opts - options
   * @protected
   */
  constructor(opts) {
    super();
    this.writable = false;
    installTimerFunctions(this, opts);
    this.opts = opts;
    this.query = opts.query;
    this.socket = opts.socket;
  }
  /**
   * Emits an error.
   *
   * @param {String} reason
   * @param description
   * @param context - the error context
   * @return {Transport} for chaining
   * @protected
   */
  onError(reason, description, context) {
    super.emitReserved("error", new TransportError(reason, description, context));
    return this;
  }
  /**
   * Opens the transport.
   */
  open() {
    this.readyState = "opening";
    this.doOpen();
    return this;
  }
  /**
   * Closes the transport.
   */
  close() {
    if (this.readyState === "opening" || this.readyState === "open") {
      this.doClose();
      this.onClose();
    }
    return this;
  }
  /**
   * Sends multiple packets.
   *
   * @param {Array} packets
   */
  send(packets) {
    if (this.readyState === "open") {
      this.write(packets);
    }
  }
  /**
   * Called upon open
   *
   * @protected
   */
  onOpen() {
    this.readyState = "open";
    this.writable = true;
    super.emitReserved("open");
  }
  /**
   * Called with data.
   *
   * @param {String} data
   * @protected
   */
  onData(data) {
    const packet = decodePacket(data, this.socket.binaryType);
    this.onPacket(packet);
  }
  /**
   * Called with a decoded packet.
   *
   * @protected
   */
  onPacket(packet) {
    super.emitReserved("packet", packet);
  }
  /**
   * Called upon close.
   *
   * @protected
   */
  onClose(details) {
    this.readyState = "closed";
    super.emitReserved("close", details);
  }
  /**
   * Pauses the transport, in order not to lose packets during an upgrade.
   *
   * @param onPause
   */
  pause(onPause) {
  }
  createUri(schema, query = {}) {
    return schema + "://" + this._hostname() + this._port() + this.opts.path + this._query(query);
  }
  _hostname() {
    const hostname = this.opts.hostname;
    return hostname.indexOf(":") === -1 ? hostname : "[" + hostname + "]";
  }
  _port() {
    if (this.opts.port && (this.opts.secure && Number(this.opts.port !== 443) || !this.opts.secure && Number(this.opts.port) !== 80)) {
      return ":" + this.opts.port;
    } else {
      return "";
    }
  }
  _query(query) {
    const encodedQuery = encode$1(query);
    return encodedQuery.length ? "?" + encodedQuery : "";
  }
}
const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_".split(""), length = 64, map = {};
let seed = 0, i = 0, prev;
function encode(num) {
  let encoded = "";
  do {
    encoded = alphabet[num % length] + encoded;
    num = Math.floor(num / length);
  } while (num > 0);
  return encoded;
}
function yeast() {
  const now = encode(+/* @__PURE__ */ new Date());
  if (now !== prev)
    return seed = 0, prev = now;
  return now + "." + encode(seed++);
}
for (; i < length; i++)
  map[alphabet[i]] = i;
let value = false;
try {
  value = typeof XMLHttpRequest !== "undefined" && "withCredentials" in new XMLHttpRequest();
} catch (err) {
}
const hasCORS = value;
function XHR(opts) {
  const xdomain = opts.xdomain;
  try {
    if ("undefined" !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
      return new XMLHttpRequest();
    }
  } catch (e) {
  }
  if (!xdomain) {
    try {
      return new globalThisShim[["Active"].concat("Object").join("X")]("Microsoft.XMLHTTP");
    } catch (e) {
    }
  }
}
function createCookieJar() {
}
function empty() {
}
const hasXHR2 = function() {
  const xhr = new XHR({
    xdomain: false
  });
  return null != xhr.responseType;
}();
class Polling extends Transport {
  /**
   * XHR Polling constructor.
   *
   * @param {Object} opts
   * @package
   */
  constructor(opts) {
    super(opts);
    this.polling = false;
    if (typeof location !== "undefined") {
      const isSSL = "https:" === location.protocol;
      let port = location.port;
      if (!port) {
        port = isSSL ? "443" : "80";
      }
      this.xd = typeof location !== "undefined" && opts.hostname !== location.hostname || port !== opts.port;
    }
    const forceBase64 = opts && opts.forceBase64;
    this.supportsBinary = hasXHR2 && !forceBase64;
    if (this.opts.withCredentials) {
      this.cookieJar = createCookieJar();
    }
  }
  get name() {
    return "polling";
  }
  /**
   * Opens the socket (triggers polling). We write a PING message to determine
   * when the transport is open.
   *
   * @protected
   */
  doOpen() {
    this.poll();
  }
  /**
   * Pauses polling.
   *
   * @param {Function} onPause - callback upon buffers are flushed and transport is paused
   * @package
   */
  pause(onPause) {
    this.readyState = "pausing";
    const pause = () => {
      this.readyState = "paused";
      onPause();
    };
    if (this.polling || !this.writable) {
      let total = 0;
      if (this.polling) {
        total++;
        this.once("pollComplete", function() {
          --total || pause();
        });
      }
      if (!this.writable) {
        total++;
        this.once("drain", function() {
          --total || pause();
        });
      }
    } else {
      pause();
    }
  }
  /**
   * Starts polling cycle.
   *
   * @private
   */
  poll() {
    this.polling = true;
    this.doPoll();
    this.emitReserved("poll");
  }
  /**
   * Overloads onData to detect payloads.
   *
   * @protected
   */
  onData(data) {
    const callback = (packet) => {
      if ("opening" === this.readyState && packet.type === "open") {
        this.onOpen();
      }
      if ("close" === packet.type) {
        this.onClose({ description: "transport closed by the server" });
        return false;
      }
      this.onPacket(packet);
    };
    decodePayload(data, this.socket.binaryType).forEach(callback);
    if ("closed" !== this.readyState) {
      this.polling = false;
      this.emitReserved("pollComplete");
      if ("open" === this.readyState) {
        this.poll();
      }
    }
  }
  /**
   * For polling, send a close packet.
   *
   * @protected
   */
  doClose() {
    const close = () => {
      this.write([{ type: "close" }]);
    };
    if ("open" === this.readyState) {
      close();
    } else {
      this.once("open", close);
    }
  }
  /**
   * Writes a packets payload.
   *
   * @param {Array} packets - data packets
   * @protected
   */
  write(packets) {
    this.writable = false;
    encodePayload(packets, (data) => {
      this.doWrite(data, () => {
        this.writable = true;
        this.emitReserved("drain");
      });
    });
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const schema = this.opts.secure ? "https" : "http";
    const query = this.query || {};
    if (false !== this.opts.timestampRequests) {
      query[this.opts.timestampParam] = yeast();
    }
    if (!this.supportsBinary && !query.sid) {
      query.b64 = 1;
    }
    return this.createUri(schema, query);
  }
  /**
   * Creates a request.
   *
   * @param {String} method
   * @private
   */
  request(opts = {}) {
    Object.assign(opts, { xd: this.xd, cookieJar: this.cookieJar }, this.opts);
    return new Request(this.uri(), opts);
  }
  /**
   * Sends data.
   *
   * @param {String} data to send.
   * @param {Function} called upon flush.
   * @private
   */
  doWrite(data, fn) {
    const req = this.request({
      method: "POST",
      data
    });
    req.on("success", fn);
    req.on("error", (xhrStatus, context) => {
      this.onError("xhr post error", xhrStatus, context);
    });
  }
  /**
   * Starts a poll cycle.
   *
   * @private
   */
  doPoll() {
    const req = this.request();
    req.on("data", this.onData.bind(this));
    req.on("error", (xhrStatus, context) => {
      this.onError("xhr poll error", xhrStatus, context);
    });
    this.pollXhr = req;
  }
}
class Request extends Emitter {
  /**
   * Request constructor
   *
   * @param {Object} options
   * @package
   */
  constructor(uri, opts) {
    super();
    installTimerFunctions(this, opts);
    this.opts = opts;
    this.method = opts.method || "GET";
    this.uri = uri;
    this.data = void 0 !== opts.data ? opts.data : null;
    this.create();
  }
  /**
   * Creates the XHR object and sends the request.
   *
   * @private
   */
  create() {
    var _a;
    const opts = pick(this.opts, "agent", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "autoUnref");
    opts.xdomain = !!this.opts.xd;
    const xhr = this.xhr = new XHR(opts);
    try {
      xhr.open(this.method, this.uri, true);
      try {
        if (this.opts.extraHeaders) {
          xhr.setDisableHeaderCheck && xhr.setDisableHeaderCheck(true);
          for (let i2 in this.opts.extraHeaders) {
            if (this.opts.extraHeaders.hasOwnProperty(i2)) {
              xhr.setRequestHeader(i2, this.opts.extraHeaders[i2]);
            }
          }
        }
      } catch (e) {
      }
      if ("POST" === this.method) {
        try {
          xhr.setRequestHeader("Content-type", "text/plain;charset=UTF-8");
        } catch (e) {
        }
      }
      try {
        xhr.setRequestHeader("Accept", "*/*");
      } catch (e) {
      }
      (_a = this.opts.cookieJar) === null || _a === void 0 ? void 0 : _a.addCookies(xhr);
      if ("withCredentials" in xhr) {
        xhr.withCredentials = this.opts.withCredentials;
      }
      if (this.opts.requestTimeout) {
        xhr.timeout = this.opts.requestTimeout;
      }
      xhr.onreadystatechange = () => {
        var _a2;
        if (xhr.readyState === 3) {
          (_a2 = this.opts.cookieJar) === null || _a2 === void 0 ? void 0 : _a2.parseCookies(xhr);
        }
        if (4 !== xhr.readyState)
          return;
        if (200 === xhr.status || 1223 === xhr.status) {
          this.onLoad();
        } else {
          this.setTimeoutFn(() => {
            this.onError(typeof xhr.status === "number" ? xhr.status : 0);
          }, 0);
        }
      };
      xhr.send(this.data);
    } catch (e) {
      this.setTimeoutFn(() => {
        this.onError(e);
      }, 0);
      return;
    }
    if (typeof document !== "undefined") {
      this.index = Request.requestsCount++;
      Request.requests[this.index] = this;
    }
  }
  /**
   * Called upon error.
   *
   * @private
   */
  onError(err) {
    this.emitReserved("error", err, this.xhr);
    this.cleanup(true);
  }
  /**
   * Cleans up house.
   *
   * @private
   */
  cleanup(fromError) {
    if ("undefined" === typeof this.xhr || null === this.xhr) {
      return;
    }
    this.xhr.onreadystatechange = empty;
    if (fromError) {
      try {
        this.xhr.abort();
      } catch (e) {
      }
    }
    if (typeof document !== "undefined") {
      delete Request.requests[this.index];
    }
    this.xhr = null;
  }
  /**
   * Called upon load.
   *
   * @private
   */
  onLoad() {
    const data = this.xhr.responseText;
    if (data !== null) {
      this.emitReserved("data", data);
      this.emitReserved("success");
      this.cleanup();
    }
  }
  /**
   * Aborts the request.
   *
   * @package
   */
  abort() {
    this.cleanup();
  }
}
Request.requestsCount = 0;
Request.requests = {};
if (typeof document !== "undefined") {
  if (typeof attachEvent === "function") {
    attachEvent("onunload", unloadHandler);
  } else if (typeof addEventListener === "function") {
    const terminationEvent = "onpagehide" in globalThisShim ? "pagehide" : "unload";
    addEventListener(terminationEvent, unloadHandler, false);
  }
}
function unloadHandler() {
  for (let i2 in Request.requests) {
    if (Request.requests.hasOwnProperty(i2)) {
      Request.requests[i2].abort();
    }
  }
}
const nextTick = (() => {
  const isPromiseAvailable = typeof Promise === "function" && typeof Promise.resolve === "function";
  if (isPromiseAvailable) {
    return (cb) => Promise.resolve().then(cb);
  } else {
    return (cb, setTimeoutFn) => setTimeoutFn(cb, 0);
  }
})();
const WebSocket = globalThisShim.WebSocket || globalThisShim.MozWebSocket;
const usingBrowserWebSocket = true;
const defaultBinaryType = "arraybuffer";
const isReactNative = typeof navigator !== "undefined" && typeof navigator.product === "string" && navigator.product.toLowerCase() === "reactnative";
class WS extends Transport {
  /**
   * WebSocket transport constructor.
   *
   * @param {Object} opts - connection options
   * @protected
   */
  constructor(opts) {
    super(opts);
    this.supportsBinary = !opts.forceBase64;
  }
  get name() {
    return "websocket";
  }
  doOpen() {
    if (!this.check()) {
      return;
    }
    const uri = this.uri();
    const protocols = this.opts.protocols;
    const opts = isReactNative ? {} : pick(this.opts, "agent", "perMessageDeflate", "pfx", "key", "passphrase", "cert", "ca", "ciphers", "rejectUnauthorized", "localAddress", "protocolVersion", "origin", "maxPayload", "family", "checkServerIdentity");
    if (this.opts.extraHeaders) {
      opts.headers = this.opts.extraHeaders;
    }
    try {
      this.ws = usingBrowserWebSocket && !isReactNative ? protocols ? new WebSocket(uri, protocols) : new WebSocket(uri) : new WebSocket(uri, protocols, opts);
    } catch (err) {
      return this.emitReserved("error", err);
    }
    this.ws.binaryType = this.socket.binaryType;
    this.addEventListeners();
  }
  /**
   * Adds event listeners to the socket
   *
   * @private
   */
  addEventListeners() {
    this.ws.onopen = () => {
      if (this.opts.autoUnref) {
        this.ws._socket.unref();
      }
      this.onOpen();
    };
    this.ws.onclose = (closeEvent) => this.onClose({
      description: "websocket connection closed",
      context: closeEvent
    });
    this.ws.onmessage = (ev) => this.onData(ev.data);
    this.ws.onerror = (e) => this.onError("websocket error", e);
  }
  write(packets) {
    this.writable = false;
    for (let i2 = 0; i2 < packets.length; i2++) {
      const packet = packets[i2];
      const lastPacket = i2 === packets.length - 1;
      encodePacket(packet, this.supportsBinary, (data) => {
        const opts = {};
        try {
          if (usingBrowserWebSocket) {
            this.ws.send(data);
          }
        } catch (e) {
        }
        if (lastPacket) {
          nextTick(() => {
            this.writable = true;
            this.emitReserved("drain");
          }, this.setTimeoutFn);
        }
      });
    }
  }
  doClose() {
    if (typeof this.ws !== "undefined") {
      this.ws.close();
      this.ws = null;
    }
  }
  /**
   * Generates uri for connection.
   *
   * @private
   */
  uri() {
    const schema = this.opts.secure ? "wss" : "ws";
    const query = this.query || {};
    if (this.opts.timestampRequests) {
      query[this.opts.timestampParam] = yeast();
    }
    if (!this.supportsBinary) {
      query.b64 = 1;
    }
    return this.createUri(schema, query);
  }
  /**
   * Feature detection for WebSocket.
   *
   * @return {Boolean} whether this transport is available.
   * @private
   */
  check() {
    return !!WebSocket;
  }
}
class WT extends Transport {
  get name() {
    return "webtransport";
  }
  doOpen() {
    if (typeof WebTransport !== "function") {
      return;
    }
    this.transport = new WebTransport(this.createUri("https"), this.opts.transportOptions[this.name]);
    this.transport.closed.then(() => {
      this.onClose();
    }).catch((err) => {
      this.onError("webtransport error", err);
    });
    this.transport.ready.then(() => {
      this.transport.createBidirectionalStream().then((stream) => {
        const decoderStream = createPacketDecoderStream(Number.MAX_SAFE_INTEGER, this.socket.binaryType);
        const reader = stream.readable.pipeThrough(decoderStream).getReader();
        const encoderStream = createPacketEncoderStream();
        encoderStream.readable.pipeTo(stream.writable);
        this.writer = encoderStream.writable.getWriter();
        const read = () => {
          reader.read().then(({ done, value: value2 }) => {
            if (done) {
              return;
            }
            this.onPacket(value2);
            read();
          }).catch((err) => {
          });
        };
        read();
        const packet = { type: "open" };
        if (this.query.sid) {
          packet.data = `{"sid":"${this.query.sid}"}`;
        }
        this.writer.write(packet).then(() => this.onOpen());
      });
    });
  }
  write(packets) {
    this.writable = false;
    for (let i2 = 0; i2 < packets.length; i2++) {
      const packet = packets[i2];
      const lastPacket = i2 === packets.length - 1;
      this.writer.write(packet).then(() => {
        if (lastPacket) {
          nextTick(() => {
            this.writable = true;
            this.emitReserved("drain");
          }, this.setTimeoutFn);
        }
      });
    }
  }
  doClose() {
    var _a;
    (_a = this.transport) === null || _a === void 0 ? void 0 : _a.close();
  }
}
const transports = {
  websocket: WS,
  webtransport: WT,
  polling: Polling
};
const re = /^(?:(?![^:@\/?#]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@\/?#]*)(?::([^:@\/?#]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
const parts = [
  "source",
  "protocol",
  "authority",
  "userInfo",
  "user",
  "password",
  "host",
  "port",
  "relative",
  "path",
  "directory",
  "file",
  "query",
  "anchor"
];
function parse(str) {
  if (str.length > 2e3) {
    throw "URI too long";
  }
  const src = str, b = str.indexOf("["), e = str.indexOf("]");
  if (b != -1 && e != -1) {
    str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ";") + str.substring(e, str.length);
  }
  let m = re.exec(str || ""), uri = {}, i2 = 14;
  while (i2--) {
    uri[parts[i2]] = m[i2] || "";
  }
  if (b != -1 && e != -1) {
    uri.source = src;
    uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ":");
    uri.authority = uri.authority.replace("[", "").replace("]", "").replace(/;/g, ":");
    uri.ipv6uri = true;
  }
  uri.pathNames = pathNames(uri, uri["path"]);
  uri.queryKey = queryKey(uri, uri["query"]);
  return uri;
}
function pathNames(obj, path) {
  const regx = /\/{2,9}/g, names = path.replace(regx, "/").split("/");
  if (path.slice(0, 1) == "/" || path.length === 0) {
    names.splice(0, 1);
  }
  if (path.slice(-1) == "/") {
    names.splice(names.length - 1, 1);
  }
  return names;
}
function queryKey(uri, query) {
  const data = {};
  query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function($0, $1, $2) {
    if ($1) {
      data[$1] = $2;
    }
  });
  return data;
}
let Socket$1 = class Socket extends Emitter {
  /**
   * Socket constructor.
   *
   * @param {String|Object} uri - uri or options
   * @param {Object} opts - options
   */
  constructor(uri, opts = {}) {
    super();
    this.binaryType = defaultBinaryType;
    this.writeBuffer = [];
    if (uri && "object" === typeof uri) {
      opts = uri;
      uri = null;
    }
    if (uri) {
      uri = parse(uri);
      opts.hostname = uri.host;
      opts.secure = uri.protocol === "https" || uri.protocol === "wss";
      opts.port = uri.port;
      if (uri.query)
        opts.query = uri.query;
    } else if (opts.host) {
      opts.hostname = parse(opts.host).host;
    }
    installTimerFunctions(this, opts);
    this.secure = null != opts.secure ? opts.secure : typeof location !== "undefined" && "https:" === location.protocol;
    if (opts.hostname && !opts.port) {
      opts.port = this.secure ? "443" : "80";
    }
    this.hostname = opts.hostname || (typeof location !== "undefined" ? location.hostname : "localhost");
    this.port = opts.port || (typeof location !== "undefined" && location.port ? location.port : this.secure ? "443" : "80");
    this.transports = opts.transports || [
      "polling",
      "websocket",
      "webtransport"
    ];
    this.writeBuffer = [];
    this.prevBufferLen = 0;
    this.opts = Object.assign({
      path: "/engine.io",
      agent: false,
      withCredentials: false,
      upgrade: true,
      timestampParam: "t",
      rememberUpgrade: false,
      addTrailingSlash: true,
      rejectUnauthorized: true,
      perMessageDeflate: {
        threshold: 1024
      },
      transportOptions: {},
      closeOnBeforeunload: false
    }, opts);
    this.opts.path = this.opts.path.replace(/\/$/, "") + (this.opts.addTrailingSlash ? "/" : "");
    if (typeof this.opts.query === "string") {
      this.opts.query = decode(this.opts.query);
    }
    this.id = null;
    this.upgrades = null;
    this.pingInterval = null;
    this.pingTimeout = null;
    this.pingTimeoutTimer = null;
    if (typeof addEventListener === "function") {
      if (this.opts.closeOnBeforeunload) {
        this.beforeunloadEventListener = () => {
          if (this.transport) {
            this.transport.removeAllListeners();
            this.transport.close();
          }
        };
        addEventListener("beforeunload", this.beforeunloadEventListener, false);
      }
      if (this.hostname !== "localhost") {
        this.offlineEventListener = () => {
          this.onClose("transport close", {
            description: "network connection lost"
          });
        };
        addEventListener("offline", this.offlineEventListener, false);
      }
    }
    this.open();
  }
  /**
   * Creates transport of the given type.
   *
   * @param {String} name - transport name
   * @return {Transport}
   * @private
   */
  createTransport(name) {
    const query = Object.assign({}, this.opts.query);
    query.EIO = protocol$1;
    query.transport = name;
    if (this.id)
      query.sid = this.id;
    const opts = Object.assign({}, this.opts, {
      query,
      socket: this,
      hostname: this.hostname,
      secure: this.secure,
      port: this.port
    }, this.opts.transportOptions[name]);
    return new transports[name](opts);
  }
  /**
   * Initializes transport to use and starts probe.
   *
   * @private
   */
  open() {
    let transport;
    if (this.opts.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf("websocket") !== -1) {
      transport = "websocket";
    } else if (0 === this.transports.length) {
      this.setTimeoutFn(() => {
        this.emitReserved("error", "No transports available");
      }, 0);
      return;
    } else {
      transport = this.transports[0];
    }
    this.readyState = "opening";
    try {
      transport = this.createTransport(transport);
    } catch (e) {
      this.transports.shift();
      this.open();
      return;
    }
    transport.open();
    this.setTransport(transport);
  }
  /**
   * Sets the current transport. Disables the existing one (if any).
   *
   * @private
   */
  setTransport(transport) {
    if (this.transport) {
      this.transport.removeAllListeners();
    }
    this.transport = transport;
    transport.on("drain", this.onDrain.bind(this)).on("packet", this.onPacket.bind(this)).on("error", this.onError.bind(this)).on("close", (reason) => this.onClose("transport close", reason));
  }
  /**
   * Probes a transport.
   *
   * @param {String} name - transport name
   * @private
   */
  probe(name) {
    let transport = this.createTransport(name);
    let failed = false;
    Socket.priorWebsocketSuccess = false;
    const onTransportOpen = () => {
      if (failed)
        return;
      transport.send([{ type: "ping", data: "probe" }]);
      transport.once("packet", (msg) => {
        if (failed)
          return;
        if ("pong" === msg.type && "probe" === msg.data) {
          this.upgrading = true;
          this.emitReserved("upgrading", transport);
          if (!transport)
            return;
          Socket.priorWebsocketSuccess = "websocket" === transport.name;
          this.transport.pause(() => {
            if (failed)
              return;
            if ("closed" === this.readyState)
              return;
            cleanup();
            this.setTransport(transport);
            transport.send([{ type: "upgrade" }]);
            this.emitReserved("upgrade", transport);
            transport = null;
            this.upgrading = false;
            this.flush();
          });
        } else {
          const err = new Error("probe error");
          err.transport = transport.name;
          this.emitReserved("upgradeError", err);
        }
      });
    };
    function freezeTransport() {
      if (failed)
        return;
      failed = true;
      cleanup();
      transport.close();
      transport = null;
    }
    const onerror = (err) => {
      const error = new Error("probe error: " + err);
      error.transport = transport.name;
      freezeTransport();
      this.emitReserved("upgradeError", error);
    };
    function onTransportClose() {
      onerror("transport closed");
    }
    function onclose() {
      onerror("socket closed");
    }
    function onupgrade(to) {
      if (transport && to.name !== transport.name) {
        freezeTransport();
      }
    }
    const cleanup = () => {
      transport.removeListener("open", onTransportOpen);
      transport.removeListener("error", onerror);
      transport.removeListener("close", onTransportClose);
      this.off("close", onclose);
      this.off("upgrading", onupgrade);
    };
    transport.once("open", onTransportOpen);
    transport.once("error", onerror);
    transport.once("close", onTransportClose);
    this.once("close", onclose);
    this.once("upgrading", onupgrade);
    if (this.upgrades.indexOf("webtransport") !== -1 && name !== "webtransport") {
      this.setTimeoutFn(() => {
        if (!failed) {
          transport.open();
        }
      }, 200);
    } else {
      transport.open();
    }
  }
  /**
   * Called when connection is deemed open.
   *
   * @private
   */
  onOpen() {
    this.readyState = "open";
    Socket.priorWebsocketSuccess = "websocket" === this.transport.name;
    this.emitReserved("open");
    this.flush();
    if ("open" === this.readyState && this.opts.upgrade) {
      let i2 = 0;
      const l = this.upgrades.length;
      for (; i2 < l; i2++) {
        this.probe(this.upgrades[i2]);
      }
    }
  }
  /**
   * Handles a packet.
   *
   * @private
   */
  onPacket(packet) {
    if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
      this.emitReserved("packet", packet);
      this.emitReserved("heartbeat");
      this.resetPingTimeout();
      switch (packet.type) {
        case "open":
          this.onHandshake(JSON.parse(packet.data));
          break;
        case "ping":
          this.sendPacket("pong");
          this.emitReserved("ping");
          this.emitReserved("pong");
          break;
        case "error":
          const err = new Error("server error");
          err.code = packet.data;
          this.onError(err);
          break;
        case "message":
          this.emitReserved("data", packet.data);
          this.emitReserved("message", packet.data);
          break;
      }
    }
  }
  /**
   * Called upon handshake completion.
   *
   * @param {Object} data - handshake obj
   * @private
   */
  onHandshake(data) {
    this.emitReserved("handshake", data);
    this.id = data.sid;
    this.transport.query.sid = data.sid;
    this.upgrades = this.filterUpgrades(data.upgrades);
    this.pingInterval = data.pingInterval;
    this.pingTimeout = data.pingTimeout;
    this.maxPayload = data.maxPayload;
    this.onOpen();
    if ("closed" === this.readyState)
      return;
    this.resetPingTimeout();
  }
  /**
   * Sets and resets ping timeout timer based on server pings.
   *
   * @private
   */
  resetPingTimeout() {
    this.clearTimeoutFn(this.pingTimeoutTimer);
    this.pingTimeoutTimer = this.setTimeoutFn(() => {
      this.onClose("ping timeout");
    }, this.pingInterval + this.pingTimeout);
    if (this.opts.autoUnref) {
      this.pingTimeoutTimer.unref();
    }
  }
  /**
   * Called on `drain` event
   *
   * @private
   */
  onDrain() {
    this.writeBuffer.splice(0, this.prevBufferLen);
    this.prevBufferLen = 0;
    if (0 === this.writeBuffer.length) {
      this.emitReserved("drain");
    } else {
      this.flush();
    }
  }
  /**
   * Flush write buffers.
   *
   * @private
   */
  flush() {
    if ("closed" !== this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
      const packets = this.getWritablePackets();
      this.transport.send(packets);
      this.prevBufferLen = packets.length;
      this.emitReserved("flush");
    }
  }
  /**
   * Ensure the encoded size of the writeBuffer is below the maxPayload value sent by the server (only for HTTP
   * long-polling)
   *
   * @private
   */
  getWritablePackets() {
    const shouldCheckPayloadSize = this.maxPayload && this.transport.name === "polling" && this.writeBuffer.length > 1;
    if (!shouldCheckPayloadSize) {
      return this.writeBuffer;
    }
    let payloadSize = 1;
    for (let i2 = 0; i2 < this.writeBuffer.length; i2++) {
      const data = this.writeBuffer[i2].data;
      if (data) {
        payloadSize += byteLength(data);
      }
      if (i2 > 0 && payloadSize > this.maxPayload) {
        return this.writeBuffer.slice(0, i2);
      }
      payloadSize += 2;
    }
    return this.writeBuffer;
  }
  /**
   * Sends a message.
   *
   * @param {String} msg - message.
   * @param {Object} options.
   * @param {Function} callback function.
   * @return {Socket} for chaining.
   */
  write(msg, options, fn) {
    this.sendPacket("message", msg, options, fn);
    return this;
  }
  send(msg, options, fn) {
    this.sendPacket("message", msg, options, fn);
    return this;
  }
  /**
   * Sends a packet.
   *
   * @param {String} type: packet type.
   * @param {String} data.
   * @param {Object} options.
   * @param {Function} fn - callback function.
   * @private
   */
  sendPacket(type, data, options, fn) {
    if ("function" === typeof data) {
      fn = data;
      data = void 0;
    }
    if ("function" === typeof options) {
      fn = options;
      options = null;
    }
    if ("closing" === this.readyState || "closed" === this.readyState) {
      return;
    }
    options = options || {};
    options.compress = false !== options.compress;
    const packet = {
      type,
      data,
      options
    };
    this.emitReserved("packetCreate", packet);
    this.writeBuffer.push(packet);
    if (fn)
      this.once("flush", fn);
    this.flush();
  }
  /**
   * Closes the connection.
   */
  close() {
    const close = () => {
      this.onClose("forced close");
      this.transport.close();
    };
    const cleanupAndClose = () => {
      this.off("upgrade", cleanupAndClose);
      this.off("upgradeError", cleanupAndClose);
      close();
    };
    const waitForUpgrade = () => {
      this.once("upgrade", cleanupAndClose);
      this.once("upgradeError", cleanupAndClose);
    };
    if ("opening" === this.readyState || "open" === this.readyState) {
      this.readyState = "closing";
      if (this.writeBuffer.length) {
        this.once("drain", () => {
          if (this.upgrading) {
            waitForUpgrade();
          } else {
            close();
          }
        });
      } else if (this.upgrading) {
        waitForUpgrade();
      } else {
        close();
      }
    }
    return this;
  }
  /**
   * Called upon transport error
   *
   * @private
   */
  onError(err) {
    Socket.priorWebsocketSuccess = false;
    this.emitReserved("error", err);
    this.onClose("transport error", err);
  }
  /**
   * Called upon transport close.
   *
   * @private
   */
  onClose(reason, description) {
    if ("opening" === this.readyState || "open" === this.readyState || "closing" === this.readyState) {
      this.clearTimeoutFn(this.pingTimeoutTimer);
      this.transport.removeAllListeners("close");
      this.transport.close();
      this.transport.removeAllListeners();
      if (typeof removeEventListener === "function") {
        removeEventListener("beforeunload", this.beforeunloadEventListener, false);
        removeEventListener("offline", this.offlineEventListener, false);
      }
      this.readyState = "closed";
      this.id = null;
      this.emitReserved("close", reason, description);
      this.writeBuffer = [];
      this.prevBufferLen = 0;
    }
  }
  /**
   * Filters upgrades, returning only those matching client transports.
   *
   * @param {Array} upgrades - server upgrades
   * @private
   */
  filterUpgrades(upgrades) {
    const filteredUpgrades = [];
    let i2 = 0;
    const j = upgrades.length;
    for (; i2 < j; i2++) {
      if (~this.transports.indexOf(upgrades[i2]))
        filteredUpgrades.push(upgrades[i2]);
    }
    return filteredUpgrades;
  }
};
Socket$1.protocol = protocol$1;
function url(uri, path = "", loc) {
  let obj = uri;
  loc = loc || typeof location !== "undefined" && location;
  if (null == uri)
    uri = loc.protocol + "//" + loc.host;
  if (typeof uri === "string") {
    if ("/" === uri.charAt(0)) {
      if ("/" === uri.charAt(1)) {
        uri = loc.protocol + uri;
      } else {
        uri = loc.host + uri;
      }
    }
    if (!/^(https?|wss?):\/\//.test(uri)) {
      if ("undefined" !== typeof loc) {
        uri = loc.protocol + "//" + uri;
      } else {
        uri = "https://" + uri;
      }
    }
    obj = parse(uri);
  }
  if (!obj.port) {
    if (/^(http|ws)$/.test(obj.protocol)) {
      obj.port = "80";
    } else if (/^(http|ws)s$/.test(obj.protocol)) {
      obj.port = "443";
    }
  }
  obj.path = obj.path || "/";
  const ipv6 = obj.host.indexOf(":") !== -1;
  const host = ipv6 ? "[" + obj.host + "]" : obj.host;
  obj.id = obj.protocol + "://" + host + ":" + obj.port + path;
  obj.href = obj.protocol + "://" + host + (loc && loc.port === obj.port ? "" : ":" + obj.port);
  return obj;
}
const withNativeArrayBuffer = typeof ArrayBuffer === "function";
const isView = (obj) => {
  return typeof ArrayBuffer.isView === "function" ? ArrayBuffer.isView(obj) : obj.buffer instanceof ArrayBuffer;
};
const toString = Object.prototype.toString;
const withNativeBlob = typeof Blob === "function" || typeof Blob !== "undefined" && toString.call(Blob) === "[object BlobConstructor]";
const withNativeFile = typeof File === "function" || typeof File !== "undefined" && toString.call(File) === "[object FileConstructor]";
function isBinary(obj) {
  return withNativeArrayBuffer && (obj instanceof ArrayBuffer || isView(obj)) || withNativeBlob && obj instanceof Blob || withNativeFile && obj instanceof File;
}
function hasBinary(obj, toJSON) {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  if (Array.isArray(obj)) {
    for (let i2 = 0, l = obj.length; i2 < l; i2++) {
      if (hasBinary(obj[i2])) {
        return true;
      }
    }
    return false;
  }
  if (isBinary(obj)) {
    return true;
  }
  if (obj.toJSON && typeof obj.toJSON === "function" && arguments.length === 1) {
    return hasBinary(obj.toJSON(), true);
  }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
      return true;
    }
  }
  return false;
}
function deconstructPacket(packet) {
  const buffers = [];
  const packetData = packet.data;
  const pack = packet;
  pack.data = _deconstructPacket(packetData, buffers);
  pack.attachments = buffers.length;
  return { packet: pack, buffers };
}
function _deconstructPacket(data, buffers) {
  if (!data)
    return data;
  if (isBinary(data)) {
    const placeholder = { _placeholder: true, num: buffers.length };
    buffers.push(data);
    return placeholder;
  } else if (Array.isArray(data)) {
    const newData = new Array(data.length);
    for (let i2 = 0; i2 < data.length; i2++) {
      newData[i2] = _deconstructPacket(data[i2], buffers);
    }
    return newData;
  } else if (typeof data === "object" && !(data instanceof Date)) {
    const newData = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newData[key] = _deconstructPacket(data[key], buffers);
      }
    }
    return newData;
  }
  return data;
}
function reconstructPacket(packet, buffers) {
  packet.data = _reconstructPacket(packet.data, buffers);
  delete packet.attachments;
  return packet;
}
function _reconstructPacket(data, buffers) {
  if (!data)
    return data;
  if (data && data._placeholder === true) {
    const isIndexValid = typeof data.num === "number" && data.num >= 0 && data.num < buffers.length;
    if (isIndexValid) {
      return buffers[data.num];
    } else {
      throw new Error("illegal attachments");
    }
  } else if (Array.isArray(data)) {
    for (let i2 = 0; i2 < data.length; i2++) {
      data[i2] = _reconstructPacket(data[i2], buffers);
    }
  } else if (typeof data === "object") {
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        data[key] = _reconstructPacket(data[key], buffers);
      }
    }
  }
  return data;
}
const RESERVED_EVENTS$1 = [
  "connect",
  "connect_error",
  "disconnect",
  "disconnecting",
  "newListener",
  "removeListener"
  // used by the Node.js EventEmitter
];
const protocol = 5;
var PacketType;
(function(PacketType2) {
  PacketType2[PacketType2["CONNECT"] = 0] = "CONNECT";
  PacketType2[PacketType2["DISCONNECT"] = 1] = "DISCONNECT";
  PacketType2[PacketType2["EVENT"] = 2] = "EVENT";
  PacketType2[PacketType2["ACK"] = 3] = "ACK";
  PacketType2[PacketType2["CONNECT_ERROR"] = 4] = "CONNECT_ERROR";
  PacketType2[PacketType2["BINARY_EVENT"] = 5] = "BINARY_EVENT";
  PacketType2[PacketType2["BINARY_ACK"] = 6] = "BINARY_ACK";
})(PacketType || (PacketType = {}));
class Encoder {
  /**
   * Encoder constructor
   *
   * @param {function} replacer - custom replacer to pass down to JSON.parse
   */
  constructor(replacer) {
    this.replacer = replacer;
  }
  /**
   * Encode a packet as a single string if non-binary, or as a
   * buffer sequence, depending on packet type.
   *
   * @param {Object} obj - packet object
   */
  encode(obj) {
    if (obj.type === PacketType.EVENT || obj.type === PacketType.ACK) {
      if (hasBinary(obj)) {
        return this.encodeAsBinary({
          type: obj.type === PacketType.EVENT ? PacketType.BINARY_EVENT : PacketType.BINARY_ACK,
          nsp: obj.nsp,
          data: obj.data,
          id: obj.id
        });
      }
    }
    return [this.encodeAsString(obj)];
  }
  /**
   * Encode packet as string.
   */
  encodeAsString(obj) {
    let str = "" + obj.type;
    if (obj.type === PacketType.BINARY_EVENT || obj.type === PacketType.BINARY_ACK) {
      str += obj.attachments + "-";
    }
    if (obj.nsp && "/" !== obj.nsp) {
      str += obj.nsp + ",";
    }
    if (null != obj.id) {
      str += obj.id;
    }
    if (null != obj.data) {
      str += JSON.stringify(obj.data, this.replacer);
    }
    return str;
  }
  /**
   * Encode packet as 'buffer sequence' by removing blobs, and
   * deconstructing packet into object with placeholders and
   * a list of buffers.
   */
  encodeAsBinary(obj) {
    const deconstruction = deconstructPacket(obj);
    const pack = this.encodeAsString(deconstruction.packet);
    const buffers = deconstruction.buffers;
    buffers.unshift(pack);
    return buffers;
  }
}
function isObject(value2) {
  return Object.prototype.toString.call(value2) === "[object Object]";
}
class Decoder extends Emitter {
  /**
   * Decoder constructor
   *
   * @param {function} reviver - custom reviver to pass down to JSON.stringify
   */
  constructor(reviver) {
    super();
    this.reviver = reviver;
  }
  /**
   * Decodes an encoded packet string into packet JSON.
   *
   * @param {String} obj - encoded packet
   */
  add(obj) {
    let packet;
    if (typeof obj === "string") {
      if (this.reconstructor) {
        throw new Error("got plaintext data when reconstructing a packet");
      }
      packet = this.decodeString(obj);
      const isBinaryEvent = packet.type === PacketType.BINARY_EVENT;
      if (isBinaryEvent || packet.type === PacketType.BINARY_ACK) {
        packet.type = isBinaryEvent ? PacketType.EVENT : PacketType.ACK;
        this.reconstructor = new BinaryReconstructor(packet);
        if (packet.attachments === 0) {
          super.emitReserved("decoded", packet);
        }
      } else {
        super.emitReserved("decoded", packet);
      }
    } else if (isBinary(obj) || obj.base64) {
      if (!this.reconstructor) {
        throw new Error("got binary data when not reconstructing a packet");
      } else {
        packet = this.reconstructor.takeBinaryData(obj);
        if (packet) {
          this.reconstructor = null;
          super.emitReserved("decoded", packet);
        }
      }
    } else {
      throw new Error("Unknown type: " + obj);
    }
  }
  /**
   * Decode a packet String (JSON data)
   *
   * @param {String} str
   * @return {Object} packet
   */
  decodeString(str) {
    let i2 = 0;
    const p = {
      type: Number(str.charAt(0))
    };
    if (PacketType[p.type] === void 0) {
      throw new Error("unknown packet type " + p.type);
    }
    if (p.type === PacketType.BINARY_EVENT || p.type === PacketType.BINARY_ACK) {
      const start = i2 + 1;
      while (str.charAt(++i2) !== "-" && i2 != str.length) {
      }
      const buf = str.substring(start, i2);
      if (buf != Number(buf) || str.charAt(i2) !== "-") {
        throw new Error("Illegal attachments");
      }
      p.attachments = Number(buf);
    }
    if ("/" === str.charAt(i2 + 1)) {
      const start = i2 + 1;
      while (++i2) {
        const c = str.charAt(i2);
        if ("," === c)
          break;
        if (i2 === str.length)
          break;
      }
      p.nsp = str.substring(start, i2);
    } else {
      p.nsp = "/";
    }
    const next = str.charAt(i2 + 1);
    if ("" !== next && Number(next) == next) {
      const start = i2 + 1;
      while (++i2) {
        const c = str.charAt(i2);
        if (null == c || Number(c) != c) {
          --i2;
          break;
        }
        if (i2 === str.length)
          break;
      }
      p.id = Number(str.substring(start, i2 + 1));
    }
    if (str.charAt(++i2)) {
      const payload = this.tryParse(str.substr(i2));
      if (Decoder.isPayloadValid(p.type, payload)) {
        p.data = payload;
      } else {
        throw new Error("invalid payload");
      }
    }
    return p;
  }
  tryParse(str) {
    try {
      return JSON.parse(str, this.reviver);
    } catch (e) {
      return false;
    }
  }
  static isPayloadValid(type, payload) {
    switch (type) {
      case PacketType.CONNECT:
        return isObject(payload);
      case PacketType.DISCONNECT:
        return payload === void 0;
      case PacketType.CONNECT_ERROR:
        return typeof payload === "string" || isObject(payload);
      case PacketType.EVENT:
      case PacketType.BINARY_EVENT:
        return Array.isArray(payload) && (typeof payload[0] === "number" || typeof payload[0] === "string" && RESERVED_EVENTS$1.indexOf(payload[0]) === -1);
      case PacketType.ACK:
      case PacketType.BINARY_ACK:
        return Array.isArray(payload);
    }
  }
  /**
   * Deallocates a parser's resources
   */
  destroy() {
    if (this.reconstructor) {
      this.reconstructor.finishedReconstruction();
      this.reconstructor = null;
    }
  }
}
class BinaryReconstructor {
  constructor(packet) {
    this.packet = packet;
    this.buffers = [];
    this.reconPack = packet;
  }
  /**
   * Method to be called when binary data received from connection
   * after a BINARY_EVENT packet.
   *
   * @param {Buffer | ArrayBuffer} binData - the raw binary data received
   * @return {null | Object} returns null if more binary data is expected or
   *   a reconstructed packet object if all buffers have been received.
   */
  takeBinaryData(binData) {
    this.buffers.push(binData);
    if (this.buffers.length === this.reconPack.attachments) {
      const packet = reconstructPacket(this.reconPack, this.buffers);
      this.finishedReconstruction();
      return packet;
    }
    return null;
  }
  /**
   * Cleans up binary packet reconstruction variables.
   */
  finishedReconstruction() {
    this.reconPack = null;
    this.buffers = [];
  }
}
const parser = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Decoder,
  Encoder,
  get PacketType() {
    return PacketType;
  },
  protocol
}, Symbol.toStringTag, { value: "Module" }));
function on(obj, ev, fn) {
  obj.on(ev, fn);
  return function subDestroy() {
    obj.off(ev, fn);
  };
}
const RESERVED_EVENTS = Object.freeze({
  connect: 1,
  connect_error: 1,
  disconnect: 1,
  disconnecting: 1,
  // EventEmitter reserved events: https://nodejs.org/api/events.html#events_event_newlistener
  newListener: 1,
  removeListener: 1
});
class Socket2 extends Emitter {
  /**
   * `Socket` constructor.
   */
  constructor(io, nsp, opts) {
    super();
    this.connected = false;
    this.recovered = false;
    this.receiveBuffer = [];
    this.sendBuffer = [];
    this._queue = [];
    this._queueSeq = 0;
    this.ids = 0;
    this.acks = {};
    this.flags = {};
    this.io = io;
    this.nsp = nsp;
    if (opts && opts.auth) {
      this.auth = opts.auth;
    }
    this._opts = Object.assign({}, opts);
    if (this.io._autoConnect)
      this.open();
  }
  /**
   * Whether the socket is currently disconnected
   *
   * @example
   * const socket = io();
   *
   * socket.on("connect", () => {
   *   console.log(socket.disconnected); // false
   * });
   *
   * socket.on("disconnect", () => {
   *   console.log(socket.disconnected); // true
   * });
   */
  get disconnected() {
    return !this.connected;
  }
  /**
   * Subscribe to open, close and packet events
   *
   * @private
   */
  subEvents() {
    if (this.subs)
      return;
    const io = this.io;
    this.subs = [
      on(io, "open", this.onopen.bind(this)),
      on(io, "packet", this.onpacket.bind(this)),
      on(io, "error", this.onerror.bind(this)),
      on(io, "close", this.onclose.bind(this))
    ];
  }
  /**
   * Whether the Socket will try to reconnect when its Manager connects or reconnects.
   *
   * @example
   * const socket = io();
   *
   * console.log(socket.active); // true
   *
   * socket.on("disconnect", (reason) => {
   *   if (reason === "io server disconnect") {
   *     // the disconnection was initiated by the server, you need to manually reconnect
   *     console.log(socket.active); // false
   *   }
   *   // else the socket will automatically try to reconnect
   *   console.log(socket.active); // true
   * });
   */
  get active() {
    return !!this.subs;
  }
  /**
   * "Opens" the socket.
   *
   * @example
   * const socket = io({
   *   autoConnect: false
   * });
   *
   * socket.connect();
   */
  connect() {
    if (this.connected)
      return this;
    this.subEvents();
    if (!this.io["_reconnecting"])
      this.io.open();
    if ("open" === this.io._readyState)
      this.onopen();
    return this;
  }
  /**
   * Alias for {@link connect()}.
   */
  open() {
    return this.connect();
  }
  /**
   * Sends a `message` event.
   *
   * This method mimics the WebSocket.send() method.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/send
   *
   * @example
   * socket.send("hello");
   *
   * // this is equivalent to
   * socket.emit("message", "hello");
   *
   * @return self
   */
  send(...args) {
    args.unshift("message");
    this.emit.apply(this, args);
    return this;
  }
  /**
   * Override `emit`.
   * If the event is in `events`, it's emitted normally.
   *
   * @example
   * socket.emit("hello", "world");
   *
   * // all serializable datastructures are supported (no need to call JSON.stringify)
   * socket.emit("hello", 1, "2", { 3: ["4"], 5: Uint8Array.from([6]) });
   *
   * // with an acknowledgement from the server
   * socket.emit("hello", "world", (val) => {
   *   // ...
   * });
   *
   * @return self
   */
  emit(ev, ...args) {
    if (RESERVED_EVENTS.hasOwnProperty(ev)) {
      throw new Error('"' + ev.toString() + '" is a reserved event name');
    }
    args.unshift(ev);
    if (this._opts.retries && !this.flags.fromQueue && !this.flags.volatile) {
      this._addToQueue(args);
      return this;
    }
    const packet = {
      type: PacketType.EVENT,
      data: args
    };
    packet.options = {};
    packet.options.compress = this.flags.compress !== false;
    if ("function" === typeof args[args.length - 1]) {
      const id = this.ids++;
      const ack = args.pop();
      this._registerAckCallback(id, ack);
      packet.id = id;
    }
    const isTransportWritable = this.io.engine && this.io.engine.transport && this.io.engine.transport.writable;
    const discardPacket = this.flags.volatile && (!isTransportWritable || !this.connected);
    if (discardPacket)
      ;
    else if (this.connected) {
      this.notifyOutgoingListeners(packet);
      this.packet(packet);
    } else {
      this.sendBuffer.push(packet);
    }
    this.flags = {};
    return this;
  }
  /**
   * @private
   */
  _registerAckCallback(id, ack) {
    var _a;
    const timeout = (_a = this.flags.timeout) !== null && _a !== void 0 ? _a : this._opts.ackTimeout;
    if (timeout === void 0) {
      this.acks[id] = ack;
      return;
    }
    const timer = this.io.setTimeoutFn(() => {
      delete this.acks[id];
      for (let i2 = 0; i2 < this.sendBuffer.length; i2++) {
        if (this.sendBuffer[i2].id === id) {
          this.sendBuffer.splice(i2, 1);
        }
      }
      ack.call(this, new Error("operation has timed out"));
    }, timeout);
    const fn = (...args) => {
      this.io.clearTimeoutFn(timer);
      ack.apply(this, args);
    };
    fn.withError = true;
    this.acks[id] = fn;
  }
  /**
   * Emits an event and waits for an acknowledgement
   *
   * @example
   * // without timeout
   * const response = await socket.emitWithAck("hello", "world");
   *
   * // with a specific timeout
   * try {
   *   const response = await socket.timeout(1000).emitWithAck("hello", "world");
   * } catch (err) {
   *   // the server did not acknowledge the event in the given delay
   * }
   *
   * @return a Promise that will be fulfilled when the server acknowledges the event
   */
  emitWithAck(ev, ...args) {
    return new Promise((resolve, reject) => {
      const fn = (arg1, arg2) => {
        return arg1 ? reject(arg1) : resolve(arg2);
      };
      fn.withError = true;
      args.push(fn);
      this.emit(ev, ...args);
    });
  }
  /**
   * Add the packet to the queue.
   * @param args
   * @private
   */
  _addToQueue(args) {
    let ack;
    if (typeof args[args.length - 1] === "function") {
      ack = args.pop();
    }
    const packet = {
      id: this._queueSeq++,
      tryCount: 0,
      pending: false,
      args,
      flags: Object.assign({ fromQueue: true }, this.flags)
    };
    args.push((err, ...responseArgs) => {
      if (packet !== this._queue[0]) {
        return;
      }
      const hasError = err !== null;
      if (hasError) {
        if (packet.tryCount > this._opts.retries) {
          this._queue.shift();
          if (ack) {
            ack(err);
          }
        }
      } else {
        this._queue.shift();
        if (ack) {
          ack(null, ...responseArgs);
        }
      }
      packet.pending = false;
      return this._drainQueue();
    });
    this._queue.push(packet);
    this._drainQueue();
  }
  /**
   * Send the first packet of the queue, and wait for an acknowledgement from the server.
   * @param force - whether to resend a packet that has not been acknowledged yet
   *
   * @private
   */
  _drainQueue(force = false) {
    if (!this.connected || this._queue.length === 0) {
      return;
    }
    const packet = this._queue[0];
    if (packet.pending && !force) {
      return;
    }
    packet.pending = true;
    packet.tryCount++;
    this.flags = packet.flags;
    this.emit.apply(this, packet.args);
  }
  /**
   * Sends a packet.
   *
   * @param packet
   * @private
   */
  packet(packet) {
    packet.nsp = this.nsp;
    this.io._packet(packet);
  }
  /**
   * Called upon engine `open`.
   *
   * @private
   */
  onopen() {
    if (typeof this.auth == "function") {
      this.auth((data) => {
        this._sendConnectPacket(data);
      });
    } else {
      this._sendConnectPacket(this.auth);
    }
  }
  /**
   * Sends a CONNECT packet to initiate the Socket.IO session.
   *
   * @param data
   * @private
   */
  _sendConnectPacket(data) {
    this.packet({
      type: PacketType.CONNECT,
      data: this._pid ? Object.assign({ pid: this._pid, offset: this._lastOffset }, data) : data
    });
  }
  /**
   * Called upon engine or manager `error`.
   *
   * @param err
   * @private
   */
  onerror(err) {
    if (!this.connected) {
      this.emitReserved("connect_error", err);
    }
  }
  /**
   * Called upon engine `close`.
   *
   * @param reason
   * @param description
   * @private
   */
  onclose(reason, description) {
    this.connected = false;
    delete this.id;
    this.emitReserved("disconnect", reason, description);
    this._clearAcks();
  }
  /**
   * Clears the acknowledgement handlers upon disconnection, since the client will never receive an acknowledgement from
   * the server.
   *
   * @private
   */
  _clearAcks() {
    Object.keys(this.acks).forEach((id) => {
      const isBuffered = this.sendBuffer.some((packet) => String(packet.id) === id);
      if (!isBuffered) {
        const ack = this.acks[id];
        delete this.acks[id];
        if (ack.withError) {
          ack.call(this, new Error("socket has been disconnected"));
        }
      }
    });
  }
  /**
   * Called with socket packet.
   *
   * @param packet
   * @private
   */
  onpacket(packet) {
    const sameNamespace = packet.nsp === this.nsp;
    if (!sameNamespace)
      return;
    switch (packet.type) {
      case PacketType.CONNECT:
        if (packet.data && packet.data.sid) {
          this.onconnect(packet.data.sid, packet.data.pid);
        } else {
          this.emitReserved("connect_error", new Error("It seems you are trying to reach a Socket.IO server in v2.x with a v3.x client, but they are not compatible (more information here: https://socket.io/docs/v3/migrating-from-2-x-to-3-0/)"));
        }
        break;
      case PacketType.EVENT:
      case PacketType.BINARY_EVENT:
        this.onevent(packet);
        break;
      case PacketType.ACK:
      case PacketType.BINARY_ACK:
        this.onack(packet);
        break;
      case PacketType.DISCONNECT:
        this.ondisconnect();
        break;
      case PacketType.CONNECT_ERROR:
        this.destroy();
        const err = new Error(packet.data.message);
        err.data = packet.data.data;
        this.emitReserved("connect_error", err);
        break;
    }
  }
  /**
   * Called upon a server event.
   *
   * @param packet
   * @private
   */
  onevent(packet) {
    const args = packet.data || [];
    if (null != packet.id) {
      args.push(this.ack(packet.id));
    }
    if (this.connected) {
      this.emitEvent(args);
    } else {
      this.receiveBuffer.push(Object.freeze(args));
    }
  }
  emitEvent(args) {
    if (this._anyListeners && this._anyListeners.length) {
      const listeners = this._anyListeners.slice();
      for (const listener of listeners) {
        listener.apply(this, args);
      }
    }
    super.emit.apply(this, args);
    if (this._pid && args.length && typeof args[args.length - 1] === "string") {
      this._lastOffset = args[args.length - 1];
    }
  }
  /**
   * Produces an ack callback to emit with an event.
   *
   * @private
   */
  ack(id) {
    const self2 = this;
    let sent = false;
    return function(...args) {
      if (sent)
        return;
      sent = true;
      self2.packet({
        type: PacketType.ACK,
        id,
        data: args
      });
    };
  }
  /**
   * Called upon a server acknowledgement.
   *
   * @param packet
   * @private
   */
  onack(packet) {
    const ack = this.acks[packet.id];
    if (typeof ack !== "function") {
      return;
    }
    delete this.acks[packet.id];
    if (ack.withError) {
      packet.data.unshift(null);
    }
    ack.apply(this, packet.data);
  }
  /**
   * Called upon server connect.
   *
   * @private
   */
  onconnect(id, pid) {
    this.id = id;
    this.recovered = pid && this._pid === pid;
    this._pid = pid;
    this.connected = true;
    this.emitBuffered();
    this.emitReserved("connect");
    this._drainQueue(true);
  }
  /**
   * Emit buffered events (received and emitted).
   *
   * @private
   */
  emitBuffered() {
    this.receiveBuffer.forEach((args) => this.emitEvent(args));
    this.receiveBuffer = [];
    this.sendBuffer.forEach((packet) => {
      this.notifyOutgoingListeners(packet);
      this.packet(packet);
    });
    this.sendBuffer = [];
  }
  /**
   * Called upon server disconnect.
   *
   * @private
   */
  ondisconnect() {
    this.destroy();
    this.onclose("io server disconnect");
  }
  /**
   * Called upon forced client/server side disconnections,
   * this method ensures the manager stops tracking us and
   * that reconnections don't get triggered for this.
   *
   * @private
   */
  destroy() {
    if (this.subs) {
      this.subs.forEach((subDestroy) => subDestroy());
      this.subs = void 0;
    }
    this.io["_destroy"](this);
  }
  /**
   * Disconnects the socket manually. In that case, the socket will not try to reconnect.
   *
   * If this is the last active Socket instance of the {@link Manager}, the low-level connection will be closed.
   *
   * @example
   * const socket = io();
   *
   * socket.on("disconnect", (reason) => {
   *   // console.log(reason); prints "io client disconnect"
   * });
   *
   * socket.disconnect();
   *
   * @return self
   */
  disconnect() {
    if (this.connected) {
      this.packet({ type: PacketType.DISCONNECT });
    }
    this.destroy();
    if (this.connected) {
      this.onclose("io client disconnect");
    }
    return this;
  }
  /**
   * Alias for {@link disconnect()}.
   *
   * @return self
   */
  close() {
    return this.disconnect();
  }
  /**
   * Sets the compress flag.
   *
   * @example
   * socket.compress(false).emit("hello");
   *
   * @param compress - if `true`, compresses the sending data
   * @return self
   */
  compress(compress) {
    this.flags.compress = compress;
    return this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the event message will be dropped when this socket is not
   * ready to send messages.
   *
   * @example
   * socket.volatile.emit("hello"); // the server may or may not receive it
   *
   * @returns self
   */
  get volatile() {
    this.flags.volatile = true;
    return this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the callback will be called with an error when the
   * given number of milliseconds have elapsed without an acknowledgement from the server:
   *
   * @example
   * socket.timeout(5000).emit("my-event", (err) => {
   *   if (err) {
   *     // the server did not acknowledge the event in the given delay
   *   }
   * });
   *
   * @returns self
   */
  timeout(timeout) {
    this.flags.timeout = timeout;
    return this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * @example
   * socket.onAny((event, ...args) => {
   *   console.log(`got ${event}`);
   * });
   *
   * @param listener
   */
  onAny(listener) {
    this._anyListeners = this._anyListeners || [];
    this._anyListeners.push(listener);
    return this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * @example
   * socket.prependAny((event, ...args) => {
   *   console.log(`got event ${event}`);
   * });
   *
   * @param listener
   */
  prependAny(listener) {
    this._anyListeners = this._anyListeners || [];
    this._anyListeners.unshift(listener);
    return this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`got event ${event}`);
   * }
   *
   * socket.onAny(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAny(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAny();
   *
   * @param listener
   */
  offAny(listener) {
    if (!this._anyListeners) {
      return this;
    }
    if (listener) {
      const listeners = this._anyListeners;
      for (let i2 = 0; i2 < listeners.length; i2++) {
        if (listener === listeners[i2]) {
          listeners.splice(i2, 1);
          return this;
        }
      }
    } else {
      this._anyListeners = [];
    }
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAny() {
    return this._anyListeners || [];
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.onAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  onAnyOutgoing(listener) {
    this._anyOutgoingListeners = this._anyOutgoingListeners || [];
    this._anyOutgoingListeners.push(listener);
    return this;
  }
  /**
   * Adds a listener that will be fired when any event is emitted. The event name is passed as the first argument to the
   * callback. The listener is added to the beginning of the listeners array.
   *
   * Note: acknowledgements sent to the server are not included.
   *
   * @example
   * socket.prependAnyOutgoing((event, ...args) => {
   *   console.log(`sent event ${event}`);
   * });
   *
   * @param listener
   */
  prependAnyOutgoing(listener) {
    this._anyOutgoingListeners = this._anyOutgoingListeners || [];
    this._anyOutgoingListeners.unshift(listener);
    return this;
  }
  /**
   * Removes the listener that will be fired when any event is emitted.
   *
   * @example
   * const catchAllListener = (event, ...args) => {
   *   console.log(`sent event ${event}`);
   * }
   *
   * socket.onAnyOutgoing(catchAllListener);
   *
   * // remove a specific listener
   * socket.offAnyOutgoing(catchAllListener);
   *
   * // or remove all listeners
   * socket.offAnyOutgoing();
   *
   * @param [listener] - the catch-all listener (optional)
   */
  offAnyOutgoing(listener) {
    if (!this._anyOutgoingListeners) {
      return this;
    }
    if (listener) {
      const listeners = this._anyOutgoingListeners;
      for (let i2 = 0; i2 < listeners.length; i2++) {
        if (listener === listeners[i2]) {
          listeners.splice(i2, 1);
          return this;
        }
      }
    } else {
      this._anyOutgoingListeners = [];
    }
    return this;
  }
  /**
   * Returns an array of listeners that are listening for any event that is specified. This array can be manipulated,
   * e.g. to remove listeners.
   */
  listenersAnyOutgoing() {
    return this._anyOutgoingListeners || [];
  }
  /**
   * Notify the listeners for each packet sent
   *
   * @param packet
   *
   * @private
   */
  notifyOutgoingListeners(packet) {
    if (this._anyOutgoingListeners && this._anyOutgoingListeners.length) {
      const listeners = this._anyOutgoingListeners.slice();
      for (const listener of listeners) {
        listener.apply(this, packet.data);
      }
    }
  }
}
function Backoff(opts) {
  opts = opts || {};
  this.ms = opts.min || 100;
  this.max = opts.max || 1e4;
  this.factor = opts.factor || 2;
  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
  this.attempts = 0;
}
Backoff.prototype.duration = function() {
  var ms = this.ms * Math.pow(this.factor, this.attempts++);
  if (this.jitter) {
    var rand = Math.random();
    var deviation = Math.floor(rand * this.jitter * ms);
    ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
  }
  return Math.min(ms, this.max) | 0;
};
Backoff.prototype.reset = function() {
  this.attempts = 0;
};
Backoff.prototype.setMin = function(min) {
  this.ms = min;
};
Backoff.prototype.setMax = function(max) {
  this.max = max;
};
Backoff.prototype.setJitter = function(jitter) {
  this.jitter = jitter;
};
class Manager extends Emitter {
  constructor(uri, opts) {
    var _a;
    super();
    this.nsps = {};
    this.subs = [];
    if (uri && "object" === typeof uri) {
      opts = uri;
      uri = void 0;
    }
    opts = opts || {};
    opts.path = opts.path || "/socket.io";
    this.opts = opts;
    installTimerFunctions(this, opts);
    this.reconnection(opts.reconnection !== false);
    this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
    this.reconnectionDelay(opts.reconnectionDelay || 1e3);
    this.reconnectionDelayMax(opts.reconnectionDelayMax || 5e3);
    this.randomizationFactor((_a = opts.randomizationFactor) !== null && _a !== void 0 ? _a : 0.5);
    this.backoff = new Backoff({
      min: this.reconnectionDelay(),
      max: this.reconnectionDelayMax(),
      jitter: this.randomizationFactor()
    });
    this.timeout(null == opts.timeout ? 2e4 : opts.timeout);
    this._readyState = "closed";
    this.uri = uri;
    const _parser = opts.parser || parser;
    this.encoder = new _parser.Encoder();
    this.decoder = new _parser.Decoder();
    this._autoConnect = opts.autoConnect !== false;
    if (this._autoConnect)
      this.open();
  }
  reconnection(v) {
    if (!arguments.length)
      return this._reconnection;
    this._reconnection = !!v;
    return this;
  }
  reconnectionAttempts(v) {
    if (v === void 0)
      return this._reconnectionAttempts;
    this._reconnectionAttempts = v;
    return this;
  }
  reconnectionDelay(v) {
    var _a;
    if (v === void 0)
      return this._reconnectionDelay;
    this._reconnectionDelay = v;
    (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMin(v);
    return this;
  }
  randomizationFactor(v) {
    var _a;
    if (v === void 0)
      return this._randomizationFactor;
    this._randomizationFactor = v;
    (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setJitter(v);
    return this;
  }
  reconnectionDelayMax(v) {
    var _a;
    if (v === void 0)
      return this._reconnectionDelayMax;
    this._reconnectionDelayMax = v;
    (_a = this.backoff) === null || _a === void 0 ? void 0 : _a.setMax(v);
    return this;
  }
  timeout(v) {
    if (!arguments.length)
      return this._timeout;
    this._timeout = v;
    return this;
  }
  /**
   * Starts trying to reconnect if reconnection is enabled and we have not
   * started reconnecting yet
   *
   * @private
   */
  maybeReconnectOnOpen() {
    if (!this._reconnecting && this._reconnection && this.backoff.attempts === 0) {
      this.reconnect();
    }
  }
  /**
   * Sets the current transport `socket`.
   *
   * @param {Function} fn - optional, callback
   * @return self
   * @public
   */
  open(fn) {
    if (~this._readyState.indexOf("open"))
      return this;
    this.engine = new Socket$1(this.uri, this.opts);
    const socket2 = this.engine;
    const self2 = this;
    this._readyState = "opening";
    this.skipReconnect = false;
    const openSubDestroy = on(socket2, "open", function() {
      self2.onopen();
      fn && fn();
    });
    const onError = (err) => {
      this.cleanup();
      this._readyState = "closed";
      this.emitReserved("error", err);
      if (fn) {
        fn(err);
      } else {
        this.maybeReconnectOnOpen();
      }
    };
    const errorSub = on(socket2, "error", onError);
    if (false !== this._timeout) {
      const timeout = this._timeout;
      const timer = this.setTimeoutFn(() => {
        openSubDestroy();
        onError(new Error("timeout"));
        socket2.close();
      }, timeout);
      if (this.opts.autoUnref) {
        timer.unref();
      }
      this.subs.push(() => {
        this.clearTimeoutFn(timer);
      });
    }
    this.subs.push(openSubDestroy);
    this.subs.push(errorSub);
    return this;
  }
  /**
   * Alias for open()
   *
   * @return self
   * @public
   */
  connect(fn) {
    return this.open(fn);
  }
  /**
   * Called upon transport open.
   *
   * @private
   */
  onopen() {
    this.cleanup();
    this._readyState = "open";
    this.emitReserved("open");
    const socket2 = this.engine;
    this.subs.push(on(socket2, "ping", this.onping.bind(this)), on(socket2, "data", this.ondata.bind(this)), on(socket2, "error", this.onerror.bind(this)), on(socket2, "close", this.onclose.bind(this)), on(this.decoder, "decoded", this.ondecoded.bind(this)));
  }
  /**
   * Called upon a ping.
   *
   * @private
   */
  onping() {
    this.emitReserved("ping");
  }
  /**
   * Called with data.
   *
   * @private
   */
  ondata(data) {
    try {
      this.decoder.add(data);
    } catch (e) {
      this.onclose("parse error", e);
    }
  }
  /**
   * Called when parser fully decodes a packet.
   *
   * @private
   */
  ondecoded(packet) {
    nextTick(() => {
      this.emitReserved("packet", packet);
    }, this.setTimeoutFn);
  }
  /**
   * Called upon socket error.
   *
   * @private
   */
  onerror(err) {
    this.emitReserved("error", err);
  }
  /**
   * Creates a new socket for the given `nsp`.
   *
   * @return {Socket}
   * @public
   */
  socket(nsp, opts) {
    let socket2 = this.nsps[nsp];
    if (!socket2) {
      socket2 = new Socket2(this, nsp, opts);
      this.nsps[nsp] = socket2;
    } else if (this._autoConnect && !socket2.active) {
      socket2.connect();
    }
    return socket2;
  }
  /**
   * Called upon a socket close.
   *
   * @param socket
   * @private
   */
  _destroy(socket2) {
    const nsps = Object.keys(this.nsps);
    for (const nsp of nsps) {
      const socket3 = this.nsps[nsp];
      if (socket3.active) {
        return;
      }
    }
    this._close();
  }
  /**
   * Writes a packet.
   *
   * @param packet
   * @private
   */
  _packet(packet) {
    const encodedPackets = this.encoder.encode(packet);
    for (let i2 = 0; i2 < encodedPackets.length; i2++) {
      this.engine.write(encodedPackets[i2], packet.options);
    }
  }
  /**
   * Clean up transport subscriptions and packet buffer.
   *
   * @private
   */
  cleanup() {
    this.subs.forEach((subDestroy) => subDestroy());
    this.subs.length = 0;
    this.decoder.destroy();
  }
  /**
   * Close the current socket.
   *
   * @private
   */
  _close() {
    this.skipReconnect = true;
    this._reconnecting = false;
    this.onclose("forced close");
    if (this.engine)
      this.engine.close();
  }
  /**
   * Alias for close()
   *
   * @private
   */
  disconnect() {
    return this._close();
  }
  /**
   * Called upon engine close.
   *
   * @private
   */
  onclose(reason, description) {
    this.cleanup();
    this.backoff.reset();
    this._readyState = "closed";
    this.emitReserved("close", reason, description);
    if (this._reconnection && !this.skipReconnect) {
      this.reconnect();
    }
  }
  /**
   * Attempt a reconnection.
   *
   * @private
   */
  reconnect() {
    if (this._reconnecting || this.skipReconnect)
      return this;
    const self2 = this;
    if (this.backoff.attempts >= this._reconnectionAttempts) {
      this.backoff.reset();
      this.emitReserved("reconnect_failed");
      this._reconnecting = false;
    } else {
      const delay = this.backoff.duration();
      this._reconnecting = true;
      const timer = this.setTimeoutFn(() => {
        if (self2.skipReconnect)
          return;
        this.emitReserved("reconnect_attempt", self2.backoff.attempts);
        if (self2.skipReconnect)
          return;
        self2.open((err) => {
          if (err) {
            self2._reconnecting = false;
            self2.reconnect();
            this.emitReserved("reconnect_error", err);
          } else {
            self2.onreconnect();
          }
        });
      }, delay);
      if (this.opts.autoUnref) {
        timer.unref();
      }
      this.subs.push(() => {
        this.clearTimeoutFn(timer);
      });
    }
  }
  /**
   * Called upon successful reconnect.
   *
   * @private
   */
  onreconnect() {
    const attempt = this.backoff.attempts;
    this._reconnecting = false;
    this.backoff.reset();
    this.emitReserved("reconnect", attempt);
  }
}
const cache = {};
function lookup(uri, opts) {
  if (typeof uri === "object") {
    opts = uri;
    uri = void 0;
  }
  opts = opts || {};
  const parsed = url(uri, opts.path || "/socket.io");
  const source = parsed.source;
  const id = parsed.id;
  const path = parsed.path;
  const sameNamespace = cache[id] && path in cache[id]["nsps"];
  const newConnection = opts.forceNew || opts["force new connection"] || false === opts.multiplex || sameNamespace;
  let io;
  if (newConnection) {
    io = new Manager(source, opts);
  } else {
    if (!cache[id]) {
      cache[id] = new Manager(source, opts);
    }
    io = cache[id];
  }
  if (parsed.query && !opts.query) {
    opts.query = parsed.queryKey;
  }
  return io.socket(parsed.path, opts);
}
Object.assign(lookup, {
  Manager,
  Socket: Socket2,
  io: lookup,
  connect: lookup
});
const socket = lookup({
  autoConnect: false
});
let listStickers = [
  {
    label: "/images/emoji/first/label.png",
    items: [
      {
        id: 1,
        url: "/images/emoji/first/1.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 2,
        url: "/images/emoji/first/2.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 3,
        url: "/images/emoji/first/3.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 4,
        url: "/images/emoji/first/4.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 5,
        url: "/images/emoji/first/5.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 6,
        url: "/images/emoji/first/6.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 7,
        url: "/images/emoji/first/7.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 8,
        url: "/images/emoji/first/8.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 9,
        url: "/images/emoji/first/9.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 10,
        url: "/images/emoji/first/10.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 11,
        url: "/images/emoji/first/11.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 12,
        url: "/images/emoji/first/12.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 13,
        url: "/images/emoji/first/13.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 14,
        url: "/images/emoji/first/14.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 15,
        url: "/images/emoji/first/15.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 16,
        url: "/images/emoji/first/16.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 17,
        url: "/images/emoji/first/17.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 18,
        url: "/images/emoji/first/18.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 19,
        url: "/images/emoji/first/19.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 20,
        url: "/images/emoji/first/20.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 21,
        url: "/images/emoji/first/21.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 22,
        url: "/images/emoji/first/22.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 23,
        url: "/images/emoji/first/23.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 24,
        url: "/images/emoji/first/24.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      }
    ]
  },
  {
    label: "/images/emoji/two/label.png",
    items: [
      {
        id: 1,
        url: "/images/emoji/two/1.png",
        totalRow: 2,
        totalColumn: 3,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 2,
        url: "/images/emoji/two/2.png",
        totalRow: 5,
        totalColumn: 5,
        countLeftInTotalRow: 1,
        ms: 100
      },
      {
        id: 3,
        url: "/images/emoji/two/3.png",
        totalRow: 5,
        totalColumn: 5,
        countLeftInTotalRow: 4,
        ms: 100
      },
      {
        id: 4,
        url: "/images/emoji/two/4.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 5,
        url: "/images/emoji/two/5.png",
        totalRow: 2,
        totalColumn: 3,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 6,
        url: "/images/emoji/two/6.png",
        totalRow: 2,
        totalColumn: 3,
        countLeftInTotalRow: 2,
        ms: 100
      },
      {
        id: 7,
        url: "/images/emoji/two/7.png",
        totalRow: 2,
        totalColumn: 3,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 8,
        url: "/images/emoji/two/8.png",
        totalRow: 2,
        totalColumn: 3,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 9,
        url: "/images/emoji/two/9.png",
        totalRow: 2,
        totalColumn: 3,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 10,
        url: "/images/emoji/two/10.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 11,
        url: "/images/emoji/two/11.png",
        totalRow: 3,
        totalColumn: 3,
        countLeftInTotalRow: 2,
        ms: 100
      },
      {
        id: 12,
        url: "/images/emoji/two/12.png",
        totalRow: 2,
        totalColumn: 3,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 13,
        url: "/images/emoji/two/13.png",
        totalRow: 3,
        totalColumn: 3,
        countLeftInTotalRow: 2,
        ms: 100
      },
      {
        id: 14,
        url: "/images/emoji/two/14.png",
        totalRow: 2,
        totalColumn: 3,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 15,
        url: "/images/emoji/two/15.png",
        totalRow: 5,
        totalColumn: 5,
        countLeftInTotalRow: 2,
        ms: 100
      },
      {
        id: 16,
        url: "/images/emoji/two/16.png",
        totalRow: 2,
        totalColumn: 3,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 17,
        url: "/images/emoji/two/17.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 18,
        url: "/images/emoji/two/18.png",
        totalRow: 7,
        totalColumn: 7,
        countLeftInTotalRow: 4,
        ms: 100
      },
      {
        id: 19,
        url: "/images/emoji/two/19.png",
        totalRow: 4,
        totalColumn: 4,
        countLeftInTotalRow: 4,
        ms: 100
      },
      {
        id: 20,
        url: "/images/emoji/two/20.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 3,
        ms: 100
      }
    ]
  },
  {
    label: "/images/emoji/three/label.png",
    items: [
      {
        id: 1,
        url: "/images/emoji/three/1.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 2,
        url: "/images/emoji/three/2.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 3,
        url: "/images/emoji/three/3.png",
        totalRow: 4,
        totalColumn: 4,
        countLeftInTotalRow: 4,
        ms: 100
      },
      {
        id: 4,
        url: "/images/emoji/three/4.png",
        totalRow: 4,
        totalColumn: 4,
        countLeftInTotalRow: 4,
        ms: 100
      },
      {
        id: 4,
        url: "/images/emoji/three/4.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 5,
        url: "/images/emoji/three/5.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 6,
        url: "/images/emoji/three/6.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 7,
        url: "/images/emoji/three/7.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 8,
        url: "/images/emoji/three/8.png",
        totalRow: 4,
        totalColumn: 4,
        countLeftInTotalRow: 4,
        ms: 100
      },
      {
        id: 9,
        url: "/images/emoji/three/9.png",
        totalRow: 4,
        totalColumn: 4,
        countLeftInTotalRow: 4,
        ms: 100
      },
      {
        id: 10,
        url: "/images/emoji/three/10.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 11,
        url: "/images/emoji/three/11.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 12,
        url: "/images/emoji/three/12.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 13,
        url: "/images/emoji/three/13.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 14,
        url: "/images/emoji/three/14.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 15,
        url: "/images/emoji/three/15.png",
        totalRow: 4,
        totalColumn: 4,
        countLeftInTotalRow: 2,
        ms: 100
      },
      {
        id: 16,
        url: "/images/emoji/three/16.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 17,
        url: "/images/emoji/three/17.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 18,
        url: "/images/emoji/three/18.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 19,
        url: "/images/emoji/three/19.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 20,
        url: "/images/emoji/three/20.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 21,
        url: "/images/emoji/three/21.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 3,
        ms: 100
      },
      {
        id: 22,
        url: "/images/emoji/three/22.png",
        totalRow: 4,
        totalColumn: 5,
        countLeftInTotalRow: 5,
        ms: 100
      },
      {
        id: 23,
        url: "/images/emoji/three/23.png",
        totalRow: 4,
        totalColumn: 4,
        countLeftInTotalRow: 4,
        ms: 100
      },
      {
        id: 24,
        url: "/images/emoji/three/24.png",
        totalRow: 4,
        totalColumn: 4,
        countLeftInTotalRow: 4,
        ms: 100
      }
    ]
  }
];
function emojiAll(url2, totalRow, totalColumn, countLeftInTotalRow, ms, isRate = 1) {
  const image = new Image();
  image.src = url2;
  let emoji;
  return new Promise((resolve) => {
    image.onload = () => {
      emoji = document.createElement("div");
      emoji.className = "emoji";
      const widthOne = image.naturalWidth / totalColumn;
      const heightOne = image.naturalHeight / totalRow;
      emoji.style.backgroundImage = `url(${url2})`;
      emoji.style.height = heightOne / isRate + "px";
      emoji.style.width = widthOne / isRate + "px";
      emoji.style.backgroundPosition = `${0}px ${0}px`;
      emoji.setAttribute("width-one", widthOne);
      emoji.setAttribute("height-one", heightOne);
      emoji.setAttribute("count-left-in-total-row", countLeftInTotalRow);
      emoji.setAttribute("total-row", totalRow);
      emoji.setAttribute("total-column", totalColumn);
      emoji.setAttribute("ms", ms);
      resolve(emoji);
    };
  });
}
const emojiUtil = {
  emojiAll,
  addEventEmoji: (element) => {
    const listEventEmoji = [];
    window.addEventListener("event-emoji-" + element.className, (e) => {
      const emoji = e.element;
      const countLeftInTotalRow = emoji.getAttribute("count-left-in-total-row");
      const totalColumn = emoji.getAttribute("total-column");
      const totalRow = emoji.getAttribute("total-row");
      const ms = emoji.getAttribute("ms");
      const widthOne = emoji.getAttribute("width-one");
      const heightOne = emoji.getAttribute("height-one");
      let leftE = 0;
      let topE = 0;
      let countLeft = 0;
      let countTop = 0;
      let indexEmoji = listEventEmoji.findIndex(({ element: element2 }) => element2 === emoji);
      if (indexEmoji === -1) {
        indexEmoji = listEventEmoji.length;
        listEventEmoji[indexEmoji] = {
          element: emoji,
          interval: null
        };
      }
      listEventEmoji[indexEmoji].countInterval = 0;
      !listEventEmoji[indexEmoji].interval && (listEventEmoji[indexEmoji].interval = setInterval(function() {
        if (+countLeft === +totalColumn || +countLeft === +countLeftInTotalRow && +countTop === totalRow - 1) {
          countLeft = 0;
          +countTop++;
        }
        if (countTop === +totalRow) {
          countTop = 0;
        }
        if (leftE === 0 && topE === 0) {
          if (listEventEmoji[indexEmoji].countInterval >= 5) {
            clearInterval(listEventEmoji[indexEmoji].interval);
            listEventEmoji[indexEmoji].interval = null;
          }
          listEventEmoji[indexEmoji].countInterval++;
        }
        emoji.style.backgroundPosition = `${-leftE}px ${-topE}px`;
        leftE = +countLeft * +widthOne;
        topE = +countTop * +heightOne;
        +countLeft++;
      }, ms));
    });
    window.addEventListener("mouseover", (e) => {
      let emojiEl = e.target;
      if (emojiEl.closest(".emoji")) {
        emojiEl = emojiEl.closest(".emoji");
      }
      if (emojiEl.classList.contains("emoji")) {
        eventEmojiAction.element = emojiEl;
        window.dispatchEvent(eventEmojiAction);
      }
    });
    var eventEmojiAction = new Event("event-emoji-" + element.className);
  }
};
function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
function $c770c458706daa72$export$2e2bcd8739ae039(obj, key, value2) {
  if (key in obj)
    Object.defineProperty(obj, key, {
      value: value2,
      enumerable: true,
      configurable: true,
      writable: true
    });
  else
    obj[key] = value2;
  return obj;
}
var $fb96b826c0c5f37a$var$n, $fb96b826c0c5f37a$export$41c562ebe57d11e2, $fb96b826c0c5f37a$var$u, $fb96b826c0c5f37a$var$t, $fb96b826c0c5f37a$var$r, $fb96b826c0c5f37a$var$o, $fb96b826c0c5f37a$var$e = {}, $fb96b826c0c5f37a$var$c = [], $fb96b826c0c5f37a$var$s = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
function $fb96b826c0c5f37a$var$a(n1, l1) {
  for (var u1 in l1)
    n1[u1] = l1[u1];
  return n1;
}
function $fb96b826c0c5f37a$var$h(n2) {
  var l2 = n2.parentNode;
  l2 && l2.removeChild(n2);
}
function $fb96b826c0c5f37a$export$c8a8987d4410bf2d(l3, u2, i1) {
  var t1, r1, o1, f1 = {};
  for (o1 in u2)
    "key" == o1 ? t1 = u2[o1] : "ref" == o1 ? r1 = u2[o1] : f1[o1] = u2[o1];
  if (arguments.length > 2 && (f1.children = arguments.length > 3 ? $fb96b826c0c5f37a$var$n.call(arguments, 2) : i1), "function" == typeof l3 && null != l3.defaultProps)
    for (o1 in l3.defaultProps)
      void 0 === f1[o1] && (f1[o1] = l3.defaultProps[o1]);
  return $fb96b826c0c5f37a$var$y(l3, f1, t1, r1, null);
}
function $fb96b826c0c5f37a$var$y(n3, i2, t2, r2, o2) {
  var f2 = {
    type: n3,
    props: i2,
    key: t2,
    ref: r2,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    __d: void 0,
    __c: null,
    __h: null,
    constructor: void 0,
    __v: null == o2 ? ++$fb96b826c0c5f37a$var$u : o2
  };
  return null == o2 && null != $fb96b826c0c5f37a$export$41c562ebe57d11e2.vnode && $fb96b826c0c5f37a$export$41c562ebe57d11e2.vnode(f2), f2;
}
function $fb96b826c0c5f37a$export$7d1e3a5e95ceca43() {
  return {
    current: null
  };
}
function $fb96b826c0c5f37a$export$ffb0004e005737fa(n4) {
  return n4.children;
}
function $fb96b826c0c5f37a$export$16fa2f45be04daa8(n5, l4) {
  this.props = n5, this.context = l4;
}
function $fb96b826c0c5f37a$var$k(n6, l5) {
  if (null == l5)
    return n6.__ ? $fb96b826c0c5f37a$var$k(n6.__, n6.__.__k.indexOf(n6) + 1) : null;
  for (var u3; l5 < n6.__k.length; l5++)
    if (null != (u3 = n6.__k[l5]) && null != u3.__e)
      return u3.__e;
  return "function" == typeof n6.type ? $fb96b826c0c5f37a$var$k(n6) : null;
}
function $fb96b826c0c5f37a$var$b(n7) {
  var l6, u4;
  if (null != (n7 = n7.__) && null != n7.__c) {
    for (n7.__e = n7.__c.base = null, l6 = 0; l6 < n7.__k.length; l6++)
      if (null != (u4 = n7.__k[l6]) && null != u4.__e) {
        n7.__e = n7.__c.base = u4.__e;
        break;
      }
    return $fb96b826c0c5f37a$var$b(n7);
  }
}
function $fb96b826c0c5f37a$var$m(n8) {
  (!n8.__d && (n8.__d = true) && $fb96b826c0c5f37a$var$t.push(n8) && !$fb96b826c0c5f37a$var$g.__r++ || $fb96b826c0c5f37a$var$o !== $fb96b826c0c5f37a$export$41c562ebe57d11e2.debounceRendering) && (($fb96b826c0c5f37a$var$o = $fb96b826c0c5f37a$export$41c562ebe57d11e2.debounceRendering) || $fb96b826c0c5f37a$var$r)($fb96b826c0c5f37a$var$g);
}
function $fb96b826c0c5f37a$var$g() {
  for (var n9; $fb96b826c0c5f37a$var$g.__r = $fb96b826c0c5f37a$var$t.length; )
    n9 = $fb96b826c0c5f37a$var$t.sort(function(n10, l7) {
      return n10.__v.__b - l7.__v.__b;
    }), $fb96b826c0c5f37a$var$t = [], n9.some(function(n11) {
      var l8, u5, i3, t3, r3, o3;
      n11.__d && (r3 = (t3 = (l8 = n11).__v).__e, (o3 = l8.__P) && (u5 = [], (i3 = $fb96b826c0c5f37a$var$a({}, t3)).__v = t3.__v + 1, $fb96b826c0c5f37a$var$j(o3, t3, i3, l8.__n, void 0 !== o3.ownerSVGElement, null != t3.__h ? [
        r3
      ] : null, u5, null == r3 ? $fb96b826c0c5f37a$var$k(t3) : r3, t3.__h), $fb96b826c0c5f37a$var$z(u5, t3), t3.__e != r3 && $fb96b826c0c5f37a$var$b(t3)));
    });
}
function $fb96b826c0c5f37a$var$w(n12, l9, u6, i4, t4, r4, o4, f3, s1, a1) {
  var h1, v1, p1, _1, b1, m1, g1, w1 = i4 && i4.__k || $fb96b826c0c5f37a$var$c, A1 = w1.length;
  for (u6.__k = [], h1 = 0; h1 < l9.length; h1++)
    if (null != (_1 = u6.__k[h1] = null == (_1 = l9[h1]) || "boolean" == typeof _1 ? null : "string" == typeof _1 || "number" == typeof _1 || "bigint" == typeof _1 ? $fb96b826c0c5f37a$var$y(null, _1, null, null, _1) : Array.isArray(_1) ? $fb96b826c0c5f37a$var$y($fb96b826c0c5f37a$export$ffb0004e005737fa, {
      children: _1
    }, null, null, null) : _1.__b > 0 ? $fb96b826c0c5f37a$var$y(_1.type, _1.props, _1.key, null, _1.__v) : _1)) {
      if (_1.__ = u6, _1.__b = u6.__b + 1, null === (p1 = w1[h1]) || p1 && _1.key == p1.key && _1.type === p1.type)
        w1[h1] = void 0;
      else
        for (v1 = 0; v1 < A1; v1++) {
          if ((p1 = w1[v1]) && _1.key == p1.key && _1.type === p1.type) {
            w1[v1] = void 0;
            break;
          }
          p1 = null;
        }
      $fb96b826c0c5f37a$var$j(n12, _1, p1 = p1 || $fb96b826c0c5f37a$var$e, t4, r4, o4, f3, s1, a1), b1 = _1.__e, (v1 = _1.ref) && p1.ref != v1 && (g1 || (g1 = []), p1.ref && g1.push(p1.ref, null, _1), g1.push(v1, _1.__c || b1, _1)), null != b1 ? (null == m1 && (m1 = b1), "function" == typeof _1.type && _1.__k === p1.__k ? _1.__d = s1 = $fb96b826c0c5f37a$var$x(_1, s1, n12) : s1 = $fb96b826c0c5f37a$var$P(n12, _1, p1, w1, b1, s1), "function" == typeof u6.type && (u6.__d = s1)) : s1 && p1.__e == s1 && s1.parentNode != n12 && (s1 = $fb96b826c0c5f37a$var$k(p1));
    }
  for (u6.__e = m1, h1 = A1; h1--; )
    null != w1[h1] && ("function" == typeof u6.type && null != w1[h1].__e && w1[h1].__e == u6.__d && (u6.__d = $fb96b826c0c5f37a$var$k(i4, h1 + 1)), $fb96b826c0c5f37a$var$N(w1[h1], w1[h1]));
  if (g1)
    for (h1 = 0; h1 < g1.length; h1++)
      $fb96b826c0c5f37a$var$M(g1[h1], g1[++h1], g1[++h1]);
}
function $fb96b826c0c5f37a$var$x(n13, l10, u7) {
  for (var i5, t5 = n13.__k, r5 = 0; t5 && r5 < t5.length; r5++)
    (i5 = t5[r5]) && (i5.__ = n13, l10 = "function" == typeof i5.type ? $fb96b826c0c5f37a$var$x(i5, l10, u7) : $fb96b826c0c5f37a$var$P(u7, i5, i5, t5, i5.__e, l10));
  return l10;
}
function $fb96b826c0c5f37a$export$47e4c5b300681277(n14, l11) {
  return l11 = l11 || [], null == n14 || "boolean" == typeof n14 || (Array.isArray(n14) ? n14.some(function(n15) {
    $fb96b826c0c5f37a$export$47e4c5b300681277(n15, l11);
  }) : l11.push(n14)), l11;
}
function $fb96b826c0c5f37a$var$P(n16, l12, u8, i6, t6, r6) {
  var o5, f4, e1;
  if (void 0 !== l12.__d)
    o5 = l12.__d, l12.__d = void 0;
  else if (null == u8 || t6 != r6 || null == t6.parentNode)
    n:
      if (null == r6 || r6.parentNode !== n16)
        n16.appendChild(t6), o5 = null;
      else {
        for (f4 = r6, e1 = 0; (f4 = f4.nextSibling) && e1 < i6.length; e1 += 2)
          if (f4 == t6)
            break n;
        n16.insertBefore(t6, r6), o5 = r6;
      }
  return void 0 !== o5 ? o5 : t6.nextSibling;
}
function $fb96b826c0c5f37a$var$C(n17, l13, u9, i7, t7) {
  var r7;
  for (r7 in u9)
    "children" === r7 || "key" === r7 || r7 in l13 || $fb96b826c0c5f37a$var$H(n17, r7, null, u9[r7], i7);
  for (r7 in l13)
    t7 && "function" != typeof l13[r7] || "children" === r7 || "key" === r7 || "value" === r7 || "checked" === r7 || u9[r7] === l13[r7] || $fb96b826c0c5f37a$var$H(n17, r7, l13[r7], u9[r7], i7);
}
function $fb96b826c0c5f37a$var$$(n18, l14, u10) {
  "-" === l14[0] ? n18.setProperty(l14, u10) : n18[l14] = null == u10 ? "" : "number" != typeof u10 || $fb96b826c0c5f37a$var$s.test(l14) ? u10 : u10 + "px";
}
function $fb96b826c0c5f37a$var$H(n19, l15, u11, i8, t8) {
  var r8;
  n:
    if ("style" === l15) {
      if ("string" == typeof u11)
        n19.style.cssText = u11;
      else {
        if ("string" == typeof i8 && (n19.style.cssText = i8 = ""), i8)
          for (l15 in i8)
            u11 && l15 in u11 || $fb96b826c0c5f37a$var$$(n19.style, l15, "");
        if (u11)
          for (l15 in u11)
            i8 && u11[l15] === i8[l15] || $fb96b826c0c5f37a$var$$(n19.style, l15, u11[l15]);
      }
    } else if ("o" === l15[0] && "n" === l15[1])
      r8 = l15 !== (l15 = l15.replace(/Capture$/, "")), l15 = l15.toLowerCase() in n19 ? l15.toLowerCase().slice(2) : l15.slice(2), n19.l || (n19.l = {}), n19.l[l15 + r8] = u11, u11 ? i8 || n19.addEventListener(l15, r8 ? $fb96b826c0c5f37a$var$T : $fb96b826c0c5f37a$var$I, r8) : n19.removeEventListener(l15, r8 ? $fb96b826c0c5f37a$var$T : $fb96b826c0c5f37a$var$I, r8);
    else if ("dangerouslySetInnerHTML" !== l15) {
      if (t8)
        l15 = l15.replace(/xlink[H:h]/, "h").replace(/sName$/, "s");
      else if ("href" !== l15 && "list" !== l15 && "form" !== l15 && "tabIndex" !== l15 && "download" !== l15 && l15 in n19)
        try {
          n19[l15] = null == u11 ? "" : u11;
          break n;
        } catch (n) {
        }
      "function" == typeof u11 || (null != u11 && (false !== u11 || "a" === l15[0] && "r" === l15[1]) ? n19.setAttribute(l15, u11) : n19.removeAttribute(l15));
    }
}
function $fb96b826c0c5f37a$var$I(n20) {
  this.l[n20.type + false]($fb96b826c0c5f37a$export$41c562ebe57d11e2.event ? $fb96b826c0c5f37a$export$41c562ebe57d11e2.event(n20) : n20);
}
function $fb96b826c0c5f37a$var$T(n21) {
  this.l[n21.type + true]($fb96b826c0c5f37a$export$41c562ebe57d11e2.event ? $fb96b826c0c5f37a$export$41c562ebe57d11e2.event(n21) : n21);
}
function $fb96b826c0c5f37a$var$j(n22, u12, i9, t9, r9, o6, f5, e2, c1) {
  var s2, h2, v2, y1, p2, k1, b2, m2, g2, x1, A2, P1 = u12.type;
  if (void 0 !== u12.constructor)
    return null;
  null != i9.__h && (c1 = i9.__h, e2 = u12.__e = i9.__e, u12.__h = null, o6 = [
    e2
  ]), (s2 = $fb96b826c0c5f37a$export$41c562ebe57d11e2.__b) && s2(u12);
  try {
    n:
      if ("function" == typeof P1) {
        if (m2 = u12.props, g2 = (s2 = P1.contextType) && t9[s2.__c], x1 = s2 ? g2 ? g2.props.value : s2.__ : t9, i9.__c ? b2 = (h2 = u12.__c = i9.__c).__ = h2.__E : ("prototype" in P1 && P1.prototype.render ? u12.__c = h2 = new P1(m2, x1) : (u12.__c = h2 = new $fb96b826c0c5f37a$export$16fa2f45be04daa8(m2, x1), h2.constructor = P1, h2.render = $fb96b826c0c5f37a$var$O), g2 && g2.sub(h2), h2.props = m2, h2.state || (h2.state = {}), h2.context = x1, h2.__n = t9, v2 = h2.__d = true, h2.__h = []), null == h2.__s && (h2.__s = h2.state), null != P1.getDerivedStateFromProps && (h2.__s == h2.state && (h2.__s = $fb96b826c0c5f37a$var$a({}, h2.__s)), $fb96b826c0c5f37a$var$a(h2.__s, P1.getDerivedStateFromProps(m2, h2.__s))), y1 = h2.props, p2 = h2.state, v2)
          null == P1.getDerivedStateFromProps && null != h2.componentWillMount && h2.componentWillMount(), null != h2.componentDidMount && h2.__h.push(h2.componentDidMount);
        else {
          if (null == P1.getDerivedStateFromProps && m2 !== y1 && null != h2.componentWillReceiveProps && h2.componentWillReceiveProps(m2, x1), !h2.__e && null != h2.shouldComponentUpdate && false === h2.shouldComponentUpdate(m2, h2.__s, x1) || u12.__v === i9.__v) {
            h2.props = m2, h2.state = h2.__s, u12.__v !== i9.__v && (h2.__d = false), h2.__v = u12, u12.__e = i9.__e, u12.__k = i9.__k, u12.__k.forEach(function(n23) {
              n23 && (n23.__ = u12);
            }), h2.__h.length && f5.push(h2);
            break n;
          }
          null != h2.componentWillUpdate && h2.componentWillUpdate(m2, h2.__s, x1), null != h2.componentDidUpdate && h2.__h.push(function() {
            h2.componentDidUpdate(y1, p2, k1);
          });
        }
        h2.context = x1, h2.props = m2, h2.state = h2.__s, (s2 = $fb96b826c0c5f37a$export$41c562ebe57d11e2.__r) && s2(u12), h2.__d = false, h2.__v = u12, h2.__P = n22, s2 = h2.render(h2.props, h2.state, h2.context), h2.state = h2.__s, null != h2.getChildContext && (t9 = $fb96b826c0c5f37a$var$a($fb96b826c0c5f37a$var$a({}, t9), h2.getChildContext())), v2 || null == h2.getSnapshotBeforeUpdate || (k1 = h2.getSnapshotBeforeUpdate(y1, p2)), A2 = null != s2 && s2.type === $fb96b826c0c5f37a$export$ffb0004e005737fa && null == s2.key ? s2.props.children : s2, $fb96b826c0c5f37a$var$w(n22, Array.isArray(A2) ? A2 : [
          A2
        ], u12, i9, t9, r9, o6, f5, e2, c1), h2.base = u12.__e, u12.__h = null, h2.__h.length && f5.push(h2), b2 && (h2.__E = h2.__ = null), h2.__e = false;
      } else
        null == o6 && u12.__v === i9.__v ? (u12.__k = i9.__k, u12.__e = i9.__e) : u12.__e = $fb96b826c0c5f37a$var$L(i9.__e, u12, i9, t9, r9, o6, f5, c1);
    (s2 = $fb96b826c0c5f37a$export$41c562ebe57d11e2.diffed) && s2(u12);
  } catch (n24) {
    u12.__v = null, (c1 || null != o6) && (u12.__e = e2, u12.__h = !!c1, o6[o6.indexOf(e2)] = null), $fb96b826c0c5f37a$export$41c562ebe57d11e2.__e(n24, u12, i9);
  }
}
function $fb96b826c0c5f37a$var$z(n25, u13) {
  $fb96b826c0c5f37a$export$41c562ebe57d11e2.__c && $fb96b826c0c5f37a$export$41c562ebe57d11e2.__c(u13, n25), n25.some(function(u14) {
    try {
      n25 = u14.__h, u14.__h = [], n25.some(function(n26) {
        n26.call(u14);
      });
    } catch (n27) {
      $fb96b826c0c5f37a$export$41c562ebe57d11e2.__e(n27, u14.__v);
    }
  });
}
function $fb96b826c0c5f37a$var$L(l16, u15, i10, t10, r10, o7, f6, c2) {
  var s3, a2, v3, y2 = i10.props, p3 = u15.props, d1 = u15.type, _2 = 0;
  if ("svg" === d1 && (r10 = true), null != o7) {
    for (; _2 < o7.length; _2++)
      if ((s3 = o7[_2]) && "setAttribute" in s3 == !!d1 && (d1 ? s3.localName === d1 : 3 === s3.nodeType)) {
        l16 = s3, o7[_2] = null;
        break;
      }
  }
  if (null == l16) {
    if (null === d1)
      return document.createTextNode(p3);
    l16 = r10 ? document.createElementNS("http://www.w3.org/2000/svg", d1) : document.createElement(d1, p3.is && p3), o7 = null, c2 = false;
  }
  if (null === d1)
    y2 === p3 || c2 && l16.data === p3 || (l16.data = p3);
  else {
    if (o7 = o7 && $fb96b826c0c5f37a$var$n.call(l16.childNodes), a2 = (y2 = i10.props || $fb96b826c0c5f37a$var$e).dangerouslySetInnerHTML, v3 = p3.dangerouslySetInnerHTML, !c2) {
      if (null != o7)
        for (y2 = {}, _2 = 0; _2 < l16.attributes.length; _2++)
          y2[l16.attributes[_2].name] = l16.attributes[_2].value;
      (v3 || a2) && (v3 && (a2 && v3.__html == a2.__html || v3.__html === l16.innerHTML) || (l16.innerHTML = v3 && v3.__html || ""));
    }
    if ($fb96b826c0c5f37a$var$C(l16, p3, y2, r10, c2), v3)
      u15.__k = [];
    else if (_2 = u15.props.children, $fb96b826c0c5f37a$var$w(l16, Array.isArray(_2) ? _2 : [
      _2
    ], u15, i10, t10, r10 && "foreignObject" !== d1, o7, f6, o7 ? o7[0] : i10.__k && $fb96b826c0c5f37a$var$k(i10, 0), c2), null != o7)
      for (_2 = o7.length; _2--; )
        null != o7[_2] && $fb96b826c0c5f37a$var$h(o7[_2]);
    c2 || ("value" in p3 && void 0 !== (_2 = p3.value) && (_2 !== y2.value || _2 !== l16.value || "progress" === d1 && !_2) && $fb96b826c0c5f37a$var$H(l16, "value", _2, y2.value, false), "checked" in p3 && void 0 !== (_2 = p3.checked) && _2 !== l16.checked && $fb96b826c0c5f37a$var$H(l16, "checked", _2, y2.checked, false));
  }
  return l16;
}
function $fb96b826c0c5f37a$var$M(n28, u16, i11) {
  try {
    "function" == typeof n28 ? n28(u16) : n28.current = u16;
  } catch (n29) {
    $fb96b826c0c5f37a$export$41c562ebe57d11e2.__e(n29, i11);
  }
}
function $fb96b826c0c5f37a$var$N(n30, u17, i12) {
  var t11, r11;
  if ($fb96b826c0c5f37a$export$41c562ebe57d11e2.unmount && $fb96b826c0c5f37a$export$41c562ebe57d11e2.unmount(n30), (t11 = n30.ref) && (t11.current && t11.current !== n30.__e || $fb96b826c0c5f37a$var$M(t11, null, u17)), null != (t11 = n30.__c)) {
    if (t11.componentWillUnmount)
      try {
        t11.componentWillUnmount();
      } catch (n31) {
        $fb96b826c0c5f37a$export$41c562ebe57d11e2.__e(n31, u17);
      }
    t11.base = t11.__P = null;
  }
  if (t11 = n30.__k)
    for (r11 = 0; r11 < t11.length; r11++)
      t11[r11] && $fb96b826c0c5f37a$var$N(t11[r11], u17, "function" != typeof n30.type);
  i12 || null == n30.__e || $fb96b826c0c5f37a$var$h(n30.__e), n30.__e = n30.__d = void 0;
}
function $fb96b826c0c5f37a$var$O(n32, l, u18) {
  return this.constructor(n32, u18);
}
function $fb96b826c0c5f37a$export$b3890eb0ae9dca99(u19, i13, t12) {
  var r12, o8, f7;
  $fb96b826c0c5f37a$export$41c562ebe57d11e2.__ && $fb96b826c0c5f37a$export$41c562ebe57d11e2.__(u19, i13), o8 = (r12 = "function" == typeof t12) ? null : t12 && t12.__k || i13.__k, f7 = [], $fb96b826c0c5f37a$var$j(i13, u19 = (!r12 && t12 || i13).__k = $fb96b826c0c5f37a$export$c8a8987d4410bf2d($fb96b826c0c5f37a$export$ffb0004e005737fa, null, [
    u19
  ]), o8 || $fb96b826c0c5f37a$var$e, $fb96b826c0c5f37a$var$e, void 0 !== i13.ownerSVGElement, !r12 && t12 ? [
    t12
  ] : o8 ? null : i13.firstChild ? $fb96b826c0c5f37a$var$n.call(i13.childNodes) : null, f7, !r12 && t12 ? t12 : o8 ? o8.__e : i13.firstChild, r12), $fb96b826c0c5f37a$var$z(f7, u19);
}
$fb96b826c0c5f37a$var$n = $fb96b826c0c5f37a$var$c.slice, $fb96b826c0c5f37a$export$41c562ebe57d11e2 = {
  __e: function(n39, l22) {
    for (var u23, i16, t14; l22 = l22.__; )
      if ((u23 = l22.__c) && !u23.__)
        try {
          if ((i16 = u23.constructor) && null != i16.getDerivedStateFromError && (u23.setState(i16.getDerivedStateFromError(n39)), t14 = u23.__d), null != u23.componentDidCatch && (u23.componentDidCatch(n39), t14 = u23.__d), t14)
            return u23.__E = u23;
        } catch (l23) {
          n39 = l23;
        }
    throw n39;
  }
}, $fb96b826c0c5f37a$var$u = 0, $fb96b826c0c5f37a$export$16fa2f45be04daa8.prototype.setState = function(n41, l24) {
  var u24;
  u24 = null != this.__s && this.__s !== this.state ? this.__s : this.__s = $fb96b826c0c5f37a$var$a({}, this.state), "function" == typeof n41 && (n41 = n41($fb96b826c0c5f37a$var$a({}, u24), this.props)), n41 && $fb96b826c0c5f37a$var$a(u24, n41), null != n41 && this.__v && (l24 && this.__h.push(l24), $fb96b826c0c5f37a$var$m(this));
}, $fb96b826c0c5f37a$export$16fa2f45be04daa8.prototype.forceUpdate = function(n42) {
  this.__v && (this.__e = true, n42 && this.__h.push(n42), $fb96b826c0c5f37a$var$m(this));
}, $fb96b826c0c5f37a$export$16fa2f45be04daa8.prototype.render = $fb96b826c0c5f37a$export$ffb0004e005737fa, $fb96b826c0c5f37a$var$t = [], $fb96b826c0c5f37a$var$r = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, $fb96b826c0c5f37a$var$g.__r = 0;
var $bd9dd35321b03dd4$var$o = 0;
function $bd9dd35321b03dd4$export$34b9dba7ce09269b(_1, e1, n, t, f) {
  var l, s, u = {};
  for (s in e1)
    "ref" == s ? l = e1[s] : u[s] = e1[s];
  var a = {
    type: _1,
    props: u,
    key: n,
    ref: l,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    __d: void 0,
    __c: null,
    __h: null,
    constructor: void 0,
    __v: --$bd9dd35321b03dd4$var$o,
    __source: t,
    __self: f
  };
  if ("function" == typeof _1 && (l = _1.defaultProps))
    for (s in l)
      void 0 === u[s] && (u[s] = l[s]);
  return $fb96b826c0c5f37a$export$41c562ebe57d11e2.vnode && $fb96b826c0c5f37a$export$41c562ebe57d11e2.vnode(a), a;
}
function $f72b75cf796873c7$var$set(key, value2) {
  try {
    window.localStorage[`emoji-mart.${key}`] = JSON.stringify(value2);
  } catch (error) {
  }
}
function $f72b75cf796873c7$var$get(key) {
  try {
    const value2 = window.localStorage[`emoji-mart.${key}`];
    if (value2)
      return JSON.parse(value2);
  } catch (error) {
  }
}
var $f72b75cf796873c7$export$2e2bcd8739ae039 = {
  set: $f72b75cf796873c7$var$set,
  get: $f72b75cf796873c7$var$get
};
const $c84d045dcc34faf5$var$CACHE = /* @__PURE__ */ new Map();
const $c84d045dcc34faf5$var$VERSIONS = [
  {
    v: 14,
    emoji: "🫠"
  },
  {
    v: 13.1,
    emoji: "😶‍🌫️"
  },
  {
    v: 13,
    emoji: "🥸"
  },
  {
    v: 12.1,
    emoji: "🧑‍🦰"
  },
  {
    v: 12,
    emoji: "🥱"
  },
  {
    v: 11,
    emoji: "🥰"
  },
  {
    v: 5,
    emoji: "🤩"
  },
  {
    v: 4,
    emoji: "👱‍♀️"
  },
  {
    v: 3,
    emoji: "🤣"
  },
  {
    v: 2,
    emoji: "👋🏻"
  },
  {
    v: 1,
    emoji: "🙃"
  }
];
function $c84d045dcc34faf5$var$latestVersion() {
  for (const { v, emoji } of $c84d045dcc34faf5$var$VERSIONS) {
    if ($c84d045dcc34faf5$var$isSupported(emoji))
      return v;
  }
}
function $c84d045dcc34faf5$var$noCountryFlags() {
  if ($c84d045dcc34faf5$var$isSupported("🇨🇦"))
    return false;
  return true;
}
function $c84d045dcc34faf5$var$isSupported(emoji) {
  if ($c84d045dcc34faf5$var$CACHE.has(emoji))
    return $c84d045dcc34faf5$var$CACHE.get(emoji);
  const supported = $c84d045dcc34faf5$var$isEmojiSupported(emoji);
  $c84d045dcc34faf5$var$CACHE.set(emoji, supported);
  return supported;
}
const $c84d045dcc34faf5$var$isEmojiSupported = (() => {
  let ctx = null;
  try {
    if (!navigator.userAgent.includes("jsdom"))
      ctx = document.createElement("canvas").getContext("2d", {
        willReadFrequently: true
      });
  } catch {
  }
  if (!ctx)
    return () => false;
  const CANVAS_HEIGHT = 25;
  const CANVAS_WIDTH = 20;
  const textSize = Math.floor(CANVAS_HEIGHT / 2);
  ctx.font = textSize + "px Arial, Sans-Serif";
  ctx.textBaseline = "top";
  ctx.canvas.width = CANVAS_WIDTH * 2;
  ctx.canvas.height = CANVAS_HEIGHT;
  return (unicode) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH * 2, CANVAS_HEIGHT);
    ctx.fillStyle = "#FF0000";
    ctx.fillText(unicode, 0, 22);
    ctx.fillStyle = "#0000FF";
    ctx.fillText(unicode, CANVAS_WIDTH, 22);
    const a = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
    const count = a.length;
    let i2 = 0;
    for (; i2 < count && !a[i2 + 3]; i2 += 4)
      ;
    if (i2 >= count)
      return false;
    const x = CANVAS_WIDTH + i2 / 4 % CANVAS_WIDTH;
    const y = Math.floor(i2 / 4 / CANVAS_WIDTH);
    const b = ctx.getImageData(x, y, 1, 1).data;
    if (a[i2] !== b[0] || a[i2 + 2] !== b[2])
      return false;
    if (ctx.measureText(unicode).width >= CANVAS_WIDTH)
      return false;
    return true;
  };
})();
var $c84d045dcc34faf5$export$2e2bcd8739ae039 = {
  latestVersion: $c84d045dcc34faf5$var$latestVersion,
  noCountryFlags: $c84d045dcc34faf5$var$noCountryFlags
};
const $b22cfd0a55410b4f$var$DEFAULTS = [
  "+1",
  "grinning",
  "kissing_heart",
  "heart_eyes",
  "laughing",
  "stuck_out_tongue_winking_eye",
  "sweat_smile",
  "joy",
  "scream",
  "disappointed",
  "unamused",
  "weary",
  "sob",
  "sunglasses",
  "heart"
];
let $b22cfd0a55410b4f$var$Index = null;
function $b22cfd0a55410b4f$var$add(emoji) {
  $b22cfd0a55410b4f$var$Index || ($b22cfd0a55410b4f$var$Index = $f72b75cf796873c7$export$2e2bcd8739ae039.get("frequently") || {});
  const emojiId = emoji.id || emoji;
  if (!emojiId)
    return;
  $b22cfd0a55410b4f$var$Index[emojiId] || ($b22cfd0a55410b4f$var$Index[emojiId] = 0);
  $b22cfd0a55410b4f$var$Index[emojiId] += 1;
  $f72b75cf796873c7$export$2e2bcd8739ae039.set("last", emojiId);
  $f72b75cf796873c7$export$2e2bcd8739ae039.set("frequently", $b22cfd0a55410b4f$var$Index);
}
function $b22cfd0a55410b4f$var$get({ maxFrequentRows, perLine }) {
  if (!maxFrequentRows)
    return [];
  $b22cfd0a55410b4f$var$Index || ($b22cfd0a55410b4f$var$Index = $f72b75cf796873c7$export$2e2bcd8739ae039.get("frequently"));
  let emojiIds = [];
  if (!$b22cfd0a55410b4f$var$Index) {
    $b22cfd0a55410b4f$var$Index = {};
    for (let i2 in $b22cfd0a55410b4f$var$DEFAULTS.slice(0, perLine)) {
      const emojiId = $b22cfd0a55410b4f$var$DEFAULTS[i2];
      $b22cfd0a55410b4f$var$Index[emojiId] = perLine - i2;
      emojiIds.push(emojiId);
    }
    return emojiIds;
  }
  const max = maxFrequentRows * perLine;
  const last = $f72b75cf796873c7$export$2e2bcd8739ae039.get("last");
  for (let emojiId in $b22cfd0a55410b4f$var$Index)
    emojiIds.push(emojiId);
  emojiIds.sort((a, b) => {
    const aScore = $b22cfd0a55410b4f$var$Index[b];
    const bScore = $b22cfd0a55410b4f$var$Index[a];
    if (aScore == bScore)
      return a.localeCompare(b);
    return aScore - bScore;
  });
  if (emojiIds.length > max) {
    const removedIds = emojiIds.slice(max);
    emojiIds = emojiIds.slice(0, max);
    for (let removedId of removedIds) {
      if (removedId == last)
        continue;
      delete $b22cfd0a55410b4f$var$Index[removedId];
    }
    if (last && emojiIds.indexOf(last) == -1) {
      delete $b22cfd0a55410b4f$var$Index[emojiIds[emojiIds.length - 1]];
      emojiIds.splice(-1, 1, last);
    }
    $f72b75cf796873c7$export$2e2bcd8739ae039.set("frequently", $b22cfd0a55410b4f$var$Index);
  }
  return emojiIds;
}
var $b22cfd0a55410b4f$export$2e2bcd8739ae039 = {
  add: $b22cfd0a55410b4f$var$add,
  get: $b22cfd0a55410b4f$var$get,
  DEFAULTS: $b22cfd0a55410b4f$var$DEFAULTS
};
var $8d50d93417ef682a$exports = {};
$8d50d93417ef682a$exports = JSON.parse('{"search":"Search","search_no_results_1":"Oh no!","search_no_results_2":"That emoji couldn’t be found","pick":"Pick an emoji…","add_custom":"Add custom emoji","categories":{"activity":"Activity","custom":"Custom","flags":"Flags","foods":"Food & Drink","frequent":"Frequently used","nature":"Animals & Nature","objects":"Objects","people":"Smileys & People","places":"Travel & Places","search":"Search Results","symbols":"Symbols"},"skins":{"1":"Default","2":"Light","3":"Medium-Light","4":"Medium","5":"Medium-Dark","6":"Dark","choose":"Choose default skin tone"}}');
var $b247ea80b67298d5$export$2e2bcd8739ae039 = {
  autoFocus: {
    value: false
  },
  dynamicWidth: {
    value: false
  },
  emojiButtonColors: {
    value: null
  },
  emojiButtonRadius: {
    value: "100%"
  },
  emojiButtonSize: {
    value: 36
  },
  emojiSize: {
    value: 24
  },
  emojiVersion: {
    value: 14,
    choices: [
      1,
      2,
      3,
      4,
      5,
      11,
      12,
      12.1,
      13,
      13.1,
      14
    ]
  },
  exceptEmojis: {
    value: []
  },
  icons: {
    value: "auto",
    choices: [
      "auto",
      "outline",
      "solid"
    ]
  },
  locale: {
    value: "en",
    choices: [
      "en",
      "ar",
      "be",
      "cs",
      "de",
      "es",
      "fa",
      "fi",
      "fr",
      "hi",
      "it",
      "ja",
      "kr",
      "nl",
      "pl",
      "pt",
      "ru",
      "sa",
      "tr",
      "uk",
      "vi",
      "zh"
    ]
  },
  maxFrequentRows: {
    value: 4
  },
  navPosition: {
    value: "top",
    choices: [
      "top",
      "bottom",
      "none"
    ]
  },
  noCountryFlags: {
    value: false
  },
  noResultsEmoji: {
    value: null
  },
  perLine: {
    value: 9
  },
  previewEmoji: {
    value: null
  },
  previewPosition: {
    value: "bottom",
    choices: [
      "top",
      "bottom",
      "none"
    ]
  },
  searchPosition: {
    value: "sticky",
    choices: [
      "sticky",
      "static",
      "none"
    ]
  },
  set: {
    value: "native",
    choices: [
      "native",
      "apple",
      "facebook",
      "google",
      "twitter"
    ]
  },
  skin: {
    value: 1,
    choices: [
      1,
      2,
      3,
      4,
      5,
      6
    ]
  },
  skinTonePosition: {
    value: "preview",
    choices: [
      "preview",
      "search",
      "none"
    ]
  },
  theme: {
    value: "auto",
    choices: [
      "auto",
      "light",
      "dark"
    ]
  },
  // Data
  categories: null,
  categoryIcons: null,
  custom: null,
  data: null,
  i18n: null,
  // Callbacks
  getImageURL: null,
  getSpritesheetURL: null,
  onAddCustomEmoji: null,
  onClickOutside: null,
  onEmojiSelect: null,
  // Deprecated
  stickySearch: {
    deprecated: true,
    value: true
  }
};
let $7adb23b0109cc36a$export$dbe3113d60765c1a = null;
let $7adb23b0109cc36a$export$2d0294657ab35f1b = null;
const $7adb23b0109cc36a$var$fetchCache = {};
async function $7adb23b0109cc36a$var$fetchJSON(src) {
  if ($7adb23b0109cc36a$var$fetchCache[src])
    return $7adb23b0109cc36a$var$fetchCache[src];
  const response = await fetch(src);
  const json = await response.json();
  $7adb23b0109cc36a$var$fetchCache[src] = json;
  return json;
}
let $7adb23b0109cc36a$var$promise = null;
let $7adb23b0109cc36a$var$initCallback = null;
let $7adb23b0109cc36a$var$initialized = false;
function $7adb23b0109cc36a$export$2cd8252107eb640b(options, { caller } = {}) {
  $7adb23b0109cc36a$var$promise || ($7adb23b0109cc36a$var$promise = new Promise((resolve) => {
    $7adb23b0109cc36a$var$initCallback = resolve;
  }));
  if (options)
    $7adb23b0109cc36a$var$_init(options);
  else if (caller && !$7adb23b0109cc36a$var$initialized)
    console.warn(`\`${caller}\` requires data to be initialized first. Promise will be pending until \`init\` is called.`);
  return $7adb23b0109cc36a$var$promise;
}
async function $7adb23b0109cc36a$var$_init(props) {
  $7adb23b0109cc36a$var$initialized = true;
  let { emojiVersion, set, locale } = props;
  emojiVersion || (emojiVersion = $b247ea80b67298d5$export$2e2bcd8739ae039.emojiVersion.value);
  set || (set = $b247ea80b67298d5$export$2e2bcd8739ae039.set.value);
  locale || (locale = $b247ea80b67298d5$export$2e2bcd8739ae039.locale.value);
  if (!$7adb23b0109cc36a$export$2d0294657ab35f1b) {
    $7adb23b0109cc36a$export$2d0294657ab35f1b = (typeof props.data === "function" ? await props.data() : props.data) || await $7adb23b0109cc36a$var$fetchJSON(`https://cdn.jsdelivr.net/npm/@emoji-mart/data@latest/sets/${emojiVersion}/${set}.json`);
    $7adb23b0109cc36a$export$2d0294657ab35f1b.emoticons = {};
    $7adb23b0109cc36a$export$2d0294657ab35f1b.natives = {};
    $7adb23b0109cc36a$export$2d0294657ab35f1b.categories.unshift({
      id: "frequent",
      emojis: []
    });
    for (const alias in $7adb23b0109cc36a$export$2d0294657ab35f1b.aliases) {
      const emojiId = $7adb23b0109cc36a$export$2d0294657ab35f1b.aliases[alias];
      const emoji = $7adb23b0109cc36a$export$2d0294657ab35f1b.emojis[emojiId];
      if (!emoji)
        continue;
      emoji.aliases || (emoji.aliases = []);
      emoji.aliases.push(alias);
    }
    $7adb23b0109cc36a$export$2d0294657ab35f1b.originalCategories = $7adb23b0109cc36a$export$2d0294657ab35f1b.categories;
  } else
    $7adb23b0109cc36a$export$2d0294657ab35f1b.categories = $7adb23b0109cc36a$export$2d0294657ab35f1b.categories.filter((c) => {
      const isCustom = !!c.name;
      if (!isCustom)
        return true;
      return false;
    });
  $7adb23b0109cc36a$export$dbe3113d60765c1a = (typeof props.i18n === "function" ? await props.i18n() : props.i18n) || (locale == "en" ? /* @__PURE__ */ $parcel$interopDefault($8d50d93417ef682a$exports) : await $7adb23b0109cc36a$var$fetchJSON(`https://cdn.jsdelivr.net/npm/@emoji-mart/data@latest/i18n/${locale}.json`));
  if (props.custom)
    for (let i2 in props.custom) {
      i2 = parseInt(i2);
      const category = props.custom[i2];
      const prevCategory = props.custom[i2 - 1];
      if (!category.emojis || !category.emojis.length)
        continue;
      category.id || (category.id = `custom_${i2 + 1}`);
      category.name || (category.name = $7adb23b0109cc36a$export$dbe3113d60765c1a.categories.custom);
      if (prevCategory && !category.icon)
        category.target = prevCategory.target || prevCategory;
      $7adb23b0109cc36a$export$2d0294657ab35f1b.categories.push(category);
      for (const emoji of category.emojis)
        $7adb23b0109cc36a$export$2d0294657ab35f1b.emojis[emoji.id] = emoji;
    }
  if (props.categories)
    $7adb23b0109cc36a$export$2d0294657ab35f1b.categories = $7adb23b0109cc36a$export$2d0294657ab35f1b.originalCategories.filter((c) => {
      return props.categories.indexOf(c.id) != -1;
    }).sort((c1, c2) => {
      const i1 = props.categories.indexOf(c1.id);
      const i2 = props.categories.indexOf(c2.id);
      return i1 - i2;
    });
  let latestVersionSupport = null;
  let noCountryFlags = null;
  if (set == "native") {
    latestVersionSupport = $c84d045dcc34faf5$export$2e2bcd8739ae039.latestVersion();
    noCountryFlags = props.noCountryFlags || $c84d045dcc34faf5$export$2e2bcd8739ae039.noCountryFlags();
  }
  let categoryIndex = $7adb23b0109cc36a$export$2d0294657ab35f1b.categories.length;
  let resetSearchIndex = false;
  while (categoryIndex--) {
    const category = $7adb23b0109cc36a$export$2d0294657ab35f1b.categories[categoryIndex];
    if (category.id == "frequent") {
      let { maxFrequentRows, perLine } = props;
      maxFrequentRows = maxFrequentRows >= 0 ? maxFrequentRows : $b247ea80b67298d5$export$2e2bcd8739ae039.maxFrequentRows.value;
      perLine || (perLine = $b247ea80b67298d5$export$2e2bcd8739ae039.perLine.value);
      category.emojis = $b22cfd0a55410b4f$export$2e2bcd8739ae039.get({
        maxFrequentRows,
        perLine
      });
    }
    if (!category.emojis || !category.emojis.length) {
      $7adb23b0109cc36a$export$2d0294657ab35f1b.categories.splice(categoryIndex, 1);
      continue;
    }
    const { categoryIcons } = props;
    if (categoryIcons) {
      const icon = categoryIcons[category.id];
      if (icon && !category.icon)
        category.icon = icon;
    }
    let emojiIndex = category.emojis.length;
    while (emojiIndex--) {
      const emojiId = category.emojis[emojiIndex];
      const emoji = emojiId.id ? emojiId : $7adb23b0109cc36a$export$2d0294657ab35f1b.emojis[emojiId];
      const ignore = () => {
        category.emojis.splice(emojiIndex, 1);
      };
      if (!emoji || props.exceptEmojis && props.exceptEmojis.includes(emoji.id)) {
        ignore();
        continue;
      }
      if (latestVersionSupport && emoji.version > latestVersionSupport) {
        ignore();
        continue;
      }
      if (noCountryFlags && category.id == "flags") {
        if (!$e6eae5155b87f591$export$bcb25aa587e9cb13.includes(emoji.id)) {
          ignore();
          continue;
        }
      }
      if (!emoji.search) {
        resetSearchIndex = true;
        emoji.search = "," + [
          [
            emoji.id,
            false
          ],
          [
            emoji.name,
            true
          ],
          [
            emoji.keywords,
            false
          ],
          [
            emoji.emoticons,
            false
          ]
        ].map(([strings, split]) => {
          if (!strings)
            return;
          return (Array.isArray(strings) ? strings : [
            strings
          ]).map((string) => {
            return (split ? string.split(/[-|_|\s]+/) : [
              string
            ]).map((s) => s.toLowerCase());
          }).flat();
        }).flat().filter((a) => a && a.trim()).join(",");
        if (emoji.emoticons)
          for (const emoticon of emoji.emoticons) {
            if ($7adb23b0109cc36a$export$2d0294657ab35f1b.emoticons[emoticon])
              continue;
            $7adb23b0109cc36a$export$2d0294657ab35f1b.emoticons[emoticon] = emoji.id;
          }
        let skinIndex = 0;
        for (const skin of emoji.skins) {
          if (!skin)
            continue;
          skinIndex++;
          const { native } = skin;
          if (native) {
            $7adb23b0109cc36a$export$2d0294657ab35f1b.natives[native] = emoji.id;
            emoji.search += `,${native}`;
          }
          const skinShortcodes = skinIndex == 1 ? "" : `:skin-tone-${skinIndex}:`;
          skin.shortcodes = `:${emoji.id}:${skinShortcodes}`;
        }
      }
    }
  }
  if (resetSearchIndex)
    $c4d155af13ad4d4b$export$2e2bcd8739ae039.reset();
  $7adb23b0109cc36a$var$initCallback();
}
function $7adb23b0109cc36a$export$75fe5f91d452f94b(props, defaultProps, element) {
  props || (props = {});
  const _props = {};
  for (let k in defaultProps)
    _props[k] = $7adb23b0109cc36a$export$88c9ddb45cea7241(k, props, defaultProps, element);
  return _props;
}
function $7adb23b0109cc36a$export$88c9ddb45cea7241(propName, props, defaultProps, element) {
  const defaults = defaultProps[propName];
  let value2 = element && element.getAttribute(propName) || (props[propName] != null && props[propName] != void 0 ? props[propName] : null);
  if (!defaults)
    return value2;
  if (value2 != null && defaults.value && typeof defaults.value != typeof value2) {
    if (typeof defaults.value == "boolean")
      value2 = value2 == "false" ? false : true;
    else
      value2 = defaults.value.constructor(value2);
  }
  if (defaults.transform && value2)
    value2 = defaults.transform(value2);
  if (value2 == null || defaults.choices && defaults.choices.indexOf(value2) == -1)
    value2 = defaults.value;
  return value2;
}
const $c4d155af13ad4d4b$var$SHORTCODES_REGEX = /^(?:\:([^\:]+)\:)(?:\:skin-tone-(\d)\:)?$/;
let $c4d155af13ad4d4b$var$Pool = null;
function $c4d155af13ad4d4b$var$get(emojiId) {
  if (emojiId.id)
    return emojiId;
  return $7adb23b0109cc36a$export$2d0294657ab35f1b.emojis[emojiId] || $7adb23b0109cc36a$export$2d0294657ab35f1b.emojis[$7adb23b0109cc36a$export$2d0294657ab35f1b.aliases[emojiId]] || $7adb23b0109cc36a$export$2d0294657ab35f1b.emojis[$7adb23b0109cc36a$export$2d0294657ab35f1b.natives[emojiId]];
}
function $c4d155af13ad4d4b$var$reset() {
  $c4d155af13ad4d4b$var$Pool = null;
}
async function $c4d155af13ad4d4b$var$search(value2, { maxResults, caller } = {}) {
  if (!value2 || !value2.trim().length)
    return null;
  maxResults || (maxResults = 90);
  await $7adb23b0109cc36a$export$2cd8252107eb640b(null, {
    caller: caller || "SearchIndex.search"
  });
  const values = value2.toLowerCase().replace(/(\w)-/, "$1 ").split(/[\s|,]+/).filter((word, i2, words) => {
    return word.trim() && words.indexOf(word) == i2;
  });
  if (!values.length)
    return;
  let pool = $c4d155af13ad4d4b$var$Pool || ($c4d155af13ad4d4b$var$Pool = Object.values($7adb23b0109cc36a$export$2d0294657ab35f1b.emojis));
  let results, scores;
  for (const value1 of values) {
    if (!pool.length)
      break;
    results = [];
    scores = {};
    for (const emoji of pool) {
      if (!emoji.search)
        continue;
      const score = emoji.search.indexOf(`,${value1}`);
      if (score == -1)
        continue;
      results.push(emoji);
      scores[emoji.id] || (scores[emoji.id] = 0);
      scores[emoji.id] += emoji.id == value1 ? 0 : score + 1;
    }
    pool = results;
  }
  if (results.length < 2)
    return results;
  results.sort((a, b) => {
    const aScore = scores[a.id];
    const bScore = scores[b.id];
    if (aScore == bScore)
      return a.id.localeCompare(b.id);
    return aScore - bScore;
  });
  if (results.length > maxResults)
    results = results.slice(0, maxResults);
  return results;
}
var $c4d155af13ad4d4b$export$2e2bcd8739ae039 = {
  search: $c4d155af13ad4d4b$var$search,
  get: $c4d155af13ad4d4b$var$get,
  reset: $c4d155af13ad4d4b$var$reset,
  SHORTCODES_REGEX: $c4d155af13ad4d4b$var$SHORTCODES_REGEX
};
const $e6eae5155b87f591$export$bcb25aa587e9cb13 = [
  "checkered_flag",
  "crossed_flags",
  "pirate_flag",
  "rainbow-flag",
  "transgender_flag",
  "triangular_flag_on_post",
  "waving_black_flag",
  "waving_white_flag"
];
function $693b183b0a78708f$export$9cb4719e2e525b7a(a, b) {
  return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val == b[index]);
}
async function $693b183b0a78708f$export$e772c8ff12451969(frames = 1) {
  for (let _ in [
    ...Array(frames).keys()
  ])
    await new Promise(requestAnimationFrame);
}
function $693b183b0a78708f$export$d10ac59fbe52a745(emoji, { skinIndex = 0 } = {}) {
  const skin = emoji.skins[skinIndex] || (() => {
    skinIndex = 0;
    return emoji.skins[skinIndex];
  })();
  const emojiData = {
    id: emoji.id,
    name: emoji.name,
    native: skin.native,
    unified: skin.unified,
    keywords: emoji.keywords,
    shortcodes: skin.shortcodes || emoji.shortcodes
  };
  if (emoji.skins.length > 1)
    emojiData.skin = skinIndex + 1;
  if (skin.src)
    emojiData.src = skin.src;
  if (emoji.aliases && emoji.aliases.length)
    emojiData.aliases = emoji.aliases;
  if (emoji.emoticons && emoji.emoticons.length)
    emojiData.emoticons = emoji.emoticons;
  return emojiData;
}
const $fcccfb36ed0cde68$var$categories = {
  activity: {
    outline: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
        d: "M12 0C5.373 0 0 5.372 0 12c0 6.627 5.373 12 12 12 6.628 0 12-5.373 12-12 0-6.628-5.372-12-12-12m9.949 11H17.05c.224-2.527 1.232-4.773 1.968-6.113A9.966 9.966 0 0 1 21.949 11M13 11V2.051a9.945 9.945 0 0 1 4.432 1.564c-.858 1.491-2.156 4.22-2.392 7.385H13zm-2 0H8.961c-.238-3.165-1.536-5.894-2.393-7.385A9.95 9.95 0 0 1 11 2.051V11zm0 2v8.949a9.937 9.937 0 0 1-4.432-1.564c.857-1.492 2.155-4.221 2.393-7.385H11zm4.04 0c.236 3.164 1.534 5.893 2.392 7.385A9.92 9.92 0 0 1 13 21.949V13h2.04zM4.982 4.887C5.718 6.227 6.726 8.473 6.951 11h-4.9a9.977 9.977 0 0 1 2.931-6.113M2.051 13h4.9c-.226 2.527-1.233 4.771-1.969 6.113A9.972 9.972 0 0 1 2.051 13m16.967 6.113c-.735-1.342-1.744-3.586-1.968-6.113h4.899a9.961 9.961 0 0 1-2.931 6.113"
      })
    }),
    solid: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 512 512",
      children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
        d: "M16.17 337.5c0 44.98 7.565 83.54 13.98 107.9C35.22 464.3 50.46 496 174.9 496c9.566 0 19.59-.4707 29.84-1.271L17.33 307.3C16.53 317.6 16.17 327.7 16.17 337.5zM495.8 174.5c0-44.98-7.565-83.53-13.98-107.9c-4.688-17.54-18.34-31.23-36.04-35.95C435.5 27.91 392.9 16 337 16c-9.564 0-19.59 .4707-29.84 1.271l187.5 187.5C495.5 194.4 495.8 184.3 495.8 174.5zM26.77 248.8l236.3 236.3c142-36.1 203.9-150.4 222.2-221.1L248.9 26.87C106.9 62.96 45.07 177.2 26.77 248.8zM256 335.1c0 9.141-7.474 16-16 16c-4.094 0-8.188-1.564-11.31-4.689L164.7 283.3C161.6 280.2 160 276.1 160 271.1c0-8.529 6.865-16 16-16c4.095 0 8.189 1.562 11.31 4.688l64.01 64C254.4 327.8 256 331.9 256 335.1zM304 287.1c0 9.141-7.474 16-16 16c-4.094 0-8.188-1.564-11.31-4.689L212.7 235.3C209.6 232.2 208 228.1 208 223.1c0-9.141 7.473-16 16-16c4.094 0 8.188 1.562 11.31 4.688l64.01 64.01C302.5 279.8 304 283.9 304 287.1zM256 175.1c0-9.141 7.473-16 16-16c4.094 0 8.188 1.562 11.31 4.688l64.01 64.01c3.125 3.125 4.688 7.219 4.688 11.31c0 9.133-7.468 16-16 16c-4.094 0-8.189-1.562-11.31-4.688l-64.01-64.01C257.6 184.2 256 180.1 256 175.1z"
      })
    })
  },
  custom: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 448 512",
    children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
      d: "M417.1 368c-5.937 10.27-16.69 16-27.75 16c-5.422 0-10.92-1.375-15.97-4.281L256 311.4V448c0 17.67-14.33 32-31.1 32S192 465.7 192 448V311.4l-118.3 68.29C68.67 382.6 63.17 384 57.75 384c-11.06 0-21.81-5.734-27.75-16c-8.828-15.31-3.594-34.88 11.72-43.72L159.1 256L41.72 187.7C26.41 178.9 21.17 159.3 29.1 144C36.63 132.5 49.26 126.7 61.65 128.2C65.78 128.7 69.88 130.1 73.72 132.3L192 200.6V64c0-17.67 14.33-32 32-32S256 46.33 256 64v136.6l118.3-68.29c3.838-2.213 7.939-3.539 12.07-4.051C398.7 126.7 411.4 132.5 417.1 144c8.828 15.31 3.594 34.88-11.72 43.72L288 256l118.3 68.28C421.6 333.1 426.8 352.7 417.1 368z"
    })
  }),
  flags: {
    outline: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
        d: "M0 0l6.084 24H8L1.916 0zM21 5h-4l-1-4H4l3 12h3l1 4h13L21 5zM6.563 3h7.875l2 8H8.563l-2-8zm8.832 10l-2.856 1.904L12.063 13h3.332zM19 13l-1.5-6h1.938l2 8H16l3-2z"
      })
    }),
    solid: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 512 512",
      children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
        d: "M64 496C64 504.8 56.75 512 48 512h-32C7.25 512 0 504.8 0 496V32c0-17.75 14.25-32 32-32s32 14.25 32 32V496zM476.3 0c-6.365 0-13.01 1.35-19.34 4.233c-45.69 20.86-79.56 27.94-107.8 27.94c-59.96 0-94.81-31.86-163.9-31.87C160.9 .3055 131.6 4.867 96 15.75v350.5c32-9.984 59.87-14.1 84.85-14.1c73.63 0 124.9 31.78 198.6 31.78c31.91 0 68.02-5.971 111.1-23.09C504.1 355.9 512 344.4 512 332.1V30.73C512 11.1 495.3 0 476.3 0z"
      })
    })
  },
  foods: {
    outline: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
        d: "M17 4.978c-1.838 0-2.876.396-3.68.934.513-1.172 1.768-2.934 4.68-2.934a1 1 0 0 0 0-2c-2.921 0-4.629 1.365-5.547 2.512-.064.078-.119.162-.18.244C11.73 1.838 10.798.023 9.207.023 8.579.022 7.85.306 7 .978 5.027 2.54 5.329 3.902 6.492 4.999 3.609 5.222 0 7.352 0 12.969c0 4.582 4.961 11.009 9 11.009 1.975 0 2.371-.486 3-1 .629.514 1.025 1 3 1 4.039 0 9-6.418 9-11 0-5.953-4.055-8-7-8M8.242 2.546c.641-.508.943-.523.965-.523.426.169.975 1.405 1.357 3.055-1.527-.629-2.741-1.352-2.98-1.846.059-.112.241-.356.658-.686M15 21.978c-1.08 0-1.21-.109-1.559-.402l-.176-.146c-.367-.302-.816-.452-1.266-.452s-.898.15-1.266.452l-.176.146c-.347.292-.477.402-1.557.402-2.813 0-7-5.389-7-9.009 0-5.823 4.488-5.991 5-5.991 1.939 0 2.484.471 3.387 1.251l.323.276a1.995 1.995 0 0 0 2.58 0l.323-.276c.902-.78 1.447-1.251 3.387-1.251.512 0 5 .168 5 6 0 3.617-4.187 9-7 9"
      })
    }),
    solid: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 512 512",
      children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
        d: "M481.9 270.1C490.9 279.1 496 291.3 496 304C496 316.7 490.9 328.9 481.9 337.9C472.9 346.9 460.7 352 448 352H64C51.27 352 39.06 346.9 30.06 337.9C21.06 328.9 16 316.7 16 304C16 291.3 21.06 279.1 30.06 270.1C39.06 261.1 51.27 256 64 256H448C460.7 256 472.9 261.1 481.9 270.1zM475.3 388.7C478.3 391.7 480 395.8 480 400V416C480 432.1 473.3 449.3 461.3 461.3C449.3 473.3 432.1 480 416 480H96C79.03 480 62.75 473.3 50.75 461.3C38.74 449.3 32 432.1 32 416V400C32 395.8 33.69 391.7 36.69 388.7C39.69 385.7 43.76 384 48 384H464C468.2 384 472.3 385.7 475.3 388.7zM50.39 220.8C45.93 218.6 42.03 215.5 38.97 211.6C35.91 207.7 33.79 203.2 32.75 198.4C31.71 193.5 31.8 188.5 32.99 183.7C54.98 97.02 146.5 32 256 32C365.5 32 457 97.02 479 183.7C480.2 188.5 480.3 193.5 479.2 198.4C478.2 203.2 476.1 207.7 473 211.6C469.1 215.5 466.1 218.6 461.6 220.8C457.2 222.9 452.3 224 447.3 224H64.67C59.73 224 54.84 222.9 50.39 220.8zM372.7 116.7C369.7 119.7 368 123.8 368 128C368 131.2 368.9 134.3 370.7 136.9C372.5 139.5 374.1 141.6 377.9 142.8C380.8 143.1 384 144.3 387.1 143.7C390.2 143.1 393.1 141.6 395.3 139.3C397.6 137.1 399.1 134.2 399.7 131.1C400.3 128 399.1 124.8 398.8 121.9C397.6 118.1 395.5 116.5 392.9 114.7C390.3 112.9 387.2 111.1 384 111.1C379.8 111.1 375.7 113.7 372.7 116.7V116.7zM244.7 84.69C241.7 87.69 240 91.76 240 96C240 99.16 240.9 102.3 242.7 104.9C244.5 107.5 246.1 109.6 249.9 110.8C252.8 111.1 256 112.3 259.1 111.7C262.2 111.1 265.1 109.6 267.3 107.3C269.6 105.1 271.1 102.2 271.7 99.12C272.3 96.02 271.1 92.8 270.8 89.88C269.6 86.95 267.5 84.45 264.9 82.7C262.3 80.94 259.2 79.1 256 79.1C251.8 79.1 247.7 81.69 244.7 84.69V84.69zM116.7 116.7C113.7 119.7 112 123.8 112 128C112 131.2 112.9 134.3 114.7 136.9C116.5 139.5 118.1 141.6 121.9 142.8C124.8 143.1 128 144.3 131.1 143.7C134.2 143.1 137.1 141.6 139.3 139.3C141.6 137.1 143.1 134.2 143.7 131.1C144.3 128 143.1 124.8 142.8 121.9C141.6 118.1 139.5 116.5 136.9 114.7C134.3 112.9 131.2 111.1 128 111.1C123.8 111.1 119.7 113.7 116.7 116.7L116.7 116.7z"
      })
    })
  },
  frequent: {
    outline: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      children: [
        /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
          d: "M13 4h-2l-.001 7H9v2h2v2h2v-2h4v-2h-4z"
        }),
        /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
          d: "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0m0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10"
        })
      ]
    }),
    solid: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 512 512",
      children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
        d: "M256 512C114.6 512 0 397.4 0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512zM232 256C232 264 236 271.5 242.7 275.1L338.7 339.1C349.7 347.3 364.6 344.3 371.1 333.3C379.3 322.3 376.3 307.4 365.3 300L280 243.2V120C280 106.7 269.3 96 255.1 96C242.7 96 231.1 106.7 231.1 120L232 256z"
      })
    })
  },
  nature: {
    outline: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      children: [
        /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
          d: "M15.5 8a1.5 1.5 0 1 0 .001 3.001A1.5 1.5 0 0 0 15.5 8M8.5 8a1.5 1.5 0 1 0 .001 3.001A1.5 1.5 0 0 0 8.5 8"
        }),
        /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
          d: "M18.933 0h-.027c-.97 0-2.138.787-3.018 1.497-1.274-.374-2.612-.51-3.887-.51-1.285 0-2.616.133-3.874.517C7.245.79 6.069 0 5.093 0h-.027C3.352 0 .07 2.67.002 7.026c-.039 2.479.276 4.238 1.04 5.013.254.258.882.677 1.295.882.191 3.177.922 5.238 2.536 6.38.897.637 2.187.949 3.2 1.102C8.04 20.6 8 20.795 8 21c0 1.773 2.35 3 4 3 1.648 0 4-1.227 4-3 0-.201-.038-.393-.072-.586 2.573-.385 5.435-1.877 5.925-7.587.396-.22.887-.568 1.104-.788.763-.774 1.079-2.534 1.04-5.013C23.929 2.67 20.646 0 18.933 0M3.223 9.135c-.237.281-.837 1.155-.884 1.238-.15-.41-.368-1.349-.337-3.291.051-3.281 2.478-4.972 3.091-5.031.256.015.731.27 1.265.646-1.11 1.171-2.275 2.915-2.352 5.125-.133.546-.398.858-.783 1.313M12 22c-.901 0-1.954-.693-2-1 0-.654.475-1.236 1-1.602V20a1 1 0 1 0 2 0v-.602c.524.365 1 .947 1 1.602-.046.307-1.099 1-2 1m3-3.48v.02a4.752 4.752 0 0 0-1.262-1.02c1.092-.516 2.239-1.334 2.239-2.217 0-1.842-1.781-2.195-3.977-2.195-2.196 0-3.978.354-3.978 2.195 0 .883 1.148 1.701 2.238 2.217A4.8 4.8 0 0 0 9 18.539v-.025c-1-.076-2.182-.281-2.973-.842-1.301-.92-1.838-3.045-1.853-6.478l.023-.041c.496-.826 1.49-1.45 1.804-3.102 0-2.047 1.357-3.631 2.362-4.522C9.37 3.178 10.555 3 11.948 3c1.447 0 2.685.192 3.733.57 1 .9 2.316 2.465 2.316 4.48.313 1.651 1.307 2.275 1.803 3.102.035.058.068.117.102.178-.059 5.967-1.949 7.01-4.902 7.19m6.628-8.202c-.037-.065-.074-.13-.113-.195a7.587 7.587 0 0 0-.739-.987c-.385-.455-.648-.768-.782-1.313-.076-2.209-1.241-3.954-2.353-5.124.531-.376 1.004-.63 1.261-.647.636.071 3.044 1.764 3.096 5.031.027 1.81-.347 3.218-.37 3.235"
        })
      ]
    }),
    solid: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 576 512",
      children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
        d: "M332.7 19.85C334.6 8.395 344.5 0 356.1 0C363.6 0 370.6 3.52 375.1 9.502L392 32H444.1C456.8 32 469.1 37.06 478.1 46.06L496 64H552C565.3 64 576 74.75 576 88V112C576 156.2 540.2 192 496 192H426.7L421.6 222.5L309.6 158.5L332.7 19.85zM448 64C439.2 64 432 71.16 432 80C432 88.84 439.2 96 448 96C456.8 96 464 88.84 464 80C464 71.16 456.8 64 448 64zM416 256.1V480C416 497.7 401.7 512 384 512H352C334.3 512 320 497.7 320 480V364.8C295.1 377.1 268.8 384 240 384C211.2 384 184 377.1 160 364.8V480C160 497.7 145.7 512 128 512H96C78.33 512 64 497.7 64 480V249.8C35.23 238.9 12.64 214.5 4.836 183.3L.9558 167.8C-3.331 150.6 7.094 133.2 24.24 128.1C41.38 124.7 58.76 135.1 63.05 152.2L66.93 167.8C70.49 182 83.29 191.1 97.97 191.1H303.8L416 256.1z"
      })
    })
  },
  objects: {
    outline: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      children: [
        /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
          d: "M12 0a9 9 0 0 0-5 16.482V21s2.035 3 5 3 5-3 5-3v-4.518A9 9 0 0 0 12 0zm0 2c3.86 0 7 3.141 7 7s-3.14 7-7 7-7-3.141-7-7 3.14-7 7-7zM9 17.477c.94.332 1.946.523 3 .523s2.06-.19 3-.523v.834c-.91.436-1.925.689-3 .689a6.924 6.924 0 0 1-3-.69v-.833zm.236 3.07A8.854 8.854 0 0 0 12 21c.965 0 1.888-.167 2.758-.451C14.155 21.173 13.153 22 12 22c-1.102 0-2.117-.789-2.764-1.453z"
        }),
        /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
          d: "M14.745 12.449h-.004c-.852-.024-1.188-.858-1.577-1.824-.421-1.061-.703-1.561-1.182-1.566h-.009c-.481 0-.783.497-1.235 1.537-.436.982-.801 1.811-1.636 1.791l-.276-.043c-.565-.171-.853-.691-1.284-1.794-.125-.313-.202-.632-.27-.913-.051-.213-.127-.53-.195-.634C7.067 9.004 7.039 9 6.99 9A1 1 0 0 1 7 7h.01c1.662.017 2.015 1.373 2.198 2.134.486-.981 1.304-2.058 2.797-2.075 1.531.018 2.28 1.153 2.731 2.141l.002-.008C14.944 8.424 15.327 7 16.979 7h.032A1 1 0 1 1 17 9h-.011c-.149.076-.256.474-.319.709a6.484 6.484 0 0 1-.311.951c-.429.973-.79 1.789-1.614 1.789"
        })
      ]
    }),
    solid: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 384 512",
      children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
        d: "M112.1 454.3c0 6.297 1.816 12.44 5.284 17.69l17.14 25.69c5.25 7.875 17.17 14.28 26.64 14.28h61.67c9.438 0 21.36-6.401 26.61-14.28l17.08-25.68c2.938-4.438 5.348-12.37 5.348-17.7L272 415.1h-160L112.1 454.3zM191.4 .0132C89.44 .3257 16 82.97 16 175.1c0 44.38 16.44 84.84 43.56 115.8c16.53 18.84 42.34 58.23 52.22 91.45c.0313 .25 .0938 .5166 .125 .7823h160.2c.0313-.2656 .0938-.5166 .125-.7823c9.875-33.22 35.69-72.61 52.22-91.45C351.6 260.8 368 220.4 368 175.1C368 78.61 288.9-.2837 191.4 .0132zM192 96.01c-44.13 0-80 35.89-80 79.1C112 184.8 104.8 192 96 192S80 184.8 80 176c0-61.76 50.25-111.1 112-111.1c8.844 0 16 7.159 16 16S200.8 96.01 192 96.01z"
      })
    })
  },
  people: {
    outline: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      children: [
        /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
          d: "M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0m0 22C6.486 22 2 17.514 2 12S6.486 2 12 2s10 4.486 10 10-4.486 10-10 10"
        }),
        /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
          d: "M8 7a2 2 0 1 0-.001 3.999A2 2 0 0 0 8 7M16 7a2 2 0 1 0-.001 3.999A2 2 0 0 0 16 7M15.232 15c-.693 1.195-1.87 2-3.349 2-1.477 0-2.655-.805-3.347-2H15m3-2H6a6 6 0 1 0 12 0"
        })
      ]
    }),
    solid: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 512 512",
      children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
        d: "M0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256zM256 432C332.1 432 396.2 382 415.2 314.1C419.1 300.4 407.8 288 393.6 288H118.4C104.2 288 92.92 300.4 96.76 314.1C115.8 382 179.9 432 256 432V432zM176.4 160C158.7 160 144.4 174.3 144.4 192C144.4 209.7 158.7 224 176.4 224C194 224 208.4 209.7 208.4 192C208.4 174.3 194 160 176.4 160zM336.4 224C354 224 368.4 209.7 368.4 192C368.4 174.3 354 160 336.4 160C318.7 160 304.4 174.3 304.4 192C304.4 209.7 318.7 224 336.4 224z"
      })
    })
  },
  places: {
    outline: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      children: [
        /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
          d: "M6.5 12C5.122 12 4 13.121 4 14.5S5.122 17 6.5 17 9 15.879 9 14.5 7.878 12 6.5 12m0 3c-.275 0-.5-.225-.5-.5s.225-.5.5-.5.5.225.5.5-.225.5-.5.5M17.5 12c-1.378 0-2.5 1.121-2.5 2.5s1.122 2.5 2.5 2.5 2.5-1.121 2.5-2.5-1.122-2.5-2.5-2.5m0 3c-.275 0-.5-.225-.5-.5s.225-.5.5-.5.5.225.5.5-.225.5-.5.5"
        }),
        /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
          d: "M22.482 9.494l-1.039-.346L21.4 9h.6c.552 0 1-.439 1-.992 0-.006-.003-.008-.003-.008H23c0-1-.889-2-1.984-2h-.642l-.731-1.717C19.262 3.012 18.091 2 16.764 2H7.236C5.909 2 4.738 3.012 4.357 4.283L3.626 6h-.642C1.889 6 1 7 1 8h.003S1 8.002 1 8.008C1 8.561 1.448 9 2 9h.6l-.043.148-1.039.346a2.001 2.001 0 0 0-1.359 2.097l.751 7.508a1 1 0 0 0 .994.901H3v1c0 1.103.896 2 2 2h2c1.104 0 2-.897 2-2v-1h6v1c0 1.103.896 2 2 2h2c1.104 0 2-.897 2-2v-1h1.096a.999.999 0 0 0 .994-.901l.751-7.508a2.001 2.001 0 0 0-1.359-2.097M6.273 4.857C6.402 4.43 6.788 4 7.236 4h9.527c.448 0 .834.43.963.857L19.313 9H4.688l1.585-4.143zM7 21H5v-1h2v1zm12 0h-2v-1h2v1zm2.189-3H2.811l-.662-6.607L3 11h18l.852.393L21.189 18z"
        })
      ]
    }),
    solid: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 512 512",
      children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
        d: "M39.61 196.8L74.8 96.29C88.27 57.78 124.6 32 165.4 32H346.6C387.4 32 423.7 57.78 437.2 96.29L472.4 196.8C495.6 206.4 512 229.3 512 256V448C512 465.7 497.7 480 480 480H448C430.3 480 416 465.7 416 448V400H96V448C96 465.7 81.67 480 64 480H32C14.33 480 0 465.7 0 448V256C0 229.3 16.36 206.4 39.61 196.8V196.8zM109.1 192H402.9L376.8 117.4C372.3 104.6 360.2 96 346.6 96H165.4C151.8 96 139.7 104.6 135.2 117.4L109.1 192zM96 256C78.33 256 64 270.3 64 288C64 305.7 78.33 320 96 320C113.7 320 128 305.7 128 288C128 270.3 113.7 256 96 256zM416 320C433.7 320 448 305.7 448 288C448 270.3 433.7 256 416 256C398.3 256 384 270.3 384 288C384 305.7 398.3 320 416 320z"
      })
    })
  },
  symbols: {
    outline: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
        d: "M0 0h11v2H0zM4 11h3V6h4V4H0v2h4zM15.5 17c1.381 0 2.5-1.116 2.5-2.493s-1.119-2.493-2.5-2.493S13 13.13 13 14.507 14.119 17 15.5 17m0-2.986c.276 0 .5.222.5.493 0 .272-.224.493-.5.493s-.5-.221-.5-.493.224-.493.5-.493M21.5 19.014c-1.381 0-2.5 1.116-2.5 2.493S20.119 24 21.5 24s2.5-1.116 2.5-2.493-1.119-2.493-2.5-2.493m0 2.986a.497.497 0 0 1-.5-.493c0-.271.224-.493.5-.493s.5.222.5.493a.497.497 0 0 1-.5.493M22 13l-9 9 1.513 1.5 8.99-9.009zM17 11c2.209 0 4-1.119 4-2.5V2s.985-.161 1.498.949C23.01 4.055 23 6 23 6s1-1.119 1-3.135C24-.02 21 0 21 0h-2v6.347A5.853 5.853 0 0 0 17 6c-2.209 0-4 1.119-4 2.5s1.791 2.5 4 2.5M10.297 20.482l-1.475-1.585a47.54 47.54 0 0 1-1.442 1.129c-.307-.288-.989-1.016-2.045-2.183.902-.836 1.479-1.466 1.729-1.892s.376-.871.376-1.336c0-.592-.273-1.178-.818-1.759-.546-.581-1.329-.871-2.349-.871-1.008 0-1.79.293-2.344.879-.556.587-.832 1.181-.832 1.784 0 .813.419 1.748 1.256 2.805-.847.614-1.444 1.208-1.794 1.784a3.465 3.465 0 0 0-.523 1.833c0 .857.308 1.56.924 2.107.616.549 1.423.823 2.42.823 1.173 0 2.444-.379 3.813-1.137L8.235 24h2.819l-2.09-2.383 1.333-1.135zm-6.736-6.389a1.02 1.02 0 0 1 .73-.286c.31 0 .559.085.747.254a.849.849 0 0 1 .283.659c0 .518-.419 1.112-1.257 1.784-.536-.651-.805-1.231-.805-1.742a.901.901 0 0 1 .302-.669M3.74 22c-.427 0-.778-.116-1.057-.349-.279-.232-.418-.487-.418-.766 0-.594.509-1.288 1.527-2.083.968 1.134 1.717 1.946 2.248 2.438-.921.507-1.686.76-2.3.76"
      })
    }),
    solid: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 512 512",
      children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
        d: "M500.3 7.251C507.7 13.33 512 22.41 512 31.1V175.1C512 202.5 483.3 223.1 447.1 223.1C412.7 223.1 383.1 202.5 383.1 175.1C383.1 149.5 412.7 127.1 447.1 127.1V71.03L351.1 90.23V207.1C351.1 234.5 323.3 255.1 287.1 255.1C252.7 255.1 223.1 234.5 223.1 207.1C223.1 181.5 252.7 159.1 287.1 159.1V63.1C287.1 48.74 298.8 35.61 313.7 32.62L473.7 .6198C483.1-1.261 492.9 1.173 500.3 7.251H500.3zM74.66 303.1L86.5 286.2C92.43 277.3 102.4 271.1 113.1 271.1H174.9C185.6 271.1 195.6 277.3 201.5 286.2L213.3 303.1H239.1C266.5 303.1 287.1 325.5 287.1 351.1V463.1C287.1 490.5 266.5 511.1 239.1 511.1H47.1C21.49 511.1-.0019 490.5-.0019 463.1V351.1C-.0019 325.5 21.49 303.1 47.1 303.1H74.66zM143.1 359.1C117.5 359.1 95.1 381.5 95.1 407.1C95.1 434.5 117.5 455.1 143.1 455.1C170.5 455.1 191.1 434.5 191.1 407.1C191.1 381.5 170.5 359.1 143.1 359.1zM440.3 367.1H496C502.7 367.1 508.6 372.1 510.1 378.4C513.3 384.6 511.6 391.7 506.5 396L378.5 508C372.9 512.1 364.6 513.3 358.6 508.9C352.6 504.6 350.3 496.6 353.3 489.7L391.7 399.1H336C329.3 399.1 323.4 395.9 321 389.6C318.7 383.4 320.4 376.3 325.5 371.1L453.5 259.1C459.1 255 467.4 254.7 473.4 259.1C479.4 263.4 481.6 271.4 478.7 278.3L440.3 367.1zM116.7 219.1L19.85 119.2C-8.112 90.26-6.614 42.31 24.85 15.34C51.82-8.137 93.26-3.642 118.2 21.83L128.2 32.32L137.7 21.83C162.7-3.642 203.6-8.137 231.6 15.34C262.6 42.31 264.1 90.26 236.1 119.2L139.7 219.1C133.2 225.6 122.7 225.6 116.7 219.1H116.7z"
      })
    })
  }
};
const $fcccfb36ed0cde68$var$search = {
  loupe: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
      d: "M12.9 14.32a8 8 0 1 1 1.41-1.41l5.35 5.33-1.42 1.42-5.33-5.34zM8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12z"
    })
  }),
  delete: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("path", {
      d: "M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z"
    })
  })
};
var $fcccfb36ed0cde68$export$2e2bcd8739ae039 = {
  categories: $fcccfb36ed0cde68$var$categories,
  search: $fcccfb36ed0cde68$var$search
};
function $254755d3f438722f$export$2e2bcd8739ae039(props) {
  let { id, skin, emoji } = props;
  if (props.shortcodes) {
    const matches = props.shortcodes.match($c4d155af13ad4d4b$export$2e2bcd8739ae039.SHORTCODES_REGEX);
    if (matches) {
      id = matches[1];
      if (matches[2])
        skin = matches[2];
    }
  }
  emoji || (emoji = $c4d155af13ad4d4b$export$2e2bcd8739ae039.get(id || props.native));
  if (!emoji)
    return props.fallback;
  const emojiSkin = emoji.skins[skin - 1] || emoji.skins[0];
  const imageSrc = emojiSkin.src || (props.set != "native" && !props.spritesheet ? typeof props.getImageURL === "function" ? props.getImageURL(props.set, emojiSkin.unified) : `https://cdn.jsdelivr.net/npm/emoji-datasource-${props.set}@14.0.0/img/${props.set}/64/${emojiSkin.unified}.png` : void 0);
  const spritesheetSrc = typeof props.getSpritesheetURL === "function" ? props.getSpritesheetURL(props.set) : `https://cdn.jsdelivr.net/npm/emoji-datasource-${props.set}@14.0.0/img/${props.set}/sheets-256/64.png`;
  return /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("span", {
    class: "emoji-mart-emoji",
    "data-emoji-set": props.set,
    children: imageSrc ? /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("img", {
      style: {
        maxWidth: props.size || "1em",
        maxHeight: props.size || "1em",
        display: "inline-block"
      },
      alt: emojiSkin.native || emojiSkin.shortcodes,
      src: imageSrc
    }) : props.set == "native" ? /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("span", {
      style: {
        fontSize: props.size,
        fontFamily: '"EmojiMart", "Segoe UI Emoji", "Segoe UI Symbol", "Segoe UI", "Apple Color Emoji", "Twemoji Mozilla", "Noto Color Emoji", "Android Emoji"'
      },
      children: emojiSkin.native
    }) : /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("span", {
      style: {
        display: "block",
        width: props.size,
        height: props.size,
        backgroundImage: `url(${spritesheetSrc})`,
        backgroundSize: `${100 * $7adb23b0109cc36a$export$2d0294657ab35f1b.sheet.cols}% ${100 * $7adb23b0109cc36a$export$2d0294657ab35f1b.sheet.rows}%`,
        backgroundPosition: `${100 / ($7adb23b0109cc36a$export$2d0294657ab35f1b.sheet.cols - 1) * emojiSkin.x}% ${100 / ($7adb23b0109cc36a$export$2d0294657ab35f1b.sheet.rows - 1) * emojiSkin.y}%`
      }
    })
  });
}
const $6f57cc9cd54c5aaa$var$WindowHTMLElement = typeof window !== "undefined" && window.HTMLElement ? window.HTMLElement : Object;
class $6f57cc9cd54c5aaa$export$2e2bcd8739ae039 extends $6f57cc9cd54c5aaa$var$WindowHTMLElement {
  static get observedAttributes() {
    return Object.keys(this.Props);
  }
  update(props = {}) {
    for (let k in props)
      this.attributeChangedCallback(k, null, props[k]);
  }
  attributeChangedCallback(attr, _, newValue) {
    if (!this.component)
      return;
    const value2 = $7adb23b0109cc36a$export$88c9ddb45cea7241(attr, {
      [attr]: newValue
    }, this.constructor.Props, this);
    if (this.component.componentWillReceiveProps)
      this.component.componentWillReceiveProps({
        [attr]: value2
      });
    else {
      this.component.props[attr] = value2;
      this.component.forceUpdate();
    }
  }
  disconnectedCallback() {
    this.disconnected = true;
    if (this.component && this.component.unregister)
      this.component.unregister();
  }
  constructor(props = {}) {
    super();
    this.props = props;
    if (props.parent || props.ref) {
      let ref = null;
      const parent = props.parent || (ref = props.ref && props.ref.current);
      if (ref)
        ref.innerHTML = "";
      if (parent)
        parent.appendChild(this);
    }
  }
}
class $26f27c338a96b1a6$export$2e2bcd8739ae039 extends $6f57cc9cd54c5aaa$export$2e2bcd8739ae039 {
  setShadow() {
    this.attachShadow({
      mode: "open"
    });
  }
  injectStyles(styles) {
    if (!styles)
      return;
    const style = document.createElement("style");
    style.textContent = styles;
    this.shadowRoot.insertBefore(style, this.shadowRoot.firstChild);
  }
  constructor(props, { styles } = {}) {
    super(props);
    this.setShadow();
    this.injectStyles(styles);
  }
}
var $3d90f6e46fb2dd47$export$2e2bcd8739ae039 = {
  fallback: "",
  id: "",
  native: "",
  shortcodes: "",
  size: {
    value: "",
    transform: (value2) => {
      if (!/\D/.test(value2))
        return `${value2}px`;
      return value2;
    }
  },
  // Shared
  set: $b247ea80b67298d5$export$2e2bcd8739ae039.set,
  skin: $b247ea80b67298d5$export$2e2bcd8739ae039.skin
};
class $331b4160623139bf$export$2e2bcd8739ae039 extends $6f57cc9cd54c5aaa$export$2e2bcd8739ae039 {
  async connectedCallback() {
    const props = $7adb23b0109cc36a$export$75fe5f91d452f94b(this.props, $3d90f6e46fb2dd47$export$2e2bcd8739ae039, this);
    props.element = this;
    props.ref = (component) => {
      this.component = component;
    };
    await $7adb23b0109cc36a$export$2cd8252107eb640b();
    if (this.disconnected)
      return;
    $fb96b826c0c5f37a$export$b3890eb0ae9dca99(/* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b($254755d3f438722f$export$2e2bcd8739ae039, {
      ...props
    }), this);
  }
  constructor(props) {
    super(props);
  }
}
$c770c458706daa72$export$2e2bcd8739ae039($331b4160623139bf$export$2e2bcd8739ae039, "Props", $3d90f6e46fb2dd47$export$2e2bcd8739ae039);
if (typeof customElements !== "undefined" && !customElements.get("em-emoji"))
  customElements.define("em-emoji", $331b4160623139bf$export$2e2bcd8739ae039);
var $1a9a8ef576b7773d$var$r, $1a9a8ef576b7773d$var$i = [], $1a9a8ef576b7773d$var$c = $fb96b826c0c5f37a$export$41c562ebe57d11e2.__b, $1a9a8ef576b7773d$var$f = $fb96b826c0c5f37a$export$41c562ebe57d11e2.__r, $1a9a8ef576b7773d$var$e = $fb96b826c0c5f37a$export$41c562ebe57d11e2.diffed, $1a9a8ef576b7773d$var$a = $fb96b826c0c5f37a$export$41c562ebe57d11e2.__c, $1a9a8ef576b7773d$var$v = $fb96b826c0c5f37a$export$41c562ebe57d11e2.unmount;
function $1a9a8ef576b7773d$var$x() {
  var t6;
  for ($1a9a8ef576b7773d$var$i.sort(function(n11, t7) {
    return n11.__v.__b - t7.__v.__b;
  }); t6 = $1a9a8ef576b7773d$var$i.pop(); )
    if (t6.__P)
      try {
        t6.__H.__h.forEach($1a9a8ef576b7773d$var$g), t6.__H.__h.forEach($1a9a8ef576b7773d$var$j), t6.__H.__h = [];
      } catch (u4) {
        t6.__H.__h = [], $fb96b826c0c5f37a$export$41c562ebe57d11e2.__e(u4, t6.__v);
      }
}
$fb96b826c0c5f37a$export$41c562ebe57d11e2.__b = function(n12) {
  $1a9a8ef576b7773d$var$c && $1a9a8ef576b7773d$var$c(n12);
}, $fb96b826c0c5f37a$export$41c562ebe57d11e2.__r = function(n13) {
  $1a9a8ef576b7773d$var$f && $1a9a8ef576b7773d$var$f(n13);
  var r8 = n13.__c.__H;
  r8 && (r8.__h.forEach($1a9a8ef576b7773d$var$g), r8.__h.forEach($1a9a8ef576b7773d$var$j), r8.__h = []);
}, $fb96b826c0c5f37a$export$41c562ebe57d11e2.diffed = function(t8) {
  $1a9a8ef576b7773d$var$e && $1a9a8ef576b7773d$var$e(t8);
  var o6 = t8.__c;
  o6 && o6.__H && o6.__H.__h.length && (1 !== $1a9a8ef576b7773d$var$i.push(o6) && $1a9a8ef576b7773d$var$r === $fb96b826c0c5f37a$export$41c562ebe57d11e2.requestAnimationFrame || (($1a9a8ef576b7773d$var$r = $fb96b826c0c5f37a$export$41c562ebe57d11e2.requestAnimationFrame) || function(n14) {
    var t9, u5 = function() {
      clearTimeout(r9), $1a9a8ef576b7773d$var$b && cancelAnimationFrame(t9), setTimeout(n14);
    }, r9 = setTimeout(u5, 100);
    $1a9a8ef576b7773d$var$b && (t9 = requestAnimationFrame(u5));
  })($1a9a8ef576b7773d$var$x));
}, $fb96b826c0c5f37a$export$41c562ebe57d11e2.__c = function(t10, u6) {
  u6.some(function(t11) {
    try {
      t11.__h.forEach($1a9a8ef576b7773d$var$g), t11.__h = t11.__h.filter(function(n15) {
        return !n15.__ || $1a9a8ef576b7773d$var$j(n15);
      });
    } catch (r10) {
      u6.some(function(n16) {
        n16.__h && (n16.__h = []);
      }), u6 = [], $fb96b826c0c5f37a$export$41c562ebe57d11e2.__e(r10, t11.__v);
    }
  }), $1a9a8ef576b7773d$var$a && $1a9a8ef576b7773d$var$a(t10, u6);
}, $fb96b826c0c5f37a$export$41c562ebe57d11e2.unmount = function(t12) {
  $1a9a8ef576b7773d$var$v && $1a9a8ef576b7773d$var$v(t12);
  var u7, r11 = t12.__c;
  r11 && r11.__H && (r11.__H.__.forEach(function(n17) {
    try {
      $1a9a8ef576b7773d$var$g(n17);
    } catch (n18) {
      u7 = n18;
    }
  }), u7 && $fb96b826c0c5f37a$export$41c562ebe57d11e2.__e(u7, r11.__v));
};
var $1a9a8ef576b7773d$var$b = "function" == typeof requestAnimationFrame;
function $1a9a8ef576b7773d$var$g(n19) {
  var r12 = n19.__c;
  "function" == typeof r12 && (n19.__c = void 0, r12());
}
function $1a9a8ef576b7773d$var$j(n20) {
  n20.__c = n20.__();
}
function $dc040a17866866fa$var$S(n1, t1) {
  for (var e1 in t1)
    n1[e1] = t1[e1];
  return n1;
}
function $dc040a17866866fa$var$C(n2, t2) {
  for (var e2 in n2)
    if ("__source" !== e2 && !(e2 in t2))
      return true;
  for (var r1 in t2)
    if ("__source" !== r1 && n2[r1] !== t2[r1])
      return true;
  return false;
}
function $dc040a17866866fa$export$221d75b3f55bb0bd(n3) {
  this.props = n3;
}
($dc040a17866866fa$export$221d75b3f55bb0bd.prototype = new $fb96b826c0c5f37a$export$16fa2f45be04daa8()).isPureReactComponent = true, $dc040a17866866fa$export$221d75b3f55bb0bd.prototype.shouldComponentUpdate = function(n6, t5) {
  return $dc040a17866866fa$var$C(this.props, n6) || $dc040a17866866fa$var$C(this.state, t5);
};
var $dc040a17866866fa$var$w = $fb96b826c0c5f37a$export$41c562ebe57d11e2.__b;
$fb96b826c0c5f37a$export$41c562ebe57d11e2.__b = function(n7) {
  n7.type && n7.type.__f && n7.ref && (n7.props.ref = n7.ref, n7.ref = null), $dc040a17866866fa$var$w && $dc040a17866866fa$var$w(n7);
};
var $dc040a17866866fa$var$A = $fb96b826c0c5f37a$export$41c562ebe57d11e2.__e;
$fb96b826c0c5f37a$export$41c562ebe57d11e2.__e = function(n12, t10, e6) {
  if (n12.then) {
    for (var r5, u1 = t10; u1 = u1.__; )
      if ((r5 = u1.__c) && r5.__c)
        return null == t10.__e && (t10.__e = e6.__e, t10.__k = e6.__k), r5.__c(n12, t10);
  }
  $dc040a17866866fa$var$A(n12, t10, e6);
};
var $dc040a17866866fa$var$O = $fb96b826c0c5f37a$export$41c562ebe57d11e2.unmount;
function $dc040a17866866fa$export$74bf444e3cd11ea5() {
  this.__u = 0, this.t = null, this.__b = null;
}
function $dc040a17866866fa$var$U(n13) {
  var t11 = n13.__.__c;
  return t11 && t11.__e && t11.__e(n13);
}
function $dc040a17866866fa$export$998bcd577473dd93() {
  this.u = null, this.o = null;
}
$fb96b826c0c5f37a$export$41c562ebe57d11e2.unmount = function(n17) {
  var t13 = n17.__c;
  t13 && t13.__R && t13.__R(), t13 && true === n17.__h && (n17.type = null), $dc040a17866866fa$var$O && $dc040a17866866fa$var$O(n17);
}, ($dc040a17866866fa$export$74bf444e3cd11ea5.prototype = new $fb96b826c0c5f37a$export$16fa2f45be04daa8()).__c = function(n18, t14) {
  var e8 = t14.__c, r7 = this;
  null == r7.t && (r7.t = []), r7.t.push(e8);
  var u4 = $dc040a17866866fa$var$U(r7.__v), o1 = false, i1 = function() {
    o1 || (o1 = true, e8.__R = null, u4 ? u4(l1) : l1());
  };
  e8.__R = i1;
  var l1 = function() {
    if (!--r7.__u) {
      if (r7.state.__e) {
        var n19 = r7.state.__e;
        r7.__v.__k[0] = function n22(t17, e9, r8) {
          return t17 && (t17.__v = null, t17.__k = t17.__k && t17.__k.map(function(t18) {
            return n22(t18, e9, r8);
          }), t17.__c && t17.__c.__P === e9 && (t17.__e && r8.insertBefore(t17.__e, t17.__d), t17.__c.__e = true, t17.__c.__P = r8)), t17;
        }(n19, n19.__c.__P, n19.__c.__O);
      }
      var t15;
      for (r7.setState({
        __e: r7.__b = null
      }); t15 = r7.t.pop(); )
        t15.forceUpdate();
    }
  }, c1 = true === t14.__h;
  r7.__u++ || c1 || r7.setState({
    __e: r7.__b = r7.__v.__k[0]
  }), n18.then(i1, i1);
}, $dc040a17866866fa$export$74bf444e3cd11ea5.prototype.componentWillUnmount = function() {
  this.t = [];
}, $dc040a17866866fa$export$74bf444e3cd11ea5.prototype.render = function(n23, t19) {
  if (this.__b) {
    if (this.__v.__k) {
      var e10 = document.createElement("div"), r9 = this.__v.__k[0].__c;
      this.__v.__k[0] = function n24(t20, e13, r12) {
        return t20 && (t20.__c && t20.__c.__H && (t20.__c.__H.__.forEach(function(n25) {
          "function" == typeof n25.__c && n25.__c();
        }), t20.__c.__H = null), null != (t20 = $dc040a17866866fa$var$S({}, t20)).__c && (t20.__c.__P === r12 && (t20.__c.__P = e13), t20.__c = null), t20.__k = t20.__k && t20.__k.map(function(t21) {
          return n24(t21, e13, r12);
        })), t20;
      }(this.__b, e10, r9.__O = r9.__P);
    }
    this.__b = null;
  }
  var u5 = t19.__e && $fb96b826c0c5f37a$export$c8a8987d4410bf2d($fb96b826c0c5f37a$export$ffb0004e005737fa, null, n23.fallback);
  return u5 && (u5.__h = null), [
    $fb96b826c0c5f37a$export$c8a8987d4410bf2d($fb96b826c0c5f37a$export$ffb0004e005737fa, null, t19.__e ? null : n23.children),
    u5
  ];
};
var $dc040a17866866fa$var$T = function(n26, t22, e14) {
  if (++e14[1] === e14[0] && n26.o.delete(t22), n26.props.revealOrder && ("t" !== n26.props.revealOrder[0] || !n26.o.size))
    for (e14 = n26.u; e14; ) {
      for (; e14.length > 3; )
        e14.pop()();
      if (e14[1] < e14[0])
        break;
      n26.u = e14 = e14[2];
    }
};
($dc040a17866866fa$export$998bcd577473dd93.prototype = new $fb96b826c0c5f37a$export$16fa2f45be04daa8()).__e = function(n33) {
  var t25 = this, e16 = $dc040a17866866fa$var$U(t25.__v), r13 = t25.o.get(n33);
  return r13[0]++, function(u6) {
    var o2 = function() {
      t25.props.revealOrder ? (r13.push(u6), $dc040a17866866fa$var$T(t25, n33, r13)) : u6();
    };
    e16 ? e16(o2) : o2();
  };
}, $dc040a17866866fa$export$998bcd577473dd93.prototype.render = function(n34) {
  this.u = null, this.o = /* @__PURE__ */ new Map();
  var t26 = $fb96b826c0c5f37a$export$47e4c5b300681277(n34.children);
  n34.revealOrder && "b" === n34.revealOrder[0] && t26.reverse();
  for (var e17 = t26.length; e17--; )
    this.o.set(t26[e17], this.u = [
      1,
      0,
      this.u
    ]);
  return n34.children;
}, $dc040a17866866fa$export$998bcd577473dd93.prototype.componentDidUpdate = $dc040a17866866fa$export$998bcd577473dd93.prototype.componentDidMount = function() {
  var n35 = this;
  this.o.forEach(function(t27, e18) {
    $dc040a17866866fa$var$T(n35, e18, t27);
  });
};
var $dc040a17866866fa$var$j = "undefined" != typeof Symbol && Symbol.for && Symbol.for("react.element") || 60103, $dc040a17866866fa$var$P = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|marker(?!H|W|U)|overline|paint|stop|strikethrough|stroke|text(?!L)|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/, $dc040a17866866fa$var$V = "undefined" != typeof document, $dc040a17866866fa$var$z = function(n36) {
  return ("undefined" != typeof Symbol && "symbol" == typeof Symbol() ? /fil|che|rad/i : /fil|che|ra/i).test(n36);
};
$fb96b826c0c5f37a$export$16fa2f45be04daa8.prototype.isReactComponent = {}, [
  "componentWillMount",
  "componentWillReceiveProps",
  "componentWillUpdate"
].forEach(function(n39) {
  Object.defineProperty($fb96b826c0c5f37a$export$16fa2f45be04daa8.prototype, n39, {
    configurable: true,
    get: function() {
      return this["UNSAFE_" + n39];
    },
    set: function(t30) {
      Object.defineProperty(this, n39, {
        configurable: true,
        writable: true,
        value: t30
      });
    }
  });
});
var $dc040a17866866fa$var$H = $fb96b826c0c5f37a$export$41c562ebe57d11e2.event;
function $dc040a17866866fa$var$Z() {
}
function $dc040a17866866fa$var$Y() {
  return this.cancelBubble;
}
function $dc040a17866866fa$var$q() {
  return this.defaultPrevented;
}
$fb96b826c0c5f37a$export$41c562ebe57d11e2.event = function(n40) {
  return $dc040a17866866fa$var$H && (n40 = $dc040a17866866fa$var$H(n40)), n40.persist = $dc040a17866866fa$var$Z, n40.isPropagationStopped = $dc040a17866866fa$var$Y, n40.isDefaultPrevented = $dc040a17866866fa$var$q, n40.nativeEvent = n40;
};
var $dc040a17866866fa$var$J = {
  configurable: true,
  get: function() {
    return this.class;
  }
}, $dc040a17866866fa$var$K = $fb96b826c0c5f37a$export$41c562ebe57d11e2.vnode;
$fb96b826c0c5f37a$export$41c562ebe57d11e2.vnode = function(n41) {
  var t31 = n41.type, e21 = n41.props, r14 = e21;
  if ("string" == typeof t31) {
    var u7 = -1 === t31.indexOf("-");
    for (var o3 in r14 = {}, e21) {
      var i2 = e21[o3];
      $dc040a17866866fa$var$V && "children" === o3 && "noscript" === t31 || "value" === o3 && "defaultValue" in e21 && null == i2 || ("defaultValue" === o3 && "value" in e21 && null == e21.value ? o3 = "value" : "download" === o3 && true === i2 ? i2 = "" : /ondoubleclick/i.test(o3) ? o3 = "ondblclick" : /^onchange(textarea|input)/i.test(o3 + t31) && !$dc040a17866866fa$var$z(e21.type) ? o3 = "oninput" : /^onfocus$/i.test(o3) ? o3 = "onfocusin" : /^onblur$/i.test(o3) ? o3 = "onfocusout" : /^on(Ani|Tra|Tou|BeforeInp)/.test(o3) ? o3 = o3.toLowerCase() : u7 && $dc040a17866866fa$var$P.test(o3) ? o3 = o3.replace(/[A-Z0-9]/, "-$&").toLowerCase() : null === i2 && (i2 = void 0), r14[o3] = i2);
    }
    "select" == t31 && r14.multiple && Array.isArray(r14.value) && (r14.value = $fb96b826c0c5f37a$export$47e4c5b300681277(e21.children).forEach(function(n42) {
      n42.props.selected = -1 != r14.value.indexOf(n42.props.value);
    })), "select" == t31 && null != r14.defaultValue && (r14.value = $fb96b826c0c5f37a$export$47e4c5b300681277(e21.children).forEach(function(n43) {
      n43.props.selected = r14.multiple ? -1 != r14.defaultValue.indexOf(n43.props.value) : r14.defaultValue == n43.props.value;
    })), n41.props = r14, e21.class != e21.className && ($dc040a17866866fa$var$J.enumerable = "className" in e21, null != e21.className && (r14.class = e21.className), Object.defineProperty(r14, "className", $dc040a17866866fa$var$J));
  }
  n41.$$typeof = $dc040a17866866fa$var$j, $dc040a17866866fa$var$K && $dc040a17866866fa$var$K(n41);
};
var $dc040a17866866fa$var$Q = $fb96b826c0c5f37a$export$41c562ebe57d11e2.__r;
$fb96b826c0c5f37a$export$41c562ebe57d11e2.__r = function(n44) {
  $dc040a17866866fa$var$Q && $dc040a17866866fa$var$Q(n44), n44.__c;
};
const $ec8c39fdad15601a$var$THEME_ICONS = {
  light: "outline",
  dark: "solid"
};
class $ec8c39fdad15601a$export$2e2bcd8739ae039 extends $dc040a17866866fa$export$221d75b3f55bb0bd {
  renderIcon(category) {
    const { icon } = category;
    if (icon) {
      if (icon.svg)
        return /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("span", {
          class: "flex",
          dangerouslySetInnerHTML: {
            __html: icon.svg
          }
        });
      if (icon.src)
        return /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("img", {
          src: icon.src
        });
    }
    const categoryIcons = $fcccfb36ed0cde68$export$2e2bcd8739ae039.categories[category.id] || $fcccfb36ed0cde68$export$2e2bcd8739ae039.categories.custom;
    const style = this.props.icons == "auto" ? $ec8c39fdad15601a$var$THEME_ICONS[this.props.theme] : this.props.icons;
    return categoryIcons[style] || categoryIcons;
  }
  render() {
    let selectedCategoryIndex = null;
    return /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("nav", {
      id: "nav",
      class: "padding",
      "data-position": this.props.position,
      dir: this.props.dir,
      children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
        class: "flex relative",
        children: [
          this.categories.map((category, i2) => {
            const title = category.name || $7adb23b0109cc36a$export$dbe3113d60765c1a.categories[category.id];
            const selected = !this.props.unfocused && category.id == this.state.categoryId;
            if (selected)
              selectedCategoryIndex = i2;
            return /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("button", {
              "aria-label": title,
              "aria-selected": selected || void 0,
              title,
              type: "button",
              class: "flex flex-grow flex-center",
              onMouseDown: (e) => e.preventDefault(),
              onClick: () => {
                this.props.onClick({
                  category,
                  i: i2
                });
              },
              children: this.renderIcon(category)
            });
          }),
          /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
            class: "bar",
            style: {
              width: `${100 / this.categories.length}%`,
              opacity: selectedCategoryIndex == null ? 0 : 1,
              transform: this.props.dir === "rtl" ? `scaleX(-1) translateX(${selectedCategoryIndex * 100}%)` : `translateX(${selectedCategoryIndex * 100}%)`
            }
          })
        ]
      })
    });
  }
  constructor() {
    super();
    this.categories = $7adb23b0109cc36a$export$2d0294657ab35f1b.categories.filter((category) => {
      return !category.target;
    });
    this.state = {
      categoryId: this.categories[0].id
    };
  }
}
class $e0d4dda61265ff1e$export$2e2bcd8739ae039 extends $dc040a17866866fa$export$221d75b3f55bb0bd {
  shouldComponentUpdate(nextProps) {
    for (let k in nextProps) {
      if (k == "children")
        continue;
      if (nextProps[k] != this.props[k])
        return true;
    }
    return false;
  }
  render() {
    return this.props.children;
  }
}
const $89bd6bb200cc8fef$var$Performance = {
  rowsPerRender: 10
};
class $89bd6bb200cc8fef$export$2e2bcd8739ae039 extends $fb96b826c0c5f37a$export$16fa2f45be04daa8 {
  getInitialState(props = this.props) {
    return {
      skin: $f72b75cf796873c7$export$2e2bcd8739ae039.get("skin") || props.skin,
      theme: this.initTheme(props.theme)
    };
  }
  componentWillMount() {
    this.dir = $7adb23b0109cc36a$export$dbe3113d60765c1a.rtl ? "rtl" : "ltr";
    this.refs = {
      menu: $fb96b826c0c5f37a$export$7d1e3a5e95ceca43(),
      navigation: $fb96b826c0c5f37a$export$7d1e3a5e95ceca43(),
      scroll: $fb96b826c0c5f37a$export$7d1e3a5e95ceca43(),
      search: $fb96b826c0c5f37a$export$7d1e3a5e95ceca43(),
      searchInput: $fb96b826c0c5f37a$export$7d1e3a5e95ceca43(),
      skinToneButton: $fb96b826c0c5f37a$export$7d1e3a5e95ceca43(),
      skinToneRadio: $fb96b826c0c5f37a$export$7d1e3a5e95ceca43()
    };
    this.initGrid();
    if (this.props.stickySearch == false && this.props.searchPosition == "sticky") {
      console.warn("[EmojiMart] Deprecation warning: `stickySearch` has been renamed `searchPosition`.");
      this.props.searchPosition = "static";
    }
  }
  componentDidMount() {
    this.register();
    this.shadowRoot = this.base.parentNode;
    if (this.props.autoFocus) {
      const { searchInput } = this.refs;
      if (searchInput.current)
        searchInput.current.focus();
    }
  }
  componentWillReceiveProps(nextProps) {
    this.nextState || (this.nextState = {});
    for (const k1 in nextProps)
      this.nextState[k1] = nextProps[k1];
    clearTimeout(this.nextStateTimer);
    this.nextStateTimer = setTimeout(() => {
      let requiresGridReset = false;
      for (const k in this.nextState) {
        this.props[k] = this.nextState[k];
        if (k === "custom" || k === "categories")
          requiresGridReset = true;
      }
      delete this.nextState;
      const nextState = this.getInitialState();
      if (requiresGridReset)
        return this.reset(nextState);
      this.setState(nextState);
    });
  }
  componentWillUnmount() {
    this.unregister();
  }
  async reset(nextState = {}) {
    await $7adb23b0109cc36a$export$2cd8252107eb640b(this.props);
    this.initGrid();
    this.unobserve();
    this.setState(nextState, () => {
      this.observeCategories();
      this.observeRows();
    });
  }
  register() {
    document.addEventListener("click", this.handleClickOutside);
    this.observe();
  }
  unregister() {
    document.removeEventListener("click", this.handleClickOutside);
    this.unobserve();
  }
  observe() {
    this.observeCategories();
    this.observeRows();
  }
  unobserve({ except = [] } = {}) {
    if (!Array.isArray(except))
      except = [
        except
      ];
    for (const observer of this.observers) {
      if (except.includes(observer))
        continue;
      observer.disconnect();
    }
    this.observers = [].concat(except);
  }
  initGrid() {
    const { categories } = $7adb23b0109cc36a$export$2d0294657ab35f1b;
    this.refs.categories = /* @__PURE__ */ new Map();
    const navKey = $7adb23b0109cc36a$export$2d0294657ab35f1b.categories.map((category) => category.id).join(",");
    if (this.navKey && this.navKey != navKey)
      this.refs.scroll.current && (this.refs.scroll.current.scrollTop = 0);
    this.navKey = navKey;
    this.grid = [];
    this.grid.setsize = 0;
    const addRow = (rows, category) => {
      const row = [];
      row.__categoryId = category.id;
      row.__index = rows.length;
      this.grid.push(row);
      const rowIndex = this.grid.length - 1;
      const rowRef = rowIndex % $89bd6bb200cc8fef$var$Performance.rowsPerRender ? {} : $fb96b826c0c5f37a$export$7d1e3a5e95ceca43();
      rowRef.index = rowIndex;
      rowRef.posinset = this.grid.setsize + 1;
      rows.push(rowRef);
      return row;
    };
    for (let category1 of categories) {
      const rows = [];
      let row = addRow(rows, category1);
      for (let emoji of category1.emojis) {
        if (row.length == this.getPerLine())
          row = addRow(rows, category1);
        this.grid.setsize += 1;
        row.push(emoji);
      }
      this.refs.categories.set(category1.id, {
        root: $fb96b826c0c5f37a$export$7d1e3a5e95ceca43(),
        rows
      });
    }
  }
  initTheme(theme) {
    if (theme != "auto")
      return theme;
    if (!this.darkMedia) {
      this.darkMedia = matchMedia("(prefers-color-scheme: dark)");
      if (this.darkMedia.media.match(/^not/))
        return "light";
      this.darkMedia.addListener(() => {
        if (this.props.theme != "auto")
          return;
        this.setState({
          theme: this.darkMedia.matches ? "dark" : "light"
        });
      });
    }
    return this.darkMedia.matches ? "dark" : "light";
  }
  initDynamicPerLine(props = this.props) {
    if (!props.dynamicWidth)
      return;
    const { element, emojiButtonSize } = props;
    const calculatePerLine = () => {
      const { width } = element.getBoundingClientRect();
      return Math.floor(width / emojiButtonSize);
    };
    const observer = new ResizeObserver(() => {
      this.unobserve({
        except: observer
      });
      this.setState({
        perLine: calculatePerLine()
      }, () => {
        this.initGrid();
        this.forceUpdate(() => {
          this.observeCategories();
          this.observeRows();
        });
      });
    });
    observer.observe(element);
    this.observers.push(observer);
    return calculatePerLine();
  }
  getPerLine() {
    return this.state.perLine || this.props.perLine;
  }
  getEmojiByPos([p1, p2]) {
    const grid = this.state.searchResults || this.grid;
    const emoji = grid[p1] && grid[p1][p2];
    if (!emoji)
      return;
    return $c4d155af13ad4d4b$export$2e2bcd8739ae039.get(emoji);
  }
  observeCategories() {
    const navigation = this.refs.navigation.current;
    if (!navigation)
      return;
    const visibleCategories = /* @__PURE__ */ new Map();
    const setFocusedCategory = (categoryId) => {
      if (categoryId != navigation.state.categoryId)
        navigation.setState({
          categoryId
        });
    };
    const observerOptions = {
      root: this.refs.scroll.current,
      threshold: [
        0,
        1
      ]
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const id = entry.target.dataset.id;
        visibleCategories.set(id, entry.intersectionRatio);
      }
      const ratios = [
        ...visibleCategories
      ];
      for (const [id, ratio] of ratios)
        if (ratio) {
          setFocusedCategory(id);
          break;
        }
    }, observerOptions);
    for (const { root } of this.refs.categories.values())
      observer.observe(root.current);
    this.observers.push(observer);
  }
  observeRows() {
    const visibleRows = {
      ...this.state.visibleRows
    };
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const index = parseInt(entry.target.dataset.index);
        if (entry.isIntersecting)
          visibleRows[index] = true;
        else
          delete visibleRows[index];
      }
      this.setState({
        visibleRows
      });
    }, {
      root: this.refs.scroll.current,
      rootMargin: `${this.props.emojiButtonSize * ($89bd6bb200cc8fef$var$Performance.rowsPerRender + 5)}px 0px ${this.props.emojiButtonSize * $89bd6bb200cc8fef$var$Performance.rowsPerRender}px`
    });
    for (const { rows } of this.refs.categories.values()) {
      for (const row of rows)
        if (row.current)
          observer.observe(row.current);
    }
    this.observers.push(observer);
  }
  preventDefault(e) {
    e.preventDefault();
  }
  unfocusSearch() {
    const input = this.refs.searchInput.current;
    if (!input)
      return;
    input.blur();
  }
  navigate({ e, input, left, right, up, down }) {
    const grid = this.state.searchResults || this.grid;
    if (!grid.length)
      return;
    let [p1, p2] = this.state.pos;
    const pos = (() => {
      if (p1 == 0) {
        if (p2 == 0 && !e.repeat && (left || up))
          return null;
      }
      if (p1 == -1) {
        if (!e.repeat && (right || down) && input.selectionStart == input.value.length)
          return [
            0,
            0
          ];
        return null;
      }
      if (left || right) {
        let row = grid[p1];
        const increment = left ? -1 : 1;
        p2 += increment;
        if (!row[p2]) {
          p1 += increment;
          row = grid[p1];
          if (!row) {
            p1 = left ? 0 : grid.length - 1;
            p2 = left ? 0 : grid[p1].length - 1;
            return [
              p1,
              p2
            ];
          }
          p2 = left ? row.length - 1 : 0;
        }
        return [
          p1,
          p2
        ];
      }
      if (up || down) {
        p1 += up ? -1 : 1;
        const row = grid[p1];
        if (!row) {
          p1 = up ? 0 : grid.length - 1;
          p2 = up ? 0 : grid[p1].length - 1;
          return [
            p1,
            p2
          ];
        }
        if (!row[p2])
          p2 = row.length - 1;
        return [
          p1,
          p2
        ];
      }
    })();
    if (pos)
      e.preventDefault();
    else {
      if (this.state.pos[0] > -1)
        this.setState({
          pos: [
            -1,
            -1
          ]
        });
      return;
    }
    this.setState({
      pos,
      keyboard: true
    }, () => {
      this.scrollTo({
        row: pos[0]
      });
    });
  }
  scrollTo({ categoryId, row }) {
    const grid = this.state.searchResults || this.grid;
    if (!grid.length)
      return;
    const scroll = this.refs.scroll.current;
    const scrollRect = scroll.getBoundingClientRect();
    let scrollTop = 0;
    if (row >= 0)
      categoryId = grid[row].__categoryId;
    if (categoryId) {
      const ref = this.refs[categoryId] || this.refs.categories.get(categoryId).root;
      const categoryRect = ref.current.getBoundingClientRect();
      scrollTop = categoryRect.top - (scrollRect.top - scroll.scrollTop) + 1;
    }
    if (row >= 0) {
      if (!row)
        scrollTop = 0;
      else {
        const rowIndex = grid[row].__index;
        const rowTop = scrollTop + rowIndex * this.props.emojiButtonSize;
        const rowBot = rowTop + this.props.emojiButtonSize + this.props.emojiButtonSize * 0.88;
        if (rowTop < scroll.scrollTop)
          scrollTop = rowTop;
        else if (rowBot > scroll.scrollTop + scrollRect.height)
          scrollTop = rowBot - scrollRect.height;
        else
          return;
      }
    }
    this.ignoreMouse();
    scroll.scrollTop = scrollTop;
  }
  ignoreMouse() {
    this.mouseIsIgnored = true;
    clearTimeout(this.ignoreMouseTimer);
    this.ignoreMouseTimer = setTimeout(() => {
      delete this.mouseIsIgnored;
    }, 100);
  }
  handleEmojiOver(pos) {
    if (this.mouseIsIgnored || this.state.showSkins)
      return;
    this.setState({
      pos: pos || [
        -1,
        -1
      ],
      keyboard: false
    });
  }
  handleEmojiClick({ e, emoji, pos }) {
    if (!this.props.onEmojiSelect)
      return;
    if (!emoji && pos)
      emoji = this.getEmojiByPos(pos);
    if (emoji) {
      const emojiData = $693b183b0a78708f$export$d10ac59fbe52a745(emoji, {
        skinIndex: this.state.skin - 1
      });
      if (this.props.maxFrequentRows)
        $b22cfd0a55410b4f$export$2e2bcd8739ae039.add(emojiData, this.props);
      this.props.onEmojiSelect(emojiData, e);
    }
  }
  closeSkins() {
    if (!this.state.showSkins)
      return;
    this.setState({
      showSkins: null,
      tempSkin: null
    });
    this.base.removeEventListener("click", this.handleBaseClick);
    this.base.removeEventListener("keydown", this.handleBaseKeydown);
  }
  handleSkinMouseOver(tempSkin) {
    this.setState({
      tempSkin
    });
  }
  handleSkinClick(skin) {
    this.ignoreMouse();
    this.closeSkins();
    this.setState({
      skin,
      tempSkin: null
    });
    $f72b75cf796873c7$export$2e2bcd8739ae039.set("skin", skin);
  }
  renderNav() {
    return /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b($ec8c39fdad15601a$export$2e2bcd8739ae039, {
      ref: this.refs.navigation,
      icons: this.props.icons,
      theme: this.state.theme,
      dir: this.dir,
      unfocused: !!this.state.searchResults,
      position: this.props.navPosition,
      onClick: this.handleCategoryClick
    }, this.navKey);
  }
  renderPreview() {
    const emoji = this.getEmojiByPos(this.state.pos);
    const noSearchResults = this.state.searchResults && !this.state.searchResults.length;
    return /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
      id: "preview",
      class: "flex flex-middle",
      dir: this.dir,
      "data-position": this.props.previewPosition,
      children: [
        /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
          class: "flex flex-middle flex-grow",
          children: [
            /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
              class: "flex flex-auto flex-middle flex-center",
              style: {
                height: this.props.emojiButtonSize,
                fontSize: this.props.emojiButtonSize
              },
              children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b($254755d3f438722f$export$2e2bcd8739ae039, {
                emoji,
                id: noSearchResults ? this.props.noResultsEmoji || "cry" : this.props.previewEmoji || (this.props.previewPosition == "top" ? "point_down" : "point_up"),
                set: this.props.set,
                size: this.props.emojiButtonSize,
                skin: this.state.tempSkin || this.state.skin,
                spritesheet: true,
                getSpritesheetURL: this.props.getSpritesheetURL
              })
            }),
            /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
              class: `margin-${this.dir[0]}`,
              children: emoji || noSearchResults ? /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
                class: `padding-${this.dir[2]} align-${this.dir[0]}`,
                children: [
                  /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
                    class: "preview-title ellipsis",
                    children: emoji ? emoji.name : $7adb23b0109cc36a$export$dbe3113d60765c1a.search_no_results_1
                  }),
                  /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
                    class: "preview-subtitle ellipsis color-c",
                    children: emoji ? emoji.skins[0].shortcodes : $7adb23b0109cc36a$export$dbe3113d60765c1a.search_no_results_2
                  })
                ]
              }) : /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
                class: "preview-placeholder color-c",
                children: $7adb23b0109cc36a$export$dbe3113d60765c1a.pick
              })
            })
          ]
        }),
        !emoji && this.props.skinTonePosition == "preview" && this.renderSkinToneButton()
      ]
    });
  }
  renderEmojiButton(emoji, { pos, posinset, grid }) {
    const size = this.props.emojiButtonSize;
    const skin = this.state.tempSkin || this.state.skin;
    const emojiSkin = emoji.skins[skin - 1] || emoji.skins[0];
    const native = emojiSkin.native;
    const selected = $693b183b0a78708f$export$9cb4719e2e525b7a(this.state.pos, pos);
    const key = pos.concat(emoji.id).join("");
    return /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b($e0d4dda61265ff1e$export$2e2bcd8739ae039, {
      selected,
      skin,
      size,
      children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("button", {
        "aria-label": native,
        "aria-selected": selected || void 0,
        "aria-posinset": posinset,
        "aria-setsize": grid.setsize,
        "data-keyboard": this.state.keyboard,
        title: this.props.previewPosition == "none" ? emoji.name : void 0,
        type: "button",
        class: "flex flex-center flex-middle",
        tabindex: "-1",
        onClick: (e) => this.handleEmojiClick({
          e,
          emoji
        }),
        onMouseEnter: () => this.handleEmojiOver(pos),
        onMouseLeave: () => this.handleEmojiOver(),
        style: {
          width: this.props.emojiButtonSize,
          height: this.props.emojiButtonSize,
          fontSize: this.props.emojiSize,
          lineHeight: 0
        },
        children: [
          /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
            "aria-hidden": "true",
            class: "background",
            style: {
              borderRadius: this.props.emojiButtonRadius,
              backgroundColor: this.props.emojiButtonColors ? this.props.emojiButtonColors[(posinset - 1) % this.props.emojiButtonColors.length] : void 0
            }
          }),
          /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b($254755d3f438722f$export$2e2bcd8739ae039, {
            emoji,
            set: this.props.set,
            size: this.props.emojiSize,
            skin,
            spritesheet: true,
            getSpritesheetURL: this.props.getSpritesheetURL
          })
        ]
      })
    }, key);
  }
  renderSearch() {
    const renderSkinTone = this.props.previewPosition == "none" || this.props.skinTonePosition == "search";
    return /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
      children: [
        /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
          class: "spacer"
        }),
        /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
          class: "flex flex-middle",
          children: [
            /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
              class: "search relative flex-grow",
              children: [
                /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("input", {
                  type: "search",
                  ref: this.refs.searchInput,
                  placeholder: $7adb23b0109cc36a$export$dbe3113d60765c1a.search,
                  onClick: this.handleSearchClick,
                  onInput: this.handleSearchInput,
                  onKeyDown: this.handleSearchKeyDown,
                  autoComplete: "off"
                }),
                /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("span", {
                  class: "icon loupe flex",
                  children: $fcccfb36ed0cde68$export$2e2bcd8739ae039.search.loupe
                }),
                this.state.searchResults && /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("button", {
                  title: "Clear",
                  "aria-label": "Clear",
                  type: "button",
                  class: "icon delete flex",
                  onClick: this.clearSearch,
                  onMouseDown: this.preventDefault,
                  children: $fcccfb36ed0cde68$export$2e2bcd8739ae039.search.delete
                })
              ]
            }),
            renderSkinTone && this.renderSkinToneButton()
          ]
        })
      ]
    });
  }
  renderSearchResults() {
    const { searchResults } = this.state;
    if (!searchResults)
      return null;
    return /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
      class: "category",
      ref: this.refs.search,
      children: [
        /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
          class: `sticky padding-small align-${this.dir[0]}`,
          children: $7adb23b0109cc36a$export$dbe3113d60765c1a.categories.search
        }),
        /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
          children: !searchResults.length ? /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
            class: `padding-small align-${this.dir[0]}`,
            children: this.props.onAddCustomEmoji && /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("a", {
              onClick: this.props.onAddCustomEmoji,
              children: $7adb23b0109cc36a$export$dbe3113d60765c1a.add_custom
            })
          }) : searchResults.map((row, i2) => {
            return /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
              class: "flex",
              children: row.map((emoji, ii) => {
                return this.renderEmojiButton(emoji, {
                  pos: [
                    i2,
                    ii
                  ],
                  posinset: i2 * this.props.perLine + ii + 1,
                  grid: searchResults
                });
              })
            });
          })
        })
      ]
    });
  }
  renderCategories() {
    const { categories } = $7adb23b0109cc36a$export$2d0294657ab35f1b;
    const hidden = !!this.state.searchResults;
    const perLine = this.getPerLine();
    return /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
      style: {
        visibility: hidden ? "hidden" : void 0,
        display: hidden ? "none" : void 0,
        height: "100%"
      },
      children: categories.map((category) => {
        const { root, rows } = this.refs.categories.get(category.id);
        return /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
          "data-id": category.target ? category.target.id : category.id,
          class: "category",
          ref: root,
          children: [
            /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
              class: `sticky padding-small align-${this.dir[0]}`,
              children: category.name || $7adb23b0109cc36a$export$dbe3113d60765c1a.categories[category.id]
            }),
            /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
              class: "relative",
              style: {
                height: rows.length * this.props.emojiButtonSize
              },
              children: rows.map((row, i2) => {
                const targetRow = row.index - row.index % $89bd6bb200cc8fef$var$Performance.rowsPerRender;
                const visible = this.state.visibleRows[targetRow];
                const ref = "current" in row ? row : void 0;
                if (!visible && !ref)
                  return null;
                const start = i2 * perLine;
                const end = start + perLine;
                const emojiIds = category.emojis.slice(start, end);
                if (emojiIds.length < perLine)
                  emojiIds.push(...new Array(perLine - emojiIds.length));
                return /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
                  "data-index": row.index,
                  ref,
                  class: "flex row",
                  style: {
                    top: i2 * this.props.emojiButtonSize
                  },
                  children: visible && emojiIds.map((emojiId, ii) => {
                    if (!emojiId)
                      return /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
                        style: {
                          width: this.props.emojiButtonSize,
                          height: this.props.emojiButtonSize
                        }
                      });
                    const emoji = $c4d155af13ad4d4b$export$2e2bcd8739ae039.get(emojiId);
                    return this.renderEmojiButton(emoji, {
                      pos: [
                        row.index,
                        ii
                      ],
                      posinset: row.posinset + ii,
                      grid: this.grid
                    });
                  })
                }, row.index);
              })
            })
          ]
        });
      })
    });
  }
  renderSkinToneButton() {
    if (this.props.skinTonePosition == "none")
      return null;
    return /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
      class: "flex flex-auto flex-center flex-middle",
      style: {
        position: "relative",
        width: this.props.emojiButtonSize,
        height: this.props.emojiButtonSize
      },
      children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("button", {
        type: "button",
        ref: this.refs.skinToneButton,
        class: "skin-tone-button flex flex-auto flex-center flex-middle",
        "aria-selected": this.state.showSkins ? "" : void 0,
        "aria-label": $7adb23b0109cc36a$export$dbe3113d60765c1a.skins.choose,
        title: $7adb23b0109cc36a$export$dbe3113d60765c1a.skins.choose,
        onClick: this.openSkins,
        style: {
          width: this.props.emojiSize,
          height: this.props.emojiSize
        },
        children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("span", {
          class: `skin-tone skin-tone-${this.state.skin}`
        })
      })
    });
  }
  renderLiveRegion() {
    const emoji = this.getEmojiByPos(this.state.pos);
    const contents = emoji ? emoji.name : "";
    return /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
      "aria-live": "polite",
      class: "sr-only",
      children: contents
    });
  }
  renderSkins() {
    const skinToneButton = this.refs.skinToneButton.current;
    const skinToneButtonRect = skinToneButton.getBoundingClientRect();
    const baseRect = this.base.getBoundingClientRect();
    const position = {};
    if (this.dir == "ltr")
      position.right = baseRect.right - skinToneButtonRect.right - 3;
    else
      position.left = skinToneButtonRect.left - baseRect.left - 3;
    if (this.props.previewPosition == "bottom" && this.props.skinTonePosition == "preview")
      position.bottom = baseRect.bottom - skinToneButtonRect.top + 6;
    else {
      position.top = skinToneButtonRect.bottom - baseRect.top + 3;
      position.bottom = "auto";
    }
    return /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
      ref: this.refs.menu,
      role: "radiogroup",
      dir: this.dir,
      "aria-label": $7adb23b0109cc36a$export$dbe3113d60765c1a.skins.choose,
      class: "menu hidden",
      "data-position": position.top ? "top" : "bottom",
      style: position,
      children: [
        ...Array(6).keys()
      ].map((i2) => {
        const skin = i2 + 1;
        const checked = this.state.skin == skin;
        return /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
          children: [
            /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("input", {
              type: "radio",
              name: "skin-tone",
              value: skin,
              "aria-label": $7adb23b0109cc36a$export$dbe3113d60765c1a.skins[skin],
              ref: checked ? this.refs.skinToneRadio : null,
              defaultChecked: checked,
              onChange: () => this.handleSkinMouseOver(skin),
              onKeyDown: (e) => {
                if (e.code == "Enter" || e.code == "Space" || e.code == "Tab") {
                  e.preventDefault();
                  this.handleSkinClick(skin);
                }
              }
            }),
            /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("button", {
              "aria-hidden": "true",
              tabindex: "-1",
              onClick: () => this.handleSkinClick(skin),
              onMouseEnter: () => this.handleSkinMouseOver(skin),
              onMouseLeave: () => this.handleSkinMouseOver(),
              class: "option flex flex-grow flex-middle",
              children: [
                /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("span", {
                  class: `skin-tone skin-tone-${skin}`
                }),
                /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("span", {
                  class: "margin-small-lr",
                  children: $7adb23b0109cc36a$export$dbe3113d60765c1a.skins[skin]
                })
              ]
            })
          ]
        });
      })
    });
  }
  render() {
    const lineWidth = this.props.perLine * this.props.emojiButtonSize;
    return /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("section", {
      id: "root",
      class: "flex flex-column",
      dir: this.dir,
      style: {
        width: this.props.dynamicWidth ? "100%" : `calc(${lineWidth}px + (var(--padding) + var(--sidebar-width)))`
      },
      "data-emoji-set": this.props.set,
      "data-theme": this.state.theme,
      "data-menu": this.state.showSkins ? "" : void 0,
      children: [
        this.props.previewPosition == "top" && this.renderPreview(),
        this.props.navPosition == "top" && this.renderNav(),
        this.props.searchPosition == "sticky" && /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
          class: "padding-lr",
          children: this.renderSearch()
        }),
        /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
          ref: this.refs.scroll,
          class: "scroll flex-grow padding-lr",
          children: /* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b("div", {
            style: {
              width: this.props.dynamicWidth ? "100%" : lineWidth,
              height: "100%"
            },
            children: [
              this.props.searchPosition == "static" && this.renderSearch(),
              this.renderSearchResults(),
              this.renderCategories()
            ]
          })
        }),
        this.props.navPosition == "bottom" && this.renderNav(),
        this.props.previewPosition == "bottom" && this.renderPreview(),
        this.state.showSkins && this.renderSkins(),
        this.renderLiveRegion()
      ]
    });
  }
  constructor(props) {
    super();
    $c770c458706daa72$export$2e2bcd8739ae039(this, "handleClickOutside", (e) => {
      const { element } = this.props;
      if (e.target != element) {
        if (this.state.showSkins)
          this.closeSkins();
        if (this.props.onClickOutside)
          this.props.onClickOutside(e);
      }
    });
    $c770c458706daa72$export$2e2bcd8739ae039(this, "handleBaseClick", (e) => {
      if (!this.state.showSkins)
        return;
      if (!e.target.closest(".menu")) {
        e.preventDefault();
        e.stopImmediatePropagation();
        this.closeSkins();
      }
    });
    $c770c458706daa72$export$2e2bcd8739ae039(this, "handleBaseKeydown", (e) => {
      if (!this.state.showSkins)
        return;
      if (e.key == "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        this.closeSkins();
      }
    });
    $c770c458706daa72$export$2e2bcd8739ae039(this, "handleSearchClick", () => {
      const emoji = this.getEmojiByPos(this.state.pos);
      if (!emoji)
        return;
      this.setState({
        pos: [
          -1,
          -1
        ]
      });
    });
    $c770c458706daa72$export$2e2bcd8739ae039(this, "handleSearchInput", async () => {
      const input = this.refs.searchInput.current;
      if (!input)
        return;
      const { value: value2 } = input;
      const searchResults = await $c4d155af13ad4d4b$export$2e2bcd8739ae039.search(value2);
      const afterRender = () => {
        if (!this.refs.scroll.current)
          return;
        this.refs.scroll.current.scrollTop = 0;
      };
      if (!searchResults)
        return this.setState({
          searchResults,
          pos: [
            -1,
            -1
          ]
        }, afterRender);
      const pos = input.selectionStart == input.value.length ? [
        0,
        0
      ] : [
        -1,
        -1
      ];
      const grid = [];
      grid.setsize = searchResults.length;
      let row = null;
      for (let emoji of searchResults) {
        if (!grid.length || row.length == this.getPerLine()) {
          row = [];
          row.__categoryId = "search";
          row.__index = grid.length;
          grid.push(row);
        }
        row.push(emoji);
      }
      this.ignoreMouse();
      this.setState({
        searchResults: grid,
        pos
      }, afterRender);
    });
    $c770c458706daa72$export$2e2bcd8739ae039(this, "handleSearchKeyDown", (e) => {
      const input = e.currentTarget;
      e.stopImmediatePropagation();
      switch (e.key) {
        case "ArrowLeft":
          this.navigate({
            e,
            input,
            left: true
          });
          break;
        case "ArrowRight":
          this.navigate({
            e,
            input,
            right: true
          });
          break;
        case "ArrowUp":
          this.navigate({
            e,
            input,
            up: true
          });
          break;
        case "ArrowDown":
          this.navigate({
            e,
            input,
            down: true
          });
          break;
        case "Enter":
          e.preventDefault();
          this.handleEmojiClick({
            e,
            pos: this.state.pos
          });
          break;
        case "Escape":
          e.preventDefault();
          if (this.state.searchResults)
            this.clearSearch();
          else
            this.unfocusSearch();
          break;
      }
    });
    $c770c458706daa72$export$2e2bcd8739ae039(this, "clearSearch", () => {
      const input = this.refs.searchInput.current;
      if (!input)
        return;
      input.value = "";
      input.focus();
      this.handleSearchInput();
    });
    $c770c458706daa72$export$2e2bcd8739ae039(this, "handleCategoryClick", ({ category, i: i2 }) => {
      this.scrollTo(i2 == 0 ? {
        row: -1
      } : {
        categoryId: category.id
      });
    });
    $c770c458706daa72$export$2e2bcd8739ae039(this, "openSkins", (e) => {
      const { currentTarget } = e;
      const rect = currentTarget.getBoundingClientRect();
      this.setState({
        showSkins: rect
      }, async () => {
        await $693b183b0a78708f$export$e772c8ff12451969(2);
        const menu = this.refs.menu.current;
        if (!menu)
          return;
        menu.classList.remove("hidden");
        this.refs.skinToneRadio.current.focus();
        this.base.addEventListener("click", this.handleBaseClick, true);
        this.base.addEventListener("keydown", this.handleBaseKeydown, true);
      });
    });
    this.observers = [];
    this.state = {
      pos: [
        -1,
        -1
      ],
      perLine: this.initDynamicPerLine(props),
      visibleRows: {
        0: true
      },
      ...this.getInitialState(props)
    };
  }
}
class $efa000751917694d$export$2e2bcd8739ae039 extends $26f27c338a96b1a6$export$2e2bcd8739ae039 {
  async connectedCallback() {
    const props = $7adb23b0109cc36a$export$75fe5f91d452f94b(this.props, $b247ea80b67298d5$export$2e2bcd8739ae039, this);
    props.element = this;
    props.ref = (component) => {
      this.component = component;
    };
    await $7adb23b0109cc36a$export$2cd8252107eb640b(props);
    if (this.disconnected)
      return;
    $fb96b826c0c5f37a$export$b3890eb0ae9dca99(/* @__PURE__ */ $bd9dd35321b03dd4$export$34b9dba7ce09269b($89bd6bb200cc8fef$export$2e2bcd8739ae039, {
      ...props
    }), this.shadowRoot);
  }
  constructor(props) {
    super(props, {
      styles: /* @__PURE__ */ $parcel$interopDefault($329d53ba9fd7125f$exports)
    });
  }
}
$c770c458706daa72$export$2e2bcd8739ae039($efa000751917694d$export$2e2bcd8739ae039, "Props", $b247ea80b67298d5$export$2e2bcd8739ae039);
if (typeof customElements !== "undefined" && !customElements.get("em-emoji-picker"))
  customElements.define("em-emoji-picker", $efa000751917694d$export$2e2bcd8739ae039);
var $329d53ba9fd7125f$exports = {};
$329d53ba9fd7125f$exports = ':host {\n  width: min-content;\n  height: 435px;\n  min-height: 230px;\n  border-radius: var(--border-radius);\n  box-shadow: var(--shadow);\n  --border-radius: 10px;\n  --category-icon-size: 18px;\n  --font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", sans-serif;\n  --font-size: 15px;\n  --preview-placeholder-size: 21px;\n  --preview-title-size: 1.1em;\n  --preview-subtitle-size: .9em;\n  --shadow-color: 0deg 0% 0%;\n  --shadow: .3px .5px 2.7px hsl(var(--shadow-color) / .14), .4px .8px 1px -3.2px hsl(var(--shadow-color) / .14), 1px 2px 2.5px -4.5px hsl(var(--shadow-color) / .14);\n  display: flex;\n}\n\n[data-theme="light"] {\n  --em-rgb-color: var(--rgb-color, 34, 36, 39);\n  --em-rgb-accent: var(--rgb-accent, 34, 102, 237);\n  --em-rgb-background: var(--rgb-background, 255, 255, 255);\n  --em-rgb-input: var(--rgb-input, 255, 255, 255);\n  --em-color-border: var(--color-border, rgba(0, 0, 0, .05));\n  --em-color-border-over: var(--color-border-over, rgba(0, 0, 0, .1));\n}\n\n[data-theme="dark"] {\n  --em-rgb-color: var(--rgb-color, 222, 222, 221);\n  --em-rgb-accent: var(--rgb-accent, 58, 130, 247);\n  --em-rgb-background: var(--rgb-background, 21, 22, 23);\n  --em-rgb-input: var(--rgb-input, 0, 0, 0);\n  --em-color-border: var(--color-border, rgba(255, 255, 255, .1));\n  --em-color-border-over: var(--color-border-over, rgba(255, 255, 255, .2));\n}\n\n#root {\n  --color-a: rgb(var(--em-rgb-color));\n  --color-b: rgba(var(--em-rgb-color), .65);\n  --color-c: rgba(var(--em-rgb-color), .45);\n  --padding: 12px;\n  --padding-small: calc(var(--padding) / 2);\n  --sidebar-width: 16px;\n  --duration: 225ms;\n  --duration-fast: 125ms;\n  --duration-instant: 50ms;\n  --easing: cubic-bezier(.4, 0, .2, 1);\n  width: 100%;\n  text-align: left;\n  border-radius: var(--border-radius);\n  background-color: rgb(var(--em-rgb-background));\n  position: relative;\n}\n\n@media (prefers-reduced-motion) {\n  #root {\n    --duration: 0;\n    --duration-fast: 0;\n    --duration-instant: 0;\n  }\n}\n\n#root[data-menu] button {\n  cursor: auto;\n}\n\n#root[data-menu] .menu button {\n  cursor: pointer;\n}\n\n:host, #root, input, button {\n  color: rgb(var(--em-rgb-color));\n  font-family: var(--font-family);\n  font-size: var(--font-size);\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n  line-height: normal;\n}\n\n*, :before, :after {\n  box-sizing: border-box;\n  min-width: 0;\n  margin: 0;\n  padding: 0;\n}\n\n.relative {\n  position: relative;\n}\n\n.flex {\n  display: flex;\n}\n\n.flex-auto {\n  flex: none;\n}\n\n.flex-center {\n  justify-content: center;\n}\n\n.flex-column {\n  flex-direction: column;\n}\n\n.flex-grow {\n  flex: auto;\n}\n\n.flex-middle {\n  align-items: center;\n}\n\n.flex-wrap {\n  flex-wrap: wrap;\n}\n\n.padding {\n  padding: var(--padding);\n}\n\n.padding-t {\n  padding-top: var(--padding);\n}\n\n.padding-lr {\n  padding-left: var(--padding);\n  padding-right: var(--padding);\n}\n\n.padding-r {\n  padding-right: var(--padding);\n}\n\n.padding-small {\n  padding: var(--padding-small);\n}\n\n.padding-small-b {\n  padding-bottom: var(--padding-small);\n}\n\n.padding-small-lr {\n  padding-left: var(--padding-small);\n  padding-right: var(--padding-small);\n}\n\n.margin {\n  margin: var(--padding);\n}\n\n.margin-r {\n  margin-right: var(--padding);\n}\n\n.margin-l {\n  margin-left: var(--padding);\n}\n\n.margin-small-l {\n  margin-left: var(--padding-small);\n}\n\n.margin-small-lr {\n  margin-left: var(--padding-small);\n  margin-right: var(--padding-small);\n}\n\n.align-l {\n  text-align: left;\n}\n\n.align-r {\n  text-align: right;\n}\n\n.color-a {\n  color: var(--color-a);\n}\n\n.color-b {\n  color: var(--color-b);\n}\n\n.color-c {\n  color: var(--color-c);\n}\n\n.ellipsis {\n  white-space: nowrap;\n  max-width: 100%;\n  width: auto;\n  text-overflow: ellipsis;\n  overflow: hidden;\n}\n\n.sr-only {\n  width: 1px;\n  height: 1px;\n  position: absolute;\n  top: auto;\n  left: -10000px;\n  overflow: hidden;\n}\n\na {\n  cursor: pointer;\n  color: rgb(var(--em-rgb-accent));\n}\n\na:hover {\n  text-decoration: underline;\n}\n\n.spacer {\n  height: 10px;\n}\n\n[dir="rtl"] .scroll {\n  padding-left: 0;\n  padding-right: var(--padding);\n}\n\n.scroll {\n  padding-right: 0;\n  overflow-x: hidden;\n  overflow-y: auto;\n}\n\n.scroll::-webkit-scrollbar {\n  width: var(--sidebar-width);\n  height: var(--sidebar-width);\n}\n\n.scroll::-webkit-scrollbar-track {\n  border: 0;\n}\n\n.scroll::-webkit-scrollbar-button {\n  width: 0;\n  height: 0;\n  display: none;\n}\n\n.scroll::-webkit-scrollbar-corner {\n  background-color: rgba(0, 0, 0, 0);\n}\n\n.scroll::-webkit-scrollbar-thumb {\n  min-height: 20%;\n  min-height: 65px;\n  border: 4px solid rgb(var(--em-rgb-background));\n  border-radius: 8px;\n}\n\n.scroll::-webkit-scrollbar-thumb:hover {\n  background-color: var(--em-color-border-over) !important;\n}\n\n.scroll:hover::-webkit-scrollbar-thumb {\n  background-color: var(--em-color-border);\n}\n\n.sticky {\n  z-index: 1;\n  background-color: rgba(var(--em-rgb-background), .9);\n  -webkit-backdrop-filter: blur(4px);\n  backdrop-filter: blur(4px);\n  font-weight: 500;\n  position: sticky;\n  top: -1px;\n}\n\n[dir="rtl"] .search input[type="search"] {\n  padding: 10px 2.2em 10px 2em;\n}\n\n[dir="rtl"] .search .loupe {\n  left: auto;\n  right: .7em;\n}\n\n[dir="rtl"] .search .delete {\n  left: .7em;\n  right: auto;\n}\n\n.search {\n  z-index: 2;\n  position: relative;\n}\n\n.search input, .search button {\n  font-size: calc(var(--font-size)  - 1px);\n}\n\n.search input[type="search"] {\n  width: 100%;\n  background-color: var(--em-color-border);\n  transition-duration: var(--duration);\n  transition-property: background-color, box-shadow;\n  transition-timing-function: var(--easing);\n  border: 0;\n  border-radius: 10px;\n  outline: 0;\n  padding: 10px 2em 10px 2.2em;\n  display: block;\n}\n\n.search input[type="search"]::-ms-input-placeholder {\n  color: inherit;\n  opacity: .6;\n}\n\n.search input[type="search"]::placeholder {\n  color: inherit;\n  opacity: .6;\n}\n\n.search input[type="search"], .search input[type="search"]::-webkit-search-decoration, .search input[type="search"]::-webkit-search-cancel-button, .search input[type="search"]::-webkit-search-results-button, .search input[type="search"]::-webkit-search-results-decoration {\n  -webkit-appearance: none;\n  -ms-appearance: none;\n  appearance: none;\n}\n\n.search input[type="search"]:focus {\n  background-color: rgb(var(--em-rgb-input));\n  box-shadow: inset 0 0 0 1px rgb(var(--em-rgb-accent)), 0 1px 3px rgba(65, 69, 73, .2);\n}\n\n.search .icon {\n  z-index: 1;\n  color: rgba(var(--em-rgb-color), .7);\n  position: absolute;\n  top: 50%;\n  transform: translateY(-50%);\n}\n\n.search .loupe {\n  pointer-events: none;\n  left: .7em;\n}\n\n.search .delete {\n  right: .7em;\n}\n\nsvg {\n  fill: currentColor;\n  width: 1em;\n  height: 1em;\n}\n\nbutton {\n  -webkit-appearance: none;\n  -ms-appearance: none;\n  appearance: none;\n  cursor: pointer;\n  color: currentColor;\n  background-color: rgba(0, 0, 0, 0);\n  border: 0;\n}\n\n#nav {\n  z-index: 2;\n  padding-top: 12px;\n  padding-bottom: 12px;\n  padding-right: var(--sidebar-width);\n  position: relative;\n}\n\n#nav button {\n  color: var(--color-b);\n  transition: color var(--duration) var(--easing);\n}\n\n#nav button:hover {\n  color: var(--color-a);\n}\n\n#nav svg, #nav img {\n  width: var(--category-icon-size);\n  height: var(--category-icon-size);\n}\n\n#nav[dir="rtl"] .bar {\n  left: auto;\n  right: 0;\n}\n\n#nav .bar {\n  width: 100%;\n  height: 3px;\n  background-color: rgb(var(--em-rgb-accent));\n  transition: transform var(--duration) var(--easing);\n  border-radius: 3px 3px 0 0;\n  position: absolute;\n  bottom: -12px;\n  left: 0;\n}\n\n#nav button[aria-selected] {\n  color: rgb(var(--em-rgb-accent));\n}\n\n#preview {\n  z-index: 2;\n  padding: calc(var(--padding)  + 4px) var(--padding);\n  padding-right: var(--sidebar-width);\n  position: relative;\n}\n\n#preview .preview-placeholder {\n  font-size: var(--preview-placeholder-size);\n}\n\n#preview .preview-title {\n  font-size: var(--preview-title-size);\n}\n\n#preview .preview-subtitle {\n  font-size: var(--preview-subtitle-size);\n}\n\n#nav:before, #preview:before {\n  content: "";\n  height: 2px;\n  position: absolute;\n  left: 0;\n  right: 0;\n}\n\n#nav[data-position="top"]:before, #preview[data-position="top"]:before {\n  background: linear-gradient(to bottom, var(--em-color-border), transparent);\n  top: 100%;\n}\n\n#nav[data-position="bottom"]:before, #preview[data-position="bottom"]:before {\n  background: linear-gradient(to top, var(--em-color-border), transparent);\n  bottom: 100%;\n}\n\n.category:last-child {\n  min-height: calc(100% + 1px);\n}\n\n.category button {\n  font-family: -apple-system, BlinkMacSystemFont, Helvetica Neue, sans-serif;\n  position: relative;\n}\n\n.category button > * {\n  position: relative;\n}\n\n.category button .background {\n  opacity: 0;\n  background-color: var(--em-color-border);\n  transition: opacity var(--duration-fast) var(--easing) var(--duration-instant);\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n}\n\n.category button:hover .background {\n  transition-duration: var(--duration-instant);\n  transition-delay: 0s;\n}\n\n.category button[aria-selected] .background {\n  opacity: 1;\n}\n\n.category button[data-keyboard] .background {\n  transition: none;\n}\n\n.row {\n  width: 100%;\n  position: absolute;\n  top: 0;\n  left: 0;\n}\n\n.skin-tone-button {\n  border: 1px solid rgba(0, 0, 0, 0);\n  border-radius: 100%;\n}\n\n.skin-tone-button:hover {\n  border-color: var(--em-color-border);\n}\n\n.skin-tone-button:active .skin-tone {\n  transform: scale(.85) !important;\n}\n\n.skin-tone-button .skin-tone {\n  transition: transform var(--duration) var(--easing);\n}\n\n.skin-tone-button[aria-selected] {\n  background-color: var(--em-color-border);\n  border-top-color: rgba(0, 0, 0, .05);\n  border-bottom-color: rgba(0, 0, 0, 0);\n  border-left-width: 0;\n  border-right-width: 0;\n}\n\n.skin-tone-button[aria-selected] .skin-tone {\n  transform: scale(.9);\n}\n\n.menu {\n  z-index: 2;\n  white-space: nowrap;\n  border: 1px solid var(--em-color-border);\n  background-color: rgba(var(--em-rgb-background), .9);\n  -webkit-backdrop-filter: blur(4px);\n  backdrop-filter: blur(4px);\n  transition-property: opacity, transform;\n  transition-duration: var(--duration);\n  transition-timing-function: var(--easing);\n  border-radius: 10px;\n  padding: 4px;\n  position: absolute;\n  box-shadow: 1px 1px 5px rgba(0, 0, 0, .05);\n}\n\n.menu.hidden {\n  opacity: 0;\n}\n\n.menu[data-position="bottom"] {\n  transform-origin: 100% 100%;\n}\n\n.menu[data-position="bottom"].hidden {\n  transform: scale(.9)rotate(-3deg)translateY(5%);\n}\n\n.menu[data-position="top"] {\n  transform-origin: 100% 0;\n}\n\n.menu[data-position="top"].hidden {\n  transform: scale(.9)rotate(3deg)translateY(-5%);\n}\n\n.menu input[type="radio"] {\n  clip: rect(0 0 0 0);\n  width: 1px;\n  height: 1px;\n  border: 0;\n  margin: 0;\n  padding: 0;\n  position: absolute;\n  overflow: hidden;\n}\n\n.menu input[type="radio"]:checked + .option {\n  box-shadow: 0 0 0 2px rgb(var(--em-rgb-accent));\n}\n\n.option {\n  width: 100%;\n  border-radius: 6px;\n  padding: 4px 6px;\n}\n\n.option:hover {\n  color: #fff;\n  background-color: rgb(var(--em-rgb-accent));\n}\n\n.skin-tone {\n  width: 16px;\n  height: 16px;\n  border-radius: 100%;\n  display: inline-block;\n  position: relative;\n  overflow: hidden;\n}\n\n.skin-tone:after {\n  content: "";\n  mix-blend-mode: overlay;\n  background: linear-gradient(rgba(255, 255, 255, .2), rgba(0, 0, 0, 0));\n  border: 1px solid rgba(0, 0, 0, .8);\n  border-radius: 100%;\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  right: 0;\n  box-shadow: inset 0 -2px 3px #000, inset 0 1px 2px #fff;\n}\n\n.skin-tone-1 {\n  background-color: #ffc93a;\n}\n\n.skin-tone-2 {\n  background-color: #ffdab7;\n}\n\n.skin-tone-3 {\n  background-color: #e7b98f;\n}\n\n.skin-tone-4 {\n  background-color: #c88c61;\n}\n\n.skin-tone-5 {\n  background-color: #a46134;\n}\n\n.skin-tone-6 {\n  background-color: #5d4437;\n}\n\n[data-index] {\n  justify-content: space-between;\n}\n\n[data-emoji-set="twitter"] .skin-tone:after {\n  box-shadow: none;\n  border-color: rgba(0, 0, 0, .5);\n}\n\n[data-emoji-set="twitter"] .skin-tone-1 {\n  background-color: #fade72;\n}\n\n[data-emoji-set="twitter"] .skin-tone-2 {\n  background-color: #f3dfd0;\n}\n\n[data-emoji-set="twitter"] .skin-tone-3 {\n  background-color: #eed3a8;\n}\n\n[data-emoji-set="twitter"] .skin-tone-4 {\n  background-color: #cfad8d;\n}\n\n[data-emoji-set="twitter"] .skin-tone-5 {\n  background-color: #a8805d;\n}\n\n[data-emoji-set="twitter"] .skin-tone-6 {\n  background-color: #765542;\n}\n\n[data-emoji-set="google"] .skin-tone:after {\n  box-shadow: inset 0 0 2px 2px rgba(0, 0, 0, .4);\n}\n\n[data-emoji-set="google"] .skin-tone-1 {\n  background-color: #f5c748;\n}\n\n[data-emoji-set="google"] .skin-tone-2 {\n  background-color: #f1d5aa;\n}\n\n[data-emoji-set="google"] .skin-tone-3 {\n  background-color: #d4b48d;\n}\n\n[data-emoji-set="google"] .skin-tone-4 {\n  background-color: #aa876b;\n}\n\n[data-emoji-set="google"] .skin-tone-5 {\n  background-color: #916544;\n}\n\n[data-emoji-set="google"] .skin-tone-6 {\n  background-color: #61493f;\n}\n\n[data-emoji-set="facebook"] .skin-tone:after {\n  border-color: rgba(0, 0, 0, .4);\n  box-shadow: inset 0 -2px 3px #000, inset 0 1px 4px #fff;\n}\n\n[data-emoji-set="facebook"] .skin-tone-1 {\n  background-color: #f5c748;\n}\n\n[data-emoji-set="facebook"] .skin-tone-2 {\n  background-color: #f1d5aa;\n}\n\n[data-emoji-set="facebook"] .skin-tone-3 {\n  background-color: #d4b48d;\n}\n\n[data-emoji-set="facebook"] .skin-tone-4 {\n  background-color: #aa876b;\n}\n\n[data-emoji-set="facebook"] .skin-tone-5 {\n  background-color: #916544;\n}\n\n[data-emoji-set="facebook"] .skin-tone-6 {\n  background-color: #61493f;\n}\n\n';
const submitEventChat = new Event("submit-form-chat");
const CHAT = (() => {
  const chatBox = document.querySelector(".chat-box-admin");
  const buttonShowChatBox = chatBox.querySelector(".show-chat-box");
  const chatHTML = chatBox.querySelector(".chat-content");
  const messageEl = chatHTML.querySelector(".message");
  const formChat = chatHTML.querySelector(".form-chat");
  const editorChat = chatHTML.querySelector(".editor-chat");
  const actions = chatHTML.querySelector(".actions");
  const chatContentHeader = chatHTML.querySelector(".chat-content-header");
  const chatClose = chatContentHeader.querySelector(".chat-close");
  const actionPlus = chatHTML.querySelector(".action-plus");
  const actionMenuSub = actionPlus.querySelector(".action-sub-menu");
  let stickerBox = null;
  let tabBox = null;
  let stickerItemList = null;
  const userId = chatBox.dataset.userId;
  let observer;
  let indexEmojiCurrent = 0;
  let page = 2;
  let pageLoadMore = false;
  let flagWidth = false, rectAction, actionsWidth, addEventNow = false;
  function addEvent() {
    if (addEventNow)
      return;
    addEventNow = true;
    socket.on("connect", () => {
      chatHTML.classList.add("show");
      addEventConnect();
      socket.emit(
        "connect-admin-socket",
        "admin",
        userId
      );
    });
    socket.on("connect_error", () => {
      console.log(2);
    });
    socket.on("disconnect", () => {
      formChat.removeEventListener("submit-form-chat", handleChat);
      editorChat.removeEventListener("keyup", handleKeyup);
      editorChat.removeEventListener("keydown", handleKeydown);
      chatClose.removeEventListener("keyup", handleDisconnect);
      document.removeEventListener("mouseup", handleDocumentAddSocket);
      actionMenuSub.removeEventListener(
        "mousedown",
        handleActionMenuMousedown
      );
      actionPlus.removeEventListener(
        "mousedown",
        handleActionPlusMouseDown
      );
      messageEl.innerHTML = "";
    });
    socket.on("join room success", (value2) => {
      const listData = utils.dD(value2);
      listData.forEach((data) => {
        messageEl.insertAdjacentHTML("beforeend", templateMessage(data, data.user.socketId === socket.id, messageEl));
      });
      messageEl.scrollTo({
        top: messageEl.scrollHeight - messageEl.clientHeight
      });
      page = 2;
      pageLoadMore = false;
      loadMoreChat(messageEl);
    });
    socket.on("chat-admin-client", (data) => {
      data = utils.dD(data);
      messageEl.insertAdjacentHTML("beforeend", templateMessage(data, data.user.socketId === socket.id, messageEl));
      messageEl.scrollTo({
        behavior: "smooth",
        top: messageEl.scrollHeight - messageEl.clientHeight
      });
    });
    socket.on("response-message-load", (value2) => {
      const listData = utils.dD(value2);
      const loading = messageEl.querySelector(".load-more-message");
      if (loading) {
        loading.remove();
      }
      listData.forEach((data) => {
        messageEl.insertAdjacentHTML("afterbegin", templateMessage(data, data.user.socketId === socket.id, messageEl));
      });
      if (listData.length > 0) {
        pageLoadMore = false;
        page++;
        loadMoreChat(messageEl);
      }
    });
  }
  function templateMessage(response, isMe, messageEl2) {
    const { data, user } = response;
    const avatar = JSON.parse(user.avatar);
    const lastItem = messageEl2.children[messageEl2.children.length - 1];
    if (lastItem && lastItem.classList.contains("left") && lastItem.dataset.id === user.socketId && lastItem.querySelector(".avatar img")) {
      lastItem.querySelector(".avatar img").remove();
    }
    const content = getContentChat(data);
    return `<div class="${isMe ? "right" : "left"}" data-id=${user.socketId}>
            ${isMe ? `` : `<div class="avatar">
                <img src="/${avatar.path_absolute}" alt="${user.fullname}" />
            </div>`}
            ${isMe ? `<div class="action-content">
                <button class="emoji-mart">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm177.6 62.1C192.8 334.5 218.8 352 256 352s63.2-17.5 78.4-33.9c9-9.7 24.2-10.4 33.9-1.4s10.4 24.2 1.4 33.9c-22 23.8-60 49.4-113.6 49.4s-91.7-25.5-113.6-49.4c-9-9.7-8.4-24.9 1.4-33.9s24.9-8.4 33.9 1.4zM144.4 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>
                    <div class="shadow"></div>
                </button>
            </div>` : ""}
            <div class="content">${content}</div>
            ${isMe ? `` : `<div class="action-content">
                <button class="emoji-mart">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm177.6 62.1C192.8 334.5 218.8 352 256 352s63.2-17.5 78.4-33.9c9-9.7 24.2-10.4 33.9-1.4s10.4 24.2 1.4 33.9c-22 23.8-60 49.4-113.6 49.4s-91.7-25.5-113.6-49.4c-9-9.7-8.4-24.9 1.4-33.9s24.9-8.4 33.9 1.4zM144.4 208a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm192-32a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>
                    <div class="shadow"></div>
                </button>
            </div>`}
        </div>`;
  }
  function getContentChat(data) {
    switch (data.type) {
      case "message":
        return data.message;
      case "image":
        return 1;
      case "emoji":
        return 2;
      case "feel":
        return 3;
      case "gif":
        return 4;
    }
  }
  function addEventConnect() {
    setTimeout(() => {
      rectAction = actions.getBoundingClientRect();
      actionsWidth = rectAction.width;
    }, 500);
    Array.from(actions.children).forEach((button) => {
      if (button.dataset.type === "sticker") {
        button.onmouseup = (e) => {
          if (!stickerBox || stickerBox.classList.contains("hidden")) {
            e.stopPropagation();
            handleShowSticker(e, button);
          }
        };
      }
    });
    editorChat.addEventListener("keyup", handleKeyup);
    editorChat.addEventListener("keydown", handleKeydown);
    chatClose.addEventListener("click", handleDisconnect);
    actionMenuSub.addEventListener("mousedown", handleActionMenuMousedown);
    actionPlus.addEventListener("mousedown", handleActionPlusMouseDown);
    document.addEventListener("mouseup", handleDocumentAddSocket);
    formChat.addEventListener("submit-form-chat", handleChat);
    formChat.addEventListener("submit", handleChat);
  }
  async function handleShowSticker(e, button) {
    if (!stickerBox) {
      createAndAddEventStickerBox(e, button);
    } else {
      stickerBox.classList.remove("hidden");
    }
    const rectButton = button.getBoundingClientRect();
    const left = window.innerWidth - (rectButton.right + 330);
    stickerBox.style.left = -Math.abs(left) + "px";
  }
  function createAndAddEventStickerBox(e, button) {
    const listTab = listStickers.map((item, index) => {
      const tabElement = document.createElement("div");
      tabElement.className = "tab-item";
      tabElement.dataset.index = index;
      const image = document.createElement("img");
      image.src = item.label;
      tabElement.append(image);
      return tabElement;
    });
    stickerBox = document.createElement("div");
    stickerBox.className = "sticker-box";
    tabBox = document.createElement("div");
    tabBox.className = "tab-sticker-box";
    stickerItemList = document.createElement("div");
    stickerItemList.className = "sticker-items";
    tabBox.append(...listTab);
    stickerBox.append(tabBox, stickerItemList);
    button.append(stickerBox);
    listTab.forEach((tab, index) => {
      tab.onclick = async (e2) => {
        e2.stopPropagation();
        if (tab.classList.contains("active"))
          return false;
        stickerItemList.style.display = "flex";
        stickerItemList.innerHTML = `<style>.rs-loading-main{display: flex;width:100%;height:100%; justify-content: center; align-items: center;} .rsl-wave {font-size: var(--rs-l-size, 2rem); color: var(--rs-l-color, #ee4d2d); display: inline-flex; align-items: center; width: 1.25em; height: 1.25em; } .rsl-wave--icon { display: block; background: currentColor; border-radius: 99px; width: 0.25em; height: 0.25em; margin-right: 0.25em; margin-bottom: -0.25em; -webkit-animation: rsla_wave .56s linear infinite; animation: rsla_wave .56s linear infinite; -webkit-transform: translateY(.0001%); transform: translateY(.0001%); } @-webkit-keyframes rsla_wave { 50% { -webkit-transform: translateY(-0.25em); transform: translateY(-0.25em); } } @keyframes rsla_wave { 50% { -webkit-transform: translateY(-0.25em); transform: translateY(-0.25em); } } .rsl-wave--icon:nth-child(2) { -webkit-animation-delay: -.14s; animation-delay: -.14s; } .rsl-wave--icon:nth-child(3) { -webkit-animation-delay: -.28s; animation-delay: -.28s; margin-right: 0; }</style><div class="rs-loading-main"><div class="rsl-wave"> <span class="rsl-wave--icon"></span> <span class="rsl-wave--icon"></span> <span class="rsl-wave--icon"></span> </div></div>`;
        indexEmojiCurrent = +tab.dataset.index;
        let items = await Promise.all(listStickers[tab.dataset.index].items.map((item) => {
          return emojiUtil.emojiAll(item.url, item.totalRow, item.totalColumn, item.countLeftInTotalRow, item.ms);
        }).map((item) => item));
        if (tabBox.querySelector(".active")) {
          tabBox.querySelector(".active").classList.remove("active");
        }
        tab.classList.add("active");
        stickerItemList.style.display = "grid";
        stickerItemList.innerHTML = "";
        stickerItemList.append(...items);
        emojiUtil.addEventEmoji(stickerItemList);
      };
      if (indexEmojiCurrent === index) {
        setTimeout(() => {
          tab.click();
        }, 0);
      }
    });
    stickerItemList.onmouseup = handleEventSendSticker;
  }
  function handleEventSendSticker(e) {
    e.stopPropagation();
    if (e.target.classList.contains("emoji")) {
      stickerBox.style.transformOrigin = `${Math.abs(stickerBox.style.left.replace("px", ""))}px bottom`;
      stickerBox.classList.add("hidden");
    }
  }
  function handleKeyup() {
    if (editorChat.innerText.length && !flagWidth) {
      flagWidth = true;
      editorChat.nextElementSibling.style.opacity = 0;
      actions.style.overflow = "hidden";
      actions.animate(
        [
          {
            width: `${actionsWidth}px`
          },
          {
            width: "26px"
          }
        ],
        {
          duration: 300,
          fill: "forwards"
        }
      ).finished.then((response) => {
        actions.classList.add("hidden");
        actionPlus.classList.remove("hidden");
      });
    } else if (editorChat.innerText.length === 0 && flagWidth) {
      flagWidth = false;
      editorChat.nextElementSibling.style.opacity = 1;
      actions.classList.remove("hidden");
      actionPlus.classList.add("hidden");
      actions.animate(
        [
          {
            width: `${actionsWidth}px`
          }
        ],
        {
          duration: 300,
          fill: "forwards"
        }
      ).finished.then((response) => {
        actions.style.overflow = null;
      });
    }
  }
  function handleKeydown(e) {
    if (editorChat.innerText.length && !flagWidth) {
      flagWidth = true;
      editorChat.nextElementSibling.style.opacity = 0;
    }
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      submitEventChat.typeMessage = "message";
      formChat.dispatchEvent(submitEventChat);
      return false;
    }
  }
  function handleChat(e) {
    e.preventDefault();
    e.typeMessage = "message";
    chat(editorChat.innerText, e);
    editorChat.innerText = "";
  }
  function handleShowChat() {
    buttonShowChatBox.onclick = function() {
      socket.typeRoom = 1;
      socket.connect();
      addEvent();
    };
  }
  function handleDisconnect(e) {
    socket.disconnect();
    chatHTML.classList.remove("show");
  }
  function handleActionMenuMousedown(e) {
    e.stopPropagation();
  }
  function handleActionPlusMouseDown() {
    actionMenuSub.classList.toggle("active");
  }
  function handleDocumentAddSocket(e) {
    if (!e.target.closest(".action-plus")) {
      actionMenuSub.classList.remove("active");
    }
    if (stickerBox && !stickerBox.classList.contains("hidden") && !e.target.closest(".sticker-box")) {
      stickerBox.style.transformOrigin = `${Math.abs(stickerBox.style.left.replace("px", ""))}px bottom`;
      stickerBox.classList.add("hidden");
    }
  }
  async function chat(data, event) {
    socket.volatile.emit("chat-admin-socket", "admin", userId, utils.eD(data), event.typeMessage);
  }
  async function loadMoreChat(element) {
    let elementHeading = element.children[0];
    observer = new IntersectionObserver(async (entries) => {
      for (let i2 = 0; i2 < entries.length; i2++) {
        if (entries[i2].isIntersecting && entries[i2].intersectionRatio >= 0 && !pageLoadMore) {
          pageLoadMore = true;
          observer.disconnect();
          socket.volatile.emit("load-more-message", "admin", userId, page);
          const loading = document.createElement("div");
          loading.className = "load-more-message";
          loading.innerHTML = `<style>.rs-loading-main{display: flex;width:100%;height:100%; justify-content: center; align-items: center;} .rsl-wave {font-size: var(--rs-l-size, 2rem); color: var(--rs-l-color, #ee4d2d); display: inline-flex; align-items: center; width: 1.25em; height: 1.25em; } .rsl-wave--icon { display: block; background: currentColor; border-radius: 99px; width: 0.25em; height: 0.25em; margin-right: 0.25em; margin-bottom: -0.25em; -webkit-animation: rsla_wave .56s linear infinite; animation: rsla_wave .56s linear infinite; -webkit-transform: translateY(.0001%); transform: translateY(.0001%); } @-webkit-keyframes rsla_wave { 50% { -webkit-transform: translateY(-0.25em); transform: translateY(-0.25em); } } @keyframes rsla_wave { 50% { -webkit-transform: translateY(-0.25em); transform: translateY(-0.25em); } } .rsl-wave--icon:nth-child(2) { -webkit-animation-delay: -.14s; animation-delay: -.14s; } .rsl-wave--icon:nth-child(3) { -webkit-animation-delay: -.28s; animation-delay: -.28s; margin-right: 0; }</style><div class="rs-loading-main"><div class="rsl-wave"> <span class="rsl-wave--icon"></span> <span class="rsl-wave--icon"></span> <span class="rsl-wave--icon"></span> </div></div>`;
          element.prepend(loading);
        }
      }
    });
    observer.observe(elementHeading);
  }
  return {
    init: () => {
      handleShowChat();
    }
  };
})();
const MEDIA = (() => {
  async function showMedia(e, imageForm, buttonChooseImage) {
    const iframeContainer = document.createElement("div");
    iframeContainer.className = "media-box";
    const loading = document.createElement("div");
    Object.assign(iframeContainer.style, {
      display: "flex",
      position: "fixed",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,.2)",
      zIndex: 1e4,
      inset: 0
    });
    Object.assign(loading.style, {
      height: "40px",
      width: "40px",
      borderStyle: "solid",
      borderRadius: "50%",
      borderWidth: "4px",
      borderColor: "transparent coral coral coral"
    });
    loading.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }], {
      iterations: Infinity,
      easing: "linear",
      duration: 300
    });
    iframeContainer.append(loading);
    document.body.append(iframeContainer);
    const iframeImage = document.createElement("iframe");
    iframeImage.setAttribute("src", "/admin/medias");
    Object.assign(iframeImage.style, {
      width: "0",
      height: "0",
      borderRadius: "6px",
      border: "none",
      boxShadow: "0 0 6px white"
    });
    iframeContainer.append(iframeImage);
    iframeImage.dataset.uuid = imageForm.dataset.id;
    iframeImage.dataset.type = buttonChooseImage.dataset.type;
    iframeImage.onload = function() {
      loading.remove();
      Object.assign(iframeImage.style, {
        width: "90vw",
        height: "90vh"
      });
    };
    iframeContainer.addEventListener("click", function(e2) {
      iframeContainer.remove();
    });
  }
  return {
    init: () => {
      const imageFormEls = document.querySelectorAll(".image-form");
      imageFormEls.forEach((imageForm) => {
        let uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2);
        imageForm.dataset.id = uniqueId;
        const buttonChooseImage = imageForm.querySelector(".btn-choose-image");
        const buttonRemoveImage = imageForm.querySelector(".btn-remove-image");
        imageForm.addEventListener("click", () => {
          buttonChooseImage.click();
        });
        buttonChooseImage.addEventListener("click", (e) => {
          e.stopPropagation();
          showMedia(e, imageForm, buttonChooseImage);
        });
        buttonRemoveImage.addEventListener("click", (e) => {
          e.stopPropagation();
        });
      });
    },
    event: () => {
      window.addEventListener("choose-image", function(e) {
        const data = e.data;
        const type = e.typeImage;
        const imageFormEl = document.querySelector(`.image-form[data-id="${e.uuid}"]`);
        const textarea = imageFormEl.querySelector("textarea");
        switch (type) {
          case "last":
            const imageData = JSON.parse(data);
            textarea.innerText = data;
            const imageEl = imageFormEl.querySelector("img");
            imageEl.src = "/" + imageData.path_absolute;
            break;
        }
        const iframeBox = document.querySelector(".media-box");
        iframeBox.remove();
      });
    }
  };
})();
window.addEventListener("DOMContentLoaded", function() {
  MEDIA.init();
  MEDIA.event();
  CHAT.init();
});
