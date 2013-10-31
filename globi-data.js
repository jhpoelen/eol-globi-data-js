var EventEmitter = require('events').EventEmitter;

var globiData = {};

var urlPrefix = 'http://trophicgraph.com:8080';


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
    var interactions = [];
    console.log('requesting interaction data from: [' + uri + ']');
    var req = createReq();
    req.open('GET', uri ,true);
    req.onreadystatechange = function() {
        if (req.readyState === 4 && req.status === 200) {
            var resp = JSON.parse(req.responseText);
            console.log('received from [' + uri + '] resp [' + resp + ']');
            ee.emit('ready');
        }
    };
    req.send(null);
    ee.interactions = interactions;
    return ee;
};

globiData.findTaxonInfo = function (scientificName, callback) {
    //d3.json(globiData.urlForTaxonImageQuery(scientificName), callback)
};


module.exports = globiData;
