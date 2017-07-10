var GitHub = require('github-api');

module.exports = function(context, config) {

  config = config || {};
  var username = config.username || 'moravianlibrary';
  var reponame = config.reponame || 'mapseries-data';
  var workBranch = config.workBranch || 'work';

  var github = null;
  var upstream = null;
  var origin = null;

  function getGitHub() {
    if (github) {
      return github;
    }
    github = new GitHub({
      token: context.storage.get('github_token'),
      auth: 'oauth'
    });

    return github;
  }

  function getUpstream() {
    if (upstream) {
      return upstream;
    }
    var github = getGitHub();
    upstream = github.getRepo(username, reponame);
    return upstream;
  }

  function getOrigin() {
    if (origin) {
      return origin;
    }
    var github = getGitHub();
    origin = github.getRepo(context.storage.get('github_username'), reponame);
    return origin;
  }

  function hasFork(callback) {
    var repo = getOrigin();
    repo.contents('master', null, function(err) {
      callback.call(this, err ? false : true);
    });
  }

  function doFork(callback) {
    var timer = null;
    timer = window.setInterval(function() {
      hasFork(function(result) {
        if (result) {
          window.clearInterval(timer);
          callback.call(this);
        }
      });
    }, 1000);

    var repo = getUpstream();
    repo.fork(function(err) {
      if (err) {
        console.error(err);
        window.clearInterval(timer);
        callback.call(this, err);
      }
    });
  }

  function fork(callback) {
    doFork(function() {
      initWork(callback);
    });
  }

  function hasWork(callback) {
    var repo = getOrigin();

    repo.getRef('heads/' + workBranch, function(err) {
      callback.call(this, !err);
    });
  }

  function initWork(callback) {

    hasWork(function(hasWork) {
      if (!hasWork) {
        var repo = getOrigin();
        repo.branch('master', workBranch, function(err) {
          if (err) {
            console.error(err);
            callback.call(this, err);
            return;
          }
          callback.call(this);
        });
      } else {
        callback.call(this);
      }
    });
  }

  function isDirty(callback) {
    var origin = getOrigin();

    origin.getRef('heads/master', function(err, masterSha) {
      if (err) {
        console.error(err);
        callback.call(this, err);
        return;
      }
      origin.getRef('heads/' + workBranch, function(err, workSha) {
        if (err) {
          console.error(err);
          callback.call(this, err);
          return;
        }
        callback.call(this, null, masterSha != workSha);
      });
    });
  }

  function isSynced(callback) {
    var origin = getOrigin();
    var upstream = getUpstream();

    origin.getRef('heads/master', function(err, originSha) {
      if (err) {
        console.error(err);
        callback.call(this, err);
        return;
      }
      upstream.getRef('heads/master', function(err, upstreamSha) {
        if (err) {
          console.error(err);
          callback.call(this, err);
          return;
        }
        callback.call(this, null, originSha == upstreamSha);
      });
    });
  }

  function createPullBranch(callback) {
    var repo = getOrigin();
    repo.listBranches(function(err, branches) {
      if (err) {
        console.error(err);
        callback.call(err);
        return;
      }
      var maxNum = 0;
      var regex = /^pull(\d+)$/;
      branches.forEach(function(branch) {
        var match = regex.exec(branch);
        if (match) {
          maxNum = Math.max(maxNum, parseInt(match[1]));
        }
      });
      var branchName = 'pull' + (maxNum + 1);
      repo.branch(workBranch, branchName, function(err) {
        if (err) {
          console.error(err);
          callback.call(err);
          return;
        }
        callback.call(this, null, branchName);
      });
    });
  }

  function init(callback) {
    hasFork(function(forked) {
      if (forked) {
        initWork(function () {
          isDirty(function(err, dirty) {
            if (err) {
              callback.call(err);
              return;
            }
            if (dirty) {
              context.dispatch.init_dirty();
              callback.call(this);
            } else {
              isSynced(function(err, synced) {
                if (err) {
                  callback.call(err);
                  return;
                }
                if (synced) {
                  callback.call(this);
                } else {
                  var repo = getOrigin();
                  repo.deleteRepo(function(err) {
                    if (err) {
                      console.error(err);
                      callback.call(err);
                      return;
                    }
                    fork(callback);
                  });
                }
              });
            }
          });
        });
      } else {
        fork(callback);
      }
    });
  }

  function lsPath(path, callback) {
    var repo = getOrigin();
    repo.contents(workBranch, path, function(err, contents) {
      if (err) {
        callback.call(this, err);
      }
      callback.call(this, null, contents);
    });
  }

  function readFile(path, callback) {
    var repo = getOrigin();
    repo.getRef('heads/' + workBranch, function(err, sha) {
      if (err) {
        callback.call(this, err);
        return;
      }
      repo.getTree(sha, function(err, tree) {
        if (err) {
          callback.call(this, err);
          return;
        }
        tree.forEach(function(t) {
          if (t.path == path) {
            repo.getBlob(t.sha, function(err, blob) {
              if (err) {
                callback.call(this, err);
                return;
              }
              callback.call(this, null, blob);
            });
          }
        });
      }, 1);
    });
  }

  function writeFiles(files, message, callback, blobs) {
    var repo = getOrigin();
    var workRef = 'heads/' + workBranch;

    if (files.length) {
      var file = files.pop();
      repo.postBlob(file.content, function(err, sha) {
        if (err) {
          callback.call(this, err);
          return;
        }
        blobs = blobs || [];
        blobs.push({path: file.path, sha: sha});
        writeFiles(files, message, callback, blobs);
      });
    } else {
      repo.getRef(workRef, function(err, commitSha) {
        if (err) {
          callback.call(this, err);
          return;
        }
        repo.getCommit(commitSha, function(err, commit) {
          if (err) {
            callback.call(this, err);
            return;
          }
          var treeRequest = {
            base_tree: commit.tree.sha,
            tree: []
          };
          blobs.forEach(function(blob) {
            treeRequest.tree.push({
              path: blob.path,
              mode: '100644',
              type: 'blob',
              sha: blob.sha
            });
          });
          repo.postTree(treeRequest, function(err, treeSha) {
            if (err) {
              callback.call(this, err);
              return;
            }
            repo.commit(commitSha, treeSha, message, function(err, commit) {
              if (err) {
                callback.call(this, err);
                return;
              }
              repo.updateRef(workRef, commit, function(err) {
                if (err) {
                  callback.call(this, err);
                  return;
                }
                callback.call(this, null);
              });
            });
          });
        });
      });
    }
  }

  function pullRequest(title, callback) {
    createPullBranch(function(err, branch) {
      if (err) {
        callback.call(this, err);
        return;
      }
      var pull = {
        body: 'Generated by geojson.io',
        base: 'master',
        head: context.storage.get('github_username') + ':' + branch,
        title: title
      };
      var repo = getUpstream();
      repo.createPullRequest(pull, function(err, pullRequest) {
        if (err) {
          console.error(err);
          callback.call(this, err);
          return;
        }
        // Recreate work branch
        discardWork(function(err) {
          if (err) {
            console.error(err);
            callback.call(this, err);
            return;
          }
          callback.call(this);
        });
      });
    });
  }

  function discardWork(callback) {
    var origin = getOrigin();
    origin.deleteRef('heads/' + workBranch, function(err) {
      if (err) {
        console.error(err);
        callback.call(this, err);
        return;
      }
      origin.branch(workBranch, function(err) {
        if (err) {
          console.error(err);
          callback.call(this, err);
          return;
        }
        context.dispatch.discardWork();
        callback.call(this);
      });
    });
  }

  return {
    init: init,
    lsPath: lsPath,
    readFile: readFile,
    writeFiles: writeFiles,
    pullRequest: pullRequest,
    discardWork: discardWork
  };
};
