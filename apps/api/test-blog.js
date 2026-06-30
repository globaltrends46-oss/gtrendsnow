import fetch from 'node-fetch';

const url = 'http://localhost:3001/hcgi/api/generate-blog';

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({})
})
.then(r => r.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(e => console.error(e.message));