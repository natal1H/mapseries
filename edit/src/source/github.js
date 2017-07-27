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

  function hasFork() {
    var repo = getOrigin();

    return new Promise(function(resolve, reject) {
      repo.getContents('master', "")
      .then(() => { resolve(true) })
      .catch(() => { resolve(false) })
    });
  }

  function fork() {
    var timer = null;

    return new Promise((resolve, reject) => {
      timer = window.setInterval(() => {

        hasFork().then((result) => {
          if (result) {
            window.clearInterval(timer);
            resolve();
          }
        })
      }, 1000);

      var repo = getUpstream();
      repo.fork()
      .catch((err) => {
        window.clearInterval(timer);
        reject(err);
      });
    });
  }

  function hasWork() {
    var repo = getOrigin();

    return new Promise((resolve, reject) => {
      repo.getRef('heads/' + workBranch)
      .then(() => { resolve(true) })
      .catch(() => { resolve(false) })
    });
  }

  function initWork() {

    return hasWork()
    .then((result) => {
      if (result) {
        return new Promise((resolve, reject) => { resolve() })
      } else {
        var repo = getOrigin();
        return repo.createBranch('master', workBranch);
      }
    });

  }

  function isDirty() {
    var origin = getOrigin(),
        masterSha = null;

    return origin.getRef('heads/master')
    .then((res) => {
      masterSha = res;
      return origin.getRef('heads/' + workBranch);
    })
    .then((workSha) => {
      return new Promise((resolve, reject) => { resolve(masterSha.data.object.sha != workSha.data.object.sha) });
    });

  }

  function isSynced() {
    var origin = getOrigin(),
        upstream = getUpstream(),
        originSha = null;

    return origin.getRef('heads/master')
    .then((res) => {
      originSha = res;
      return upstream.getRef('heads/master');
    })
    .then((upstreamSha) => {
      return new Promise((resolve, reject) => { resolve(originSha.data.object.sha == upstreamSha.data.object.sha) });
    });

  }

  function createPullBranch() {
    var repo = getOrigin();
    var branchName;

    return new Promise((resolve, reject) => {

      repo.listBranches()
      .then((branches) => {
        var maxNum = 0;
        var regex = /^pull(\d+)$/;
        branches.data.forEach(function(branch) {
          var match = regex.exec(branch.name);
          if (match) {
            maxNum = Math.max(maxNum, parseInt(match[1]));
          }
        });
        branchName = 'pull' + (maxNum + 1);

        return repo.createBranch(workBranch, branchName);
      })
      .then(() => { resolve(branchName) })
      .catch((err) => { reject(err) });

    });
  }

  function init() {

    return hasFork()
    .then((forked) => {
      if (!forked) {
        return fork();
      } else {
        return new Promise((resolve, reject) => { resolve() });
      }
    })
    .then(() => {
      return hasWork();
    })
    .then((work) => {
      if (!work) {
        return initWork();
      } else {
        return new Promise((resolve, reject) => { resolve() });
      }
    })
    .then(() => {
      return isDirty();
    })
    .then((dirty) => {
      if (dirty) {
        context.dispatch.init_dirty();
        return new Promise((resolve, reject) => { resolve() });
      } else {
        return isSynced()
        .then((synced) => {
          if (synced) {
            return new Promise((resolve, reject) => { resolve() });
          } else {
            var repo = getOrigin();
            return repo.deleteRepo();
          }
        });
      }
    })
  }

  function lsPath(path, callback) {
    var repo = getOrigin();
    return repo.contents(workBranch, path);
  }

  function getTreeSha(treeSha, name) {

    var repo = getOrigin();

    return new Promise((resolve, reject) => {
      repo.getTree(treeSha)
      .then((tree) => {
        var resolved = false;
        tree.data.tree.forEach((t) => {
          if (t.path == name) {
            resolved = true;
            resolve(t.sha);
            return;
          }
        });
        if (!resolved) {
          reject(name + ' was not found in ' + tree);
        }
      })
      .catch((err) => { reject(err) });
    });
  }

  function readFile(path, treeSha) {

    var repo = getOrigin(),
        paths = null;

    if (typeof path === "string") {
      paths = path.split('/')
    } else {
      paths = path;
    }

    if (paths.length > 0) {
      let p = paths[0];

      if (!treeSha) {

        return repo.getRef('heads/' + workBranch)
        .then((sha) => {

          return getTreeSha(sha.data.object.sha, p)
          .then((sha) => { return readFile(paths.slice(1), sha) })

        });

      } else {

        return getTreeSha(treeSha, p)
        .then((sha) => { return readFile(paths.slice(1), sha) })

      }

    } else {
      return repo.getBlob(treeSha)
      .then((data) => {
        return new Promise((resolve, reject) => { resolve(data.data) })
      })
    }
  }

  function writeFiles(files, message, blobs) {
    var repo = getOrigin(),
        workRef = 'heads/' + workBranch;

    if (files.length) {
      var file = files.pop();

      return repo.createBlob({content: file.content})
      .then((sha) => {
        blobs = blobs || [];
        blobs.push({path: file.path, sha: sha.data.sha});
        return writeFiles(files, message, blobs);
      });

    } else {

      var commitSha = null,
          commit = null,
          treeSha = null;

      repo.getRef(workRef)
      .then((res) => {
        commitSha = res.data.object.sha;
        return repo.getCommit(commitSha);
      })
      .then((res) => {
        commit = res.data;
        var tree = [];
        blobs.forEach(function(blob) {
          tree.push({
            path: blob.path,
            mode: '100644',
            type: 'blob',
            sha: blob.sha
          });
        });
        return repo.createTree(tree, commit.tree.sha);
      })
      .then((res) => {
        treeSha = res.data.sha;
        return repo.commit(commitSha, treeSha, message);
      })
      .then((commit) => {
        return repo.updateHead(workRef, commit.data.sha, false);
      });
    }
  }

  function pullRequest(title) {

    return createPullBranch()
    .then((branch) => {
      var pull = {
        body: 'Generated by geojson.io',
        base: 'master',
        head: context.storage.get('github_username') + ':' + branch,
        title: title
      };
      var repo = getUpstream();
      return repo.createPullRequest(pull);
    })
    .then(() => {
      return discardWork();
    });
  }

  function discardWork() {
    var origin = getOrigin();

    return origin.deleteRef('heads/' + workBranch)
    .then(() => {
      return origin.createBranch('master', workBranch);
    })
    .then(() => {
      context.dispatch.discardWork();
      return new Promise((resolve, reject) => { resolve() });
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
