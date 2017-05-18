const path = require("path")

const env = process.env.NODE_ENV;

const config = {
    'port': 3001,
    "env": env,
    "static_root": path.join(process.cwd(), "public"),
    "media_root": path.join(process.cwd(), "assets"),

    "sessionStore": { // TODO: use redis for sessions - 2016-01-25
        "url": "mongodb://localhost:27017/graphtodo-sessions"
    },

    "neo4j": {
        "user": "neo4j",
        "password": "test",
    },
    "database": {
        "url": "mongodb://localhost:27017/graphtodo"
    },

    "test_database": {
        "url": "mongodb://localhost:27017/graphtodo-test"
    },

    "redis": {
        "db": 0
    },

    "uploadDir": path.join(process.cwd(), 'assets/uploads'),
    "uploadLimit": 2 * Math.pow(2,30), // 2Gb, for now for free users?

    "es": {
        // TODO: instead use aliases in ES? - 2017-05-10
        // so make 'nodes' map to whatever index
        nodeIndex: 'nodes2',
        nodeMappingType: 'node_type',

        collectionIndex: 'collections2',
        collectionMappingType: 'collection_type',
    },
    "ga": "UA-XXXXX-Y",
}

module.exports = config
