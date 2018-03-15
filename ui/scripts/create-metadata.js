const readJson = require('read-package-json');
const fs = require('fs');

readJson('package.json', (err, data) => {
  if (err) {
    console.log('Could not read package.json', err);
    return;
  }

  const metadata = {
    name: data.name,
    description: data.description,
    maintainer: data.author.name,
    version: data.version,
  };

  fs.writeFile('build/metadata.json',JSON.stringify(metadata,null,2), 'utf8', (err) => {
    if(err) {
      console.log('Failed to write metadata.json', err);
    }
  });
});
