/* jshint esnext: true */

var argv = require('minimist')(process.argv.slice(2));

var targetDB = argv.db || docs();
var hostURL = argv._[0] || docs();
var prefixes = argv.prefix;

if (prefixes) {
  prefixes = prefixes.split(',');
}

var setHostURLCredentialsFromEnvironment = function(hostURL, env) {
  var url = require('url');

  var username = env.COUCH_USERNAME;
  var password = env.COUCH_PASSWORD;

  if (!username || !password) {
    return hostURL;
  }

  var URL = url.parse(hostURL);

  URL.auth = username + ':' + password;

  return url.format(URL);
};

var nano = require('nano')(setHostURLCredentialsFromEnvironment(hostURL, process.env));
var feed = nano.followUpdates({});

var replicate = function(source, target) {
  nano.db.replicate(source, target, { create_target:true }, function(error, body) {
    if (error) {
      return console.log(error);
    }
  });
};

feed.on('change', function(change) {
  if (change.type === 'updated') {
    var dbName = change.db_name;

    if (dbName === targetDB) {
      return;
    }

    var callback = function(error, body) {
      if (error) {
        return console.log(error, body);
      }
    };

    if (prefixes) {
      for (var prefix of prefixes) {
        if (dbName.indexOf(prefix) === 0) {
          return replicate(dbName, targetDB, {create_target: true}, callback);
        }
      }
    }
  }
});

feed.follow();

function docs() {
  usage();
  options();

  process.exit(1);
}

function usage() {
  console.log("Usage: node index.js --db=mainDB [--prefix=m/,c/] http://user:pass@host.com\n");
}

function options() {
  console.log('Options:');
  console.log('  --db      The target database to replicate to.');
  console.log('  --prefix  Only replicate databases with these comma-separated prefixes.');
}
