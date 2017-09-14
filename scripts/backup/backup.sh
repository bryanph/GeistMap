#!/bin/bash

sudo systemctl stop neo4j &&
now=$(date +"%m_%d_%Y") && 
tar -C /var/lib/neo4j/data/databases -cvzf $now.db.tar.gz graph.db &&
sudo systemctl start neo4j 
