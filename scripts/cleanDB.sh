#!/bin/bash

neo4j-shell -c "MATCH (n) DETACH DELETE n;";
curl -XDELETE localhost:9200/nodes;
curl -XDELETE localhost:9200/collections;

# recreate ES indexes
curl -XPUT '127.0.0.1:9200/nodes?pretty'
curl -XPUT '127.0.0.1:9200/collections?pretty'
