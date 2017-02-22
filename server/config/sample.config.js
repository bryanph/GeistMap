import path from "path"

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
}

export default config
