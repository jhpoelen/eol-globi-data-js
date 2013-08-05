var globiData = require('../');
var test = require('tape');

test('url for taxon info', function(t) {
	t.plan(1);
	t.equal(globiData.urlForTaxonImageQuery("Homo sapiens"), 'http://trophicgraph.com:8080/imagesForName/Homo%20sapiens');

});

test('url for interaction no target', function(t) {
	t.plan(1);
    var search = {"sourceTaxonScientificName": "Homo sapiens", "interactionType": "preysOn"};
	t.equal(globiData.urlForTaxonInteractionQuery(search), 'http://trophicgraph.com:8080/taxon/Homo%20sapiens/preysOn?type=json.v2');

});

test('url for interaction with target', function(t) {
	t.plan(1);
    var search = {"sourceTaxonScientificName": "Homo sapiens", "interactionType": "preysOn", "targetTaxonScientificName": "Canis lupus"};
	t.equal(globiData.urlForTaxonInteractionQuery(search), 'http://trophicgraph.com:8080/taxon/Homo%20sapiens/preysOn/Canis%20lupus?type=json.v2');
});
