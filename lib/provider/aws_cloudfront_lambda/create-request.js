"use strict";

const URL = require('url');

const Request = require('../../request');

function requestMethod(request) {
  return request.method;
}

function requestRemoteAddress(request) {
  return request.clientIp;
}

function requestHeaders(request) {
  let headers = Object.keys(request.headers).reduce((headers, key) => {
    headers[request.headers[key][0].key.toLowerCase()] = request.headers[key][0].value;
    return headers;
  }, {});

  return headers;
}

function requestBody(request) {
  const type = typeof request.body;

  if (Buffer.isBuffer(request.body)) {
    return request.body;
  } else if (type === 'string') {
    return Buffer.from(request.body, request.isBase64Encoded ? 'base64' : 'utf8');
  } else if (type === 'object') {
    return Buffer.from(JSON.stringify(request.body));
  }
  return ''
}

function requestUrl(request) {
  return URL.format({
    pathname: request.uri,
    search: request.querystring,
  });
}

module.exports = (event, context, options) => {
  console.log("event", JSON.stringify(event))
  const request = event.Records[0].cf.request
  const method = requestMethod(request);
  const remoteAddress = requestRemoteAddress(request);
  const headers = requestHeaders(request);
  const body = requestBody(request);
  const url = requestUrl(request);

  if (typeof options.requestId === 'string' && options.requestId.length > 0) {
    const header = options.requestId.toLowerCase();
    const requestId = headers[header] || event.requestContext.requestId;
    if (requestId) {
      headers[header] = requestId;
    }
  }

  const req = new Request({
    method,
    headers,
    body,
    remoteAddress,
    url,
  });

  req.requestContext = event.requestContext;
  return req;
};
