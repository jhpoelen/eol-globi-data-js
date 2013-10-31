var EventEmitter = require('events').EventEmitter;

var globiData = {};

var urlPrefix = 'http://trophicgraph.com:8080';

globiData.urlForFindCloseTaxonMatches = function (name) {
    return urlPrefix + '/findCloseMatchesForTaxon/'  + encodeURIComponent(name);
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

globiData.findSpeciesInteractions = function (search) {
    var ee = new EventEmitter();
    var uri = globiData.urlForTaxonInteractionQuery(search);
    var req = createReq();
    req.open('GET', uri ,true);
    req.onreadystatechange = function() {
        if (req.readyState === 4 && req.status === 200) {
            console.log('requesting [' + uri + ']');
            ee.interactions = JSON.parse(req.responseText);
            ee.emit('ready');
        }
    };
    req.send(null);
    ee.interactions = [];
    return ee;
};

globiData.findTaxonInfo = function (scientificName) {
    var ee = new EventEmitter();
    var uri = globiData.urlForTaxonImageQuery(scientificName);
    console.log('requesting taxon image data from: [' + uri + ']');
    var req = createReq();
    req.open('GET', uri ,true);
    req.onreadystatechange = function() {
        if (req.readyState === 4 && req.status === 200) {
            console.log('received some data [' + req.responseText + ']');
            ee.taxonInfo = JSON.parse(req.responseText);
            ee.emit('ready');
        }
    };
    req.send(null);
    ee.taxonInfo = { scientificName: scientificName };
    return ee;
};

globiData.findCloseTaxonMatches = function (name) {
    var ee = new EventEmitter();
    var uri = globiData.urlForFindCloseTaxonMatches(name);
    var req = createReq();
    req.open('GET', uri ,true);
    req.onreadystatechange = function() {
        if (req.readyState === 4 && req.status === 200) {
            var response = JSON.parse(req.responseText);
            var data = response.data;
            data.forEach(function(element, index) {
                var commonNamesString = element[1];
                var commonNamesSplit = commonNamesString.split('|');
                var commonNames = [];
                commonNamesSplit.forEach(function(element, index) {
                    var commonName = element.split('@');
                    if (commonName.length > 1) {
                        commonNames[index] = { name: commonName[0], lang: commonName[1]};
                    }
                });
                var path = element[2].split('|');
                ee.closeMatches[index] = { scientificName: element[0], commonNames: commonNames, path: path};
            });
            ee.emit('ready');
        }
    };
    req.send(null);
    ee.closeMatches = [];
    return ee;
};

module.exports = globiData;
