#!/bin/bash

neo4j-shell -c "CREATE INDEX ON :User(id)";
