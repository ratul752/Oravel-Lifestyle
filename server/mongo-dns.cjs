'use strict';

if (process.platform === 'win32') {
  const dns = require('node:dns');
  const dnsPromises = require('node:dns/promises');

  dns.setServers(['8.8.8.8', '1.1.1.1']);
  dnsPromises.setServers(['8.8.8.8', '1.1.1.1']);

  console.log('MongoDB DNS:', dnsPromises.getServers().join(', '));
}
