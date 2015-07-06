# couchdb-jit-replication
CouchDB _db_updates follower that fires off one-shot replications to a database in response to changes

### Credentials

Credentials can be supplied in the URL in the `http://user:pass@host.com`-format. However if couchdb-jit-replication finds the variables `COUCH_USERNAME` and `COUCH_PASSWORD` defined in the environment they will be used.
