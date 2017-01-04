var citation = {};


citation.extractGithubRepos = function(citation) {
  var githubUrl = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/archive.*\.zip/g;
  var urls = citation.match(githubUrl);
  if (urls === null) {
    urls = [];
  }
  return urls.map(function(url) { return { name: url.replace(githubUrl, '$1/$2') }; });
};

citation.extractZenodoDOI = function(citation) {
  var zenodoUrl = /https:\/\/zenodo\.org\/record\/([^\/]+)\/files\/([^\/]+)\/([^\/]+)-/g;
  var urls = citation.match(zenodoUrl);
  if (urls === null) {
    urls = [];
  }
  return urls.map(function(url) { return { doi: url.replace(zenodoUrl, '10.5281/zenodo.$1'), name: url.replace(zenodoUrl, '$2/$3') }; });
};

citation.extractCitations = function(sources) {
  var citationIndex = sources.columns.indexOf('study_source_citation');
  var sourceCitations = [];
  if (citationIndex !== -1) {
    sourceCitations = sources.data.reduce(function(agg, row) { return agg.concat(row[citationIndex]); }, []);
  }
  return sourceCitations;
};

citation.parseSourceCitations = function(sourceCitations) {
  var repos = sourceCitations.map(citation.extractZenodoDOI).concat(sourceCitations.map(citation.extractGithubRepos)).reduce(function(agg, repo) { return agg.concat(repo); }, []);

  var repoHash = repos.reduce(function(agg, repo) { 
    if (repo.name !== undefined) {
      var repoValue = agg[repo.name];
      if (repoValue === undefined) {
        agg[repo.name] = repo;
      }
    }
    return agg;
  }, {}); 
  return Object.keys(repoHash).map(function(key) { return repoHash[key]; });
};

module.exports = citation;
