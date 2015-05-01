var nodeXHR = require("xmlhttprequest");
var globiData = {};

var urlPrefix = 'http://api.globalbioticinteractions.org';

var addQueryParams = function (uri, search) {
        var locationQuery = function (location) {
            var locationQuery = '';
            for (var elem in location) {
                if (location.hasOwnProperty(elem)) {
                    locationQuery += '&' + elem + '=' + location[elem];
                }
            }
            return locationQuery;
        };

        if (search.bbox) {
            uri = uri + '&bbox=' + search.bbox;
        }

        if (search.location) {
            uri = uri + locationQuery(search.location);
        }

        if (search.includeObservations) {
            uri = uri + '&includeObservations=true';
        }

        if (search.exactNameMatchOnly) {
            uri = uri + '&exactNameMatchOnly=true';
        }

        if (search.excludeChildTaxa) {
            uri = uri + '&excludeChildTaxa=true';
        }

        if (search.accordingTo) {
            uri = uri + '&accordingTo=' + encodeURIComponent(search.accordingTo);
        }

        if (search.interactionType) {
            uri = uri + '&interactionType=' + encodeURIComponent(search.interactionType);
        }

        function addQueryParams(taxonNames, elemName) {
            if (taxonNames) {
                var taxonQuery = '';
                for (var name in taxonNames) {
                    if (taxonNames.hasOwnProperty(name)) {
                        taxonQuery += '&' + elemName + '=' + encodeURIComponent(taxonNames[name]);
                    }
                }
                uri = uri + taxonQuery;
            }
        }

        addQueryParams(search.sourceTaxa, 'sourceTaxon');
        addQueryParams(search.targetTaxa, 'targetTaxon');
        addQueryParams(search.fields, 'field');

        if (search.source) {
            uri = uri + 'source=' + encodeURIComponent(search.source);
        }
        return uri;
    }
    ;

globiData.urlForFindCloseTaxonMatches = function (name) {
    return urlPrefix + '/findCloseMatchesForTaxon/' + encodeURIComponent(name);
};

globiData.urlForTaxonInteractionQuery = function (search) {
    var uri = urlPrefix;

    if (search.sourceTaxonScientificName) {
        uri = uri + '/taxon/' + encodeURIComponent(search.sourceTaxonScientificName);
        if (search.interactionType) {
            uri = uri + '/' + encodeURIComponent(search.interactionType);
            delete search.interactionType;
        }
        if (search.targetTaxonScientificName) {
            uri = uri + '/' + encodeURIComponent(search.targetTaxonScientificName);
        }
    } else {
        uri = uri + '/interaction';
    }
    var ext = {'csv': '.csv', 'dot': '.dot'}
    uri = uri + (ext[search.resultType] === undefined ? '' : ext[search.resultType]);
    uri = uri + '?type=' + (search.resultType ? search.resultType : 'json.v2');
    return addQueryParams(uri, search);
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

module.exports = globiData;
