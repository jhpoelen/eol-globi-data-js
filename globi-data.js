var nodeXHR = require('xmlhttprequest');
var extend = require('extend');
var hash = require('object-hash');
var querystring = require('querystring');
var globiData = {};

var urlPrefix = 'http://api.globalbioticinteractions.org';

globiData.addQueryParams = function (uri, search) {
    function initParams(search) {
        var alt = extend({}, search);
        if (search.location) {
            alt = extend(alt, search.location);
            delete alt.location;
        }

        function replaceAndDelete(match, replace) {
            if (search[match]) {
                if (!alt[replace]) {
                    alt[replace] = search[match];
                }
                delete alt[match];
            }
        }

        replaceAndDelete('sourceTaxa', 'sourceTaxon');
        replaceAndDelete('targetTaxa', 'targetTaxon');
        replaceAndDelete('fields', 'field');

        if (search.includeObservations) {
            alt.includeObservations = true;
        }
        if (search.exactNameMatchOnly) {
            alt.exactNameMatchOnly = true;
        }
        if (search.excludeChildTaxa) {
            alt.excludeChildTaxa = true;
        }
        return alt;
    }

    var qs = querystring.encode(initParams(search));
    var altUri = uri;
    if (qs.length > 0) {
        altUri = uri + '&' + qs;
    }
    return altUri;
}
;

globiData.urlForFindCloseTaxonMatches = function (name) {
    return urlPrefix + '/findCloseMatchesForTaxon/' + encodeURIComponent(name);
};

globiData.urlForTaxonInteractionQuery = function (search) {
    var uri = urlPrefix;
    var searchAlt = extend({}, search);

    if (searchAlt.sourceTaxonScientificName) {
        uri = uri + '/taxon/' + encodeURIComponent(searchAlt.sourceTaxonScientificName);
        delete searchAlt.sourceTaxonScientificName;
        if (searchAlt.interactionType) {
            uri = uri + '/' + encodeURIComponent(searchAlt.interactionType);
            delete searchAlt.interactionType;
        }
        if (searchAlt.targetTaxonScientificName) {
            uri = uri + '/' + encodeURIComponent(searchAlt.targetTaxonScientificName);
            delete searchAlt.targetTaxonScientificName;
        }
    } else {
        uri = uri + '/interaction';
    }
    var ext = {'csv': '.csv', 'dot': '.dot'}
    uri = uri + (ext[searchAlt.resultType] === undefined ? '' : ext[searchAlt.resultType]);
    uri = uri + '?type=' + (searchAlt.resultType ? searchAlt.resultType : 'json.v2');
    delete searchAlt.resultType;

    return this.addQueryParams(uri, searchAlt);
};

globiData.urlForTaxonImageQuery = function (scientificName) {
    return urlPrefix + '/imagesForName?name=' + encodeURIComponent(scientificName);
};

globiData.urlForTaxonImageByIdQuery = function (id) {
    return urlPrefix + '/images/' + encodeURIComponent(id);
};

globiData.urlForTaxonImagesQuery = function (scientificNames) {
    var nameQuery = '?';
    if (scientificNames) {
        for (var index in scientificNames) {
            if (scientificNames.hasOwnProperty(index)) {
                nameQuery += 'name=' + encodeURIComponent(scientificNames[index]) + '&';
            }
        }
    }
    return urlPrefix + '/imagesForNames' + nameQuery;
};

globiData.urlForStudyStats = function (search) {
    var url = urlPrefix + '/reports/studies';
    if (search.source) {
        url = url + '?source=' + encodeURIComponent(search.source);
    }
    return url;
};

var createReq = function () {
    var req;
    if (typeof window === 'undefined') {
        // perhaps running in node.js?
        req = new nodeXHR.XMLHttpRequest();
    } else if (window.XMLHttpRequest) { // Mozilla, Safari, ...
        req = new XMLHttpRequest();
    } else if ((typeof window !== 'undefined') && window.ActiveXObject) { // IE
        try {
            req = new ActiveXObject('Msxml2.XMLHTTP');
        } catch (e) {
            try {
                req = new ActiveXObject('Microsoft.XMLHTTP');
            } catch (e) {
            }
        }
    }
    return req;
};

globiData.findSources = function (callback) {
    var req = createReq();
    req.open('GET', urlPrefix + '/reports/sources', true);
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200) {
            var result = JSON.parse(req.responseText);
            var sources = [];
            var data = result.data;
            data.forEach(function (element, index) {
                sources[index] = element[4];
            });
            callback(sources);
        }
    };
    req.send(null);
};

globiData.extractGithubRepos = function(citation) {
  var githubUrl = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)\/archive.*\.zip/g;
  var urls = citation.match(githubUrl);
  if (urls === null) {
    urls = [];
  }
  return urls.map(function(url) { return { name: url.replace(githubUrl, '$1/$2') }; });
};

globiData.extractZenodoDOI = function(citation) {
  var zenodoUrl = /https:\/\/zenodo\.org\/record\/([^\/]+)\/files\/([^\/]+)\/([^\/]+)-/g;
  var urls = citation.match(zenodoUrl);
  if (urls === null) {
    urls = [];
  }
  return urls.map(function(url) { return { doi: url.replace(zenodoUrl, '10.5281/zenodo.$1'), name: url.replace(zenodoUrl, '$2/$3') }; });
};

globiData.parseSourceCitations = function(sources, sourceCitationIndex) {
  var sourceCitations = sources.data.reduce(function(agg, row) { return agg.concat(row[sourceCitationIndex]); }, []);
  var repos = sourceCitations.map(globiData.extractZenodoDOI).concat(sourceCitations.map(globiData.extractGithubRepos)).reduce(function(agg, repo) { return agg.concat(repo); }, []);

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

globiData.parseSourceNames = function(citationData) {
  var citationIndex = citationData.columns.indexOf('study_source_citation');
  var sourceNames = [];
  if (citationIndex !== -1) {
    sourceNames = globiData.parseSourceCitations(citationData, citationIndex);
  }
  return sourceNames;
};

globiData.findSourceNames = function (callback) {
   globiData.findSources(new function(sources) {
     callback(globiData.parseSourceNames(sources));    
  });
}

globiData.findStudyStats = function (search, callback) {
    var req = createReq();
    var uri = globiData.urlForStudyStats(search);
    req.open('GET', uri, true);

    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200) {
            var resp = JSON.parse(req.responseText);
            var studyStats = [];
            for (var i = 0; i < resp.data.length; i++) {
                var row = resp.data[i];
                var stats = { citation: row[0], source: row[3], totalInteractions: row[4], totalTaxa: row[5]};
                var doi = row[2];
                if (doi && doi.length > 0) {
                    stats.doi = doi;
                }

                var externalId = row[1];
                if (externalId && externalId.length > 0 && externalId.match('^((http)|(https))://') !== null) {
                    stats.url = externalId;
                }

                studyStats[i] = stats;
            }
            callback(studyStats);
        }
    };
    req.send(null);
};

globiData.findStats = function (search, callback) {
    var req = createReq();
    var uri = urlPrefix + '/reports/collections';
    if (search.source) {
        uri = uri + '?source=' + encodeURIComponent(search.source);
    }
    req.open('GET', uri, true);
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200) {
            var resp = JSON.parse(req.responseText);
            var stats = {numberOfStudies: resp.data[0][6],
                totalInteractions: resp.data[0][4],
                totalTaxa: resp.data[0][5],
                numberOfDistinctSources: resp.data[0][7]};
            callback(stats);
        }
    };
    req.send(null);
};

globiData.sendRequest = function (req, callback) {
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200) {
            if (callback.callback && callback.context) {
                callback.callback.call(callback.context, JSON.parse(req.responseText));
            } else {
                callback(JSON.parse(req.responseText));
            }
        }
    };
    req.send(null);
};

globiData.findInteractionTypes = function (search, callback) {
    if (arguments.length === 1) {
        callback = search;
        search = [];
    }

    search = search.map(function (item) {
        return 'taxon=' + encodeURIComponent(item);
    });
    var urlQuery = search.length > 0 ? '?' + search.join('&') + '&type=json' : '';

    var req = createReq();
    req.open('GET', urlPrefix + '/interactionTypes' + urlQuery, true);
    globiData.sendRequest(req, callback);
};


globiData.findSpeciesInteractions = function (search, callback) {
    var searchAlt = extend({}, search);
    var callbackAlt = callback;
    if ('d3' === searchAlt.resultType) {
        searchAlt.resultType = 'json';
        callbackAlt = function(interactions) {
            callback(callbackProxyForD3(interactions));
        }
    }
    var uri = globiData.urlForTaxonInteractionQuery(searchAlt);
    var req = createReq();
    req.open('GET', uri, true);
    globiData.sendRequest(req, callbackAlt);
};


globiData.findTaxonInfo = function (scientificName, callback) {
    var uri = globiData.urlForTaxonImageQuery(scientificName);
    globiData.get(uri, callback);
};

globiData.findTaxonLinks = function (scientificName, callback) {
    var uri = urlPrefix + '/taxonLinks/' + encodeURIComponent(scientificName);
    globiData.get(uri, callback);
}

globiData.findTaxaInfo = function (scientificNames, callback) {
    var uri = globiData.urlForTaxonImagesQuery(scientificNames);
    globiData.get(uri, callback);
};

globiData.get = function (uri, callback) {
    var req = createReq();
    req.open('GET', uri, true);
    globiData.sendRequest(req, callback);
};

globiData.findCloseTaxonMatches = function (name, callback) {
    var uri = globiData.urlForFindCloseTaxonMatches(name);
    var req = createReq();
    req.open('GET', uri, true);
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200) {
            var response = JSON.parse(req.responseText);
            var data = response.data;
            var closeMatches = [];
            data.forEach(function (element, index) {
                var taxonHierarchy = [];
                var commonNames = globiData.mapCommonNameList(element[1]);
                var pathString = element[2];
                pathString = pathString === null ? "" : pathString;
                var path = pathString.split('|');
                path.forEach(function (taxon, index) {
                    taxonHierarchy[index] = taxon.trim();
                });
                var scientificName = element[0].trim();
                closeMatches[index] = { scientificName: scientificName, commonNames: commonNames, path: taxonHierarchy};
            });
            callback(closeMatches);
        }
    };
    req.send(null);
};

/**
 * Transforms a common name list string into a map
 * f.x.:
 *  "foo @en | bar @de" => {en: "foo", de: "bar"}
 *
 * @param {string} pipedCommonNameList
 * @param {boolean} [override]
 * @returns {Object.<string, string>}
 */
globiData.mapCommonNameList = function (pipedCommonNameList, override) {
    override = typeof override !== 'undefined' ? !!override : true;
    pipedCommonNameList = typeof pipedCommonNameList !== 'string' ? '' : pipedCommonNameList;
    var commonNameMap = { count: 0 };
    var splittedByPipeList = pipedCommonNameList.split('|').map(function (item) {
        return item.trim();
    });
    splittedByPipeList.forEach(function (item) {
        if (typeof item !== 'undefined') {
            var splittedByAtItemParts = item.split('@').map(function (item) {
                return item.trim();
            });
            if (typeof splittedByAtItemParts[1] !== 'undefined') {
                if (override || typeof commonNameMap[splittedByAtItemParts[1]] === 'undefined') {
                    if (typeof commonNameMap[splittedByAtItemParts[1]] === 'undefined') commonNameMap.count++;
                    commonNameMap[splittedByAtItemParts[1]] = splittedByAtItemParts[0];
                }
            }
        }
    });

    return commonNameMap;
};

globiData.findThumbnailById = function (search, callback) {
    search = search || {};
    var uri = globiData.urlForTaxonImageByIdQuery(search);
    var req = createReq();
    req.open('GET', uri, true);
    globiData.sendRequest(req, function (reponseData) {
        var tumbnailUrl = reponseData.thumbnailURL;
        callback(tumbnailUrl);
    });
};

var callbackProxyForD3 = function (interactions) {
    var columnNames = interactions.columns || [];
    var sourceTaxonIds = columnNames.map(function (elem, i) {
        if (elem.indexOf('source_') === -1) {
            return -1;
        } else {
            return i;
        }
    }).filter(function (i) {
        return i !== -1;
    });

    var targetTaxonIds = columnNames.map(function (elem, i) {
        if (elem.indexOf('target_') === -1) {
            return -1;
        } else {
            return i;
        }
    }).filter(function (i) {
        return i !== -1;
    });

    var linkIds = columnNames.map(function (elem, i) {
        if ((elem.indexOf('target_') === -1) && (elem.indexOf('source_') === -1)) {
            return i;
        } else {
            return -1;
        }
    }).filter(function (i) {
        return i !== -1;
    });

    var data = interactions.data || [];
    var linksAndNodes = data.reduce(function (agg, row) {
        var sourceTaxon = sourceTaxonIds.reduce(function (sourceObj, i) {
            if (row[i] !== null) {
                sourceObj[columnNames[i].substring('source_'.length)] = row[i];
            }
            return sourceObj;
        }, {});
        var targetTaxon = targetTaxonIds.reduce(function (targetObj, i) {
            if (row[i] !== null) {
                targetObj[columnNames[i].substring('target_'.length)] = row[i];
            }
            return targetObj;
        }, {});
        var link = linkIds.reduce(function (linkObj, i) {
            linkObj[columnNames[i]] = row[i];
            return linkObj;
        }, { source: hash(sourceTaxon), target: hash(targetTaxon) });
        agg.linksHash[hash(link)] = link;
        agg.nodeHash[hash(sourceTaxon)] = sourceTaxon;
        agg.nodeHash[hash(targetTaxon)] = targetTaxon;
        return agg;
    }, { linksHash: {}, nodeHash: {}});


    var links = Object.keys(linksAndNodes.linksHash).map(function (i) {
        return linksAndNodes.linksHash[i];
    });
    var nodes = Object.keys(linksAndNodes.nodeHash).map(function (i) {
        return linksAndNodes.nodeHash[i];
    });
    return { links: links, nodes: nodes};
}

module.exports = globiData;

