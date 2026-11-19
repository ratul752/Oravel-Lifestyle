// Single Vercel function; the rewrite supplies the original API path.
const handler = require('../server');
module.exports = (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const rewritten = url.searchParams.get('__oravel_path');
  if (rewritten !== null) {
    if (!/^[a-zA-Z0-9_./%~-]+$/.test(rewritten) || rewritten.includes('..')) {
      res.statusCode = 400;
      return res.end('Invalid API path');
    }
    url.pathname = '/api/' + rewritten.replace(/^\/+/, '');
    url.searchParams.delete('__oravel_path');
    req.url = url.pathname + url.search;
  }
  return handler(req, res);
};
