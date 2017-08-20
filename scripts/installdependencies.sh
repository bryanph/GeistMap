#!/bin/bash

# Get sources

wget -O - https://debian.neo4j.org/neotechnology.gpg.key | sudo apt-key add -
echo 'deb https://debian.neo4j.org/repo stable/' | sudo tee /etc/apt/sources.list.d/neo4j.list

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6
echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.4.list

wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb http://packages.elastic.co/elasticsearch/2.x/debian stable main" | sudo tee -a /etc/apt/sources.list.d/elasticsearch-2.x.list
echo "deb https://artifacts.elastic.co/packages/5.x/apt stable main" | sudo tee -a /etc/apt/sources.list.d/elastic-5.x.list

curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -


# update

sudo apt-get update

# install

sudo apt-get install -y git htop

sudo apt-get install -y neo4j=3.2.2
sudo apt-get install -y mongodb-org=3.4.7
sudo apt-get install -y elasticsearch=5.5.2
sudo apt-get install -y redis-server
sudo apt-get install -y nodejs

# start services
sudo systemctl start mongod
sudo systemctl enable mongod
sudo systemctl start elasticsearch
sudo systemctl enable elasticsearch
