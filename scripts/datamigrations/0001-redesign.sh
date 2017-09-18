#!/bin/bash

# For every user create a root collection
neo4j-shell -c "
MATCH (u:User) \n
CREATE (r:RootCollection { \n
    id: apoc.create.uuid(), \n
    name: \"My Knowledge Base\", \n
    isRootCollection: true, \n
    type: \"root\", \n
    created: timestamp(), \n
    modified: timestamp() \n
})<-[:AUTHOR]-(u) \n
RETURN properties(c) as collection \n
";

neo4j-shell -c "
MATCH (n) \n
WHERE n:Node OR n:Collection \n
SET n.id = apoc.create.uuid() \n
"

neo4j-shell -c "
MATCH (n) \n
WHERE n:Node \n
SET n.type = \"node\" \n
"

neo4j-shell -c "
MATCH (n) \n
WHERE n:Collection \n
SET n.type = \"collection\" \n
"

neo4j-shell -c "
MATCH (n1)-[e]->(n2) \n
SET e.id = apoc.create.uuid() \n
SET e.start = n1.id \n
SET e.end = n2.id \n
"

neo4j-shell -c "
MATCH (n1)-[e:PARENT]->(n2) \n
CREATE (n1)-[e2:AbstractEdge]->(n2) \n
SET e2 = e \n
WITH e \n
DELETE e \n
"

neo4j-shell -c "
MATCH (n1)-[e:IN]->(n2) \n
CREATE (n1)-[e2:AbstractEdge]->(n2) \n
SET e2 = e \n
WITH e \n
DELETE e \n
"

neo4j-shell -c "
MATCH (rc:RootCollection)--(u:User)--(c:Collection) \n
WHERE NOT (c)-[:AbstractEdge]->(:Collection) \n
CREATE (c)-[e:AbstractEdge { \n
    id: apoc.create.uuid(), \n
    start: c.id, \n
    end: rc.id \n
}]->(rc) \n
"

neo4j-shell -c "
MATCH (n) \n
WHERE n:RootCollection \n
SET n:Collection:RootCollection \n
"
