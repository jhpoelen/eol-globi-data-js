!function(e){"object"==typeof exports?module.exports=e():"function"==typeof define&&define.amd?define(e):"undefined"!=typeof window?window.globiData=e():"undefined"!=typeof global?global.globiData=e():"undefined"!=typeof self&&(self.globiData=e())}(function(){var define,module,exports;
return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

var createReq = function () {
    var req;
    if (window.XMLHttpRequest) { // Mozilla, Safari, ...
        req = new XMLHttpRequest();
    } else if (window.ActiveXObject) { // IE
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
                var reference = row[2];
                var name = row[3];
                if (name.length > 0) {
                    reference = name + ' ' + reference;
                }
                studyStats[i] = { reference: reference, totalInteractions: row[4], totalSourceTaxa: row[5], totalTargetTaxa: row[6]};
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
                totalTargetTaxa: resp.data[0][3]};
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

},{}]},{},[1])
(1)
});
;