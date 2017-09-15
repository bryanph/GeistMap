#!/bin/bash

LAST_BACKUP=$(date --date="7 day ago" +%m_%d_%Y).db.tar.gz
NEW_BACKUP=$(date +"%m_%d_%Y").db.tar.gz

if [ -f $NEW_BACKUP ]; then
    echo "The backup $NEW_BACKUP already exists"
    exit 1
fi

if [ -f $LAST_BACKUP ]; then
    rm $LAST_BACKUP
fi

./backup.sh
