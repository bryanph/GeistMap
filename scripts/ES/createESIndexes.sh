# Node indexes
curl -XPUT '127.0.0.1:9200/nodes2?pretty' -H 'Content-Type: application/json' -d'
{
    "settings": {
        "number_of_shards": 1, 
        "analysis": {
            "filter": {
                "autocomplete_filter": { 
                    "type":     "edge_ngram",
                    "min_gram": 2,
                    "max_gram": 20
                }
            },
            "analyzer": {
                "autocomplete": {
                    "type":      "custom",
                    "tokenizer": "standard",
                    "filter": [
                        "lowercase",
                        "autocomplete_filter" 
                    ]
                }
            }
        }
    }
}
'

curl -XPUT '127.0.0.1:9200/nodes2/_mapping/node_type?pretty' -H 'Content-Type: application/json' -d'
{
    "node_type": {
        "properties": {
            "user": {
                "type":     "string"
            },
            "title": {
                "type":     "string",
                "analyzer": "autocomplete"
            },
            "content": {
                "type":     "string",
                "analyzer": "autocomplete"
            }
        }
    }
}
'

# Collection index
curl -XPUT '127.0.0.1:9200/collections2?pretty' -H 'Content-Type: application/json' -d'
{
    "settings": {
        "number_of_shards": 1, 
        "analysis": {
            "filter": {
                "autocomplete_filter": { 
                    "type":     "edge_ngram",
                    "min_gram": 2,
                    "max_gram": 20
                }
            },
            "analyzer": {
                "autocomplete": {
                    "type":      "custom",
                    "tokenizer": "standard",
                    "filter": [
                        "lowercase",
                        "autocomplete_filter" 
                    ]
                }
            }
        }
    }
}
'
curl -XPUT '127.0.0.1:9200/collections2/_mapping/collection_type?pretty' -H 'Content-Type: application/json' -d'
{
    "collection_type": {
        "properties": {
            "user": {
                "type":     "string"
            },
            "title": {
                "type":     "string",
                "analyzer": "autocomplete"
            },
            "description": {
                "type":     "string",
                "analyzer": "autocomplete"
            }
        }
    }
}
'

