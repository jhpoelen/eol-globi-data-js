var nodeXHR = require("xmlhttprequest");
var globiData = {};

var urlPrefix = 'http://api.globalbioticinteractions.org';

globiData.urlForFindCloseTaxonMatches = function (name) {
    return urlPrefix + '/findCloseMatchesForTaxon/' + encodeURIComponent(name);
};

globiData.urlForTaxonInteractionQuery = function (search) {
    var uri = urlPrefix;

    if (search.sourceTaxonScientificName) {
        uri = uri + '/taxon/' + encodeURIComponent(search.sourceTaxonScientificName) + '/' + search.interactionType;
        if (search.targetTaxonScientificName) {
            uri = uri + '/' + encodeURIComponent(search.targetTaxonScientificName);
        }
    } else {
        uri = uri + '/interaction';
    }

    var locationQuery = function (location) {
        var locationQuery = '';
        for (var elem in location) {
            locationQuery += elem + '=' + location[elem] + '&';
        }
        return locationQuery;
    };

    uri = uri + '?type=json.v2';
    if (search.location) {
        uri = uri + '&' + locationQuery(search.location);
    }

    function addTaxonQuery(taxonNames, elemName) {
        if (taxonNames) {
            var taxonQuery = '';
            for (var name in taxonNames) {
                taxonQuery += elemName + '=' + encodeURIComponent(taxonNames[name]) + '&';
            }
            uri = uri + taxonQuery;
        }
    }

    addTaxonQuery(search.sourceTaxa, 'sourceTaxon');
    addTaxonQuery(search.targetTaxa, 'targetTaxon');

    return uri;
};

globiData.urlForTaxonImageQuery = function (scientificName) {
    return urlPrefix + '/imagesForName?name=' + encodeURIComponent(scientificName);
};

globiData.urlForTaxonImageByIdQuery = function(id) {
    return urlPrefix + '/images/' + encodeURIComponent(id);
};

globiData.urlForTaxonImagesQuery = function(scientificNames) {
	var nameQuery = '?';
	if (scientificNames) {
		for (var index in scientificNames) {
			nameQuery += 'name=' + encodeURIComponent(scientificNames[index]) + '&';
		}
	}
	return urlPrefix + '/imagesForNames' + nameQuery;
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
    req.open('GET', urlPrefix + '/sources', true);
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200) {
            var result = JSON.parse(req.responseText);
            var sources = [];
            var data = result.data;
            data.forEach(function (element, index) {
                sources[index] = element[0];
            });
            callback(sources);
        }
    };
    req.send(null);
};

globiData.findStudyStats = function (search, callback) {
    var req = createReq();
    var uri = urlPrefix + '/contributors';
    if (search.source) {
        uri = uri + '?source=' + encodeURIComponent(search.source);
    }
    req.open('GET', uri, true);
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200) {
            var resp = JSON.parse(req.responseText);
            var studyStats = [];
            for (var i = 0; i < resp.data.length; i++) {
                var row = resp.data[i];
                var reference = '';
				var citation = row[8];
				if (citation && citation.length > 0) {
					reference = row[8];
				} else {
					reference = row[2];
                	var name = row[3];
                	if (name && name.length > 0) {
                    	reference = name + ' ' + reference;
                	}
				}
        var stats = { reference: reference, totalInteractions: row[4], totalSourceTaxa: row[5], totalTargetTaxa: row[6]};
				var doi = row[9];
				if (doi && doi.length > 0) {
					stats.doi = doi;
				}

				var source = row[10];
				if (source && source.length > 0) {
					stats.source = source;
				}

        var externalId = row[11];
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
    var uri = urlPrefix + '/info';
    if (search.source) {
        uri = uri + '?source=' + encodeURIComponent(search.source);
    }
    req.open('GET', uri, true);
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200) {
            var resp = JSON.parse(req.responseText);
            var stats = {numberOfStudies: resp.data[0][0],
                totalInteractions: resp.data[0][1],
                totalSourceTaxa: resp.data[0][2],
                totalTargetTaxa: resp.data[0][3],
                numberOfDistinctSources: resp.data[0][4]};
            callback(stats);
        }
    };
    req.send(null);
};

globiData.sendRequest = function(req, callback) {
    req.onreadystatechange = function() {
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
    var urlQuery = '', alreadySet = false;
    if (arguments.length === 1) {
        callback = search;
        search = {};
    }

    ['taxonId', 'taxonName'].forEach(function(queryPart) {
        if (search[queryPart] && !alreadySet) {
            urlQuery = '?' + queryPart + encodeURIComponent(search[queryPart]);
            alreadySet = true;
        }
    });

    var req = createReq();
    req.open('GET', urlPrefix + '/interactionTypes' + urlQuery, true);
    globiData.sendRequest(req, callback);
};


globiData.findSpeciesInteractions = function (search, callback) {
    var uri = globiData.urlForTaxonInteractionQuery(search);
    var req = createReq();
    req.open('GET', uri, true);
    globiData.sendRequest(req, callback);
};


globiData.findTaxonInfo = function (scientificName, callback) {
	var uri = globiData.urlForTaxonImageQuery(scientificName);	
	globiData.get(uri, callback);
};

globiData.findTaxaInfo = function (scientificNames, callback) {
	var uri = globiData.urlForTaxonImagesQuery(scientificNames);
	console.log(uri);	
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
globiData.mapCommonNameList = function(pipedCommonNameList, override) {
    override = typeof override !== 'undefined' ? !!override : true;
    pipedCommonNameList = typeof pipedCommonNameList !== 'string' ? '' : pipedCommonNameList;
    var commonNameMap = { count: 0 };
    var splittedByPipeList = pipedCommonNameList.split('|').map(function(item) { return item.trim(); } );
    splittedByPipeList.forEach(function(item) {
        if (typeof item !== 'undefined') {
            var splittedByAtItemParts = item.split('@').map(function(item) { return item.trim(); } );
            if (typeof splittedByAtItemParts[1] !== 'undefined') {
                if( override || typeof commonNameMap[splittedByAtItemParts[1]] === 'undefined') {
                    if (typeof commonNameMap[splittedByAtItemParts[1]] === 'undefined') commonNameMap.count++;
                    commonNameMap[splittedByAtItemParts[1]] = splittedByAtItemParts[0];
                }
            }
        }
    });

    return commonNameMap;
};

globiData.findThumbnailById = function(search, callback) {
    search = search || {};
    var uri = globiData.urlForTaxonImageByIdQuery(search);
    var req = createReq();
    req.open('GET', uri, true);
    globiData.sendRequest(req, function(reponseData) {
        var tumbnailUrl = reponseData.thumbnailURL;
        callback(tumbnailUrl);
    });
};

module.exports = globiData;
