const aws = require('./aws');
const aws_cloudfront_lambda = require('./aws_cloudfront_lambda');
const azure = require('./azure');

const providers = {
  aws,
  aws_cloudfront_lambda,
  azure
};

module.exports = function getProvider(options) {
  const { provider = 'aws' } = options;

  if (provider in providers) {
    return providers[provider](options);
  }

  throw new Error(`Unsupported provider ${provider}`);
};
