#!/bin/bash

if [ -z "$1" ]
  then
    echo "First argument must be the backup file"
    exit 1
fi

if [ ! -f $1 ]; then
    echo "Backup file $1 not found"
    exit 1
fi

read -p "Are you sure? This will remove the current database [y/n]" -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
    # do dangerous stuff
    sudo systemctl stop neo4j &&
    rm -rf /var/lib/neo4j/data/databases/graph.db &&
    tar -C /var/lib/neo4j/data/databases -zxf $1 graph.db &&
    sudo systemctl start neo4j 
fi

