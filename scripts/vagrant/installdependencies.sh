#!/bin/bash

# Get sources

wget -O - https://debian.neo4j.org/neotechnology.gpg.key | sudo apt-key add -
echo 'deb https://debian.neo4j.org/repo stable/' | sudo tee /etc/apt/sources.list.d/neo4j.list

wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb http://packages.elastic.co/elasticsearch/2.x/debian stable main" | sudo tee -a /etc/apt/sources.list.d/elasticsearch-2.x.list
echo "deb https://artifacts.elastic.co/packages/5.x/apt stable main" | sudo tee -a /etc/apt/sources.list.d/elastic-5.x.list

curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -


# update

sudo apt-get update

# install

sudo apt-get install -y git htop

sudo apt-get install -y neo4j=3.2.2
sudo apt-get install -y mongodb
sudo apt-get install -y elasticsearch=5.5.2
sudo apt-get install -y redis-server
sudo apt-get install -y nodejs

# neo4j APOC extension (for uuids)
wget https://github.com/neo4j-contrib/neo4j-apoc-procedures/releases/download/3.2.0.4/apoc-3.2.0.4-all.jar -O /var/lib/neo4j/plugins/apoc-3.2.0.4-all.jar

sudo mkdir -p /data/db
sudo chown -R vagrant:vagrant /data/db

# start services
sudo systemctl start mongodb
sudo systemctl enable mongodb
sudo systemctl start elasticsearch
sudo systemctl enable elasticsearch
sudo systemctl start neo4j
sudo systemctl enable neo4j
sudo systemctl start redis-server
sudo systemctl enable redis-server
