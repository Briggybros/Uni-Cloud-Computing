#!/bin/node

const path = require('path');
const fs = require('fs');
const zip = require('node-zip');

const LIB = path.join(__dirname, 'lib');
const DIST = path.join(__dirname, 'dist');

if (!fs.existsSync(DIST)) {
  fs.mkdirSync(DIST);
}

if (fs.existsSync(LIB)) {
  fs.readdir(LIB, (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
      const func = path.join(LIB, file);
      fs.stat(func, (err, stats) => {
        if (err) return console.error(err);
        if (stats.isDirectory()) {
          const zippper = zip();
          fs.readdir(func, (err, files) => {
            if (err) return console.error(err);
            const zipped = files.map(
              file =>
                new Promise((resolve, reject) => {
                  fs.readFile(path.join(func, file), (err, data) => {
                    if (err) return reject(err);
                    return resolve(zippper.file(file, data));
                  });
                })
            );
            Promise.all(zipped).then(() => {
              const data = zippper.generate({
                base64: false,
                compression: 'DEFLATE',
              });

              fs.writeFile(
                `${path.join(DIST, file)}.zip`,
                data,
                'binary',
                err => {
                  if (err) return console.error(err);
                }
              );
            });
          });
        }
      });
    });
  });
}
