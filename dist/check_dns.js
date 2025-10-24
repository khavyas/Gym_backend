const dns = require('dns');
dns.lookup('cluster0-shard-00-00.frqnmin.mongodb.net', (err, address) => {
    if (err) {
        console.error('DNS lookup failed:', err);
    }
    else {
        console.log('Resolved IP:', address);
    }
});
