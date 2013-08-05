var d3 = require("d3");

var globiData = {};
globiData.d3 = d3;

var urlPrefix = "http://trophicgraph.com:8080";

globiData.urlForTaxonInteractionQuery = function (search) {
    var uri = urlPrefix + "/taxon/" + encodeURIComponent(search.sourceTaxonScientificName) + "/" + search.interactionType;
    if (search.targetTaxonScientificName) {
        uri = uri + "/" + encodeURIComponent(search.targetTaxonScientificName);
    }
    return uri + '?type=json.v2';
};

globiData.urlForTaxonImageQuery = function (scientificName) {
    return urlPrefix + "/imagesForName/" + encodeURIComponent(scientificName);
};

globiData.findSpeciesInteractions = function (search, callback) {
    var uri = globiData.urlForTaxonInteractionQuery(search);
    d3.json(uri, callback);
};

globiData.findTaxonInfo = function (scientificName, callback) {
    d3.json(globiData.urlForTaxonImageQuery(scientificName), callback)
};


module.exports = globiData;
