var nodeXHR = require("xmlhttprequest");
var globiData = {};

var urlPrefix = 'http://trophicgraph.com:8080';

globiData.urlForFindCloseTaxonMatches = function (name) {
    return urlPrefix + '/findCloseMatchesForTaxon/' + encodeURIComponent(name);
}

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
    }

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
    return urlPrefix + '/imagesForName/' + encodeURIComponent(scientificName);
};

globiData.urlForTaxonImagesQuery = function(scientificNames) {
	var nameQuery = '?';
	if (scientificNames) {
		for (var index in scientificNames) {
			nameQuery += 'name=' + encodeURIComponent(scientificNames[index]) + '&';
		}
	}
	return urlPrefix + '/imagesForNames' + nameQuery;
}

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
            var data = result['data'];
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
					stats.doi = row[9];
				}

				var source = row[10];
				if (source && source.length > 0) {
					stats.source = row[10];
				}
				studyStats[i] = stats;
            }
            callback(studyStats);
        }
    };
    req.send(null);
}

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
}

globiData.findInteractionTypes = function (callback) {
    var req = createReq();
    req.open('GET', urlPrefix + '/interactionTypes', true);
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200) {
            callback(JSON.parse(req.responseText));
        }
    };
    req.send(null);
}

globiData.findSpeciesInteractions = function (search, callback) {
    var uri = globiData.urlForTaxonInteractionQuery(search);
    var req = createReq();
    req.open('GET', uri, true);
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200) {
            callback(JSON.parse(req.responseText));
        }
    };
    req.send(null);
};


globiData.findTaxonInfo = function (scientificName, callback) {
	var uri = globiData.urlForTaxonImageQuery(scientificName);	
	globiData.get(uri, callback);
}

globiData.findTaxaInfo = function (scientificNames, callback) {
	var uri = globiData.urlForTaxonImagesQuery(scientificNames);
	console.log(uri);	
	globiData.get(uri, callback);
}

globiData.get = function (uri, callback) {
    var req = createReq();
    req.open('GET', uri, true);
    req.onreadystatechange = function () {
        if (req.readyState === 4 && req.status === 200) {
            callback(JSON.parse(req.responseText));
        }
    };
    req.send(null);
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
                var commonNamesString = element[1];
                var commonNamesSplit = commonNamesString.split('|');
                var commonNames = [];
                var taxonHierarchy = [];
                commonNamesSplit.forEach(function (element, index) {
                    var commonName = element.split('@');
                    if (commonName.length > 1) {
                        commonNames[index] = { name: commonName[0].trim(), lang: commonName[1].trim()};
                    }
                });
                var path = element[2].split('|');
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

module.exports = globiData;
