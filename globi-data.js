var d3 = require("d3");

var globiData = {};
globiData.d3 = d3;

var urlPrefix = "http://trophicgraph.com:8080";

var locationQuery = function (location) {
    var locationQuery = "";
    for (var elem in location) {
        locationQuery += elem + "=" + location[elem] + "&";
    }
    return locationQuery;
}


globiData.urlForTaxonInteractionQuery = function (search) {
    var uri = urlPrefix;

    if (search.sourceTaxonScientificName) {
        uri = uri + "/taxon/" + encodeURIComponent(search.sourceTaxonScientificName) + "/" + search.interactionType;
        if (search.targetTaxonScientificName) {
            uri = uri + "/" + encodeURIComponent(search.targetTaxonScientificName);
        }
    } else {
        uri = uri + "/interaction";
    }

    uri =  uri + '?type=json.v2';
    if (search.location) {
        uri = uri + '&' + locationQuery(search.location);
    }
    return uri;
};

globiData.urlForTaxonImageQuery = function (scientificName) {
    return urlPrefix + "/imagesForName/" + encodeURIComponent(scientificName);
};

globiData.findSpeciesInteractions = function (search, callback) {
    var uri = "";
    if (search.sourceTaxonScientificName) {
        uri = globiData.urlForTaxonInteractionQuery(search);
    } else if (search.location) {
        var json_local = false;
        uri = json_local ? "interactions.json" : "http://trophicgraph.com:8080/interaction?type=json.v2&" + locationQuery(location);
    } else {
        callback("search parameters [" + search + "] not supported");
    }
    d3.json(uri, callback);
};

globiData.findTaxonInfo = function (scientificName, callback) {
    d3.json(globiData.urlForTaxonImageQuery(scientificName), callback)
};


module.exports = globiData;
