#!/bin/bash

echo "cd /vagrant" >> /home/vagrant/.bashrc

cd /vagrant
npm install

cp server/config/auth.sample.js server/config/auth.js
cp server/config/sample.config.js server/config/config.js

scripts/ES/createESIndexes.sh

curl -H "Content-Type: application/json" -X POST -d '{"password":"changeinthefuture"}' -u neo4j:neo4j http://localhost:7474/user/neo4j/password
