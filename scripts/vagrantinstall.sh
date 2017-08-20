#!/bin/bash

echo "cd /vagrant" >> /home/vagrant/.bashrc

cd /vagrant
npm install

# cp server/config/auth.sample.js auth.js
# cp server/config/config.sample.js server/config/config.js

scripts/ES/createESIndexes.sh

