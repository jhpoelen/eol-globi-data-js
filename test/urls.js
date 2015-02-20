var globiData = require('../');
var test = require('tape');

test('url for taxon info', function(t) {
	t.plan(1);
	t.equal(globiData.urlForTaxonImageQuery('Homo sapiens'), 'http://api.globalbioticinteractions.org/imagesForName?name=Homo%20sapiens');
});

test('url for interaction no target', function(t) {
	t.plan(1);
    var search = {'sourceTaxonScientificName': 'Homo sapiens', 'interactionType': 'preysOn'};
	t.equal(globiData.urlForTaxonInteractionQuery(search), 'http://api.globalbioticinteractions.org/taxon/Homo%20sapiens/preysOn?type=json.v2');
});

test('url for interaction with target', function(t) {
	t.plan(1);
    var search = {'sourceTaxonScientificName': 'Homo sapiens', 'interactionType': 'preysOn', 'targetTaxonScientificName': 'Canis lupus'};
	t.equal(globiData.urlForTaxonInteractionQuery(search), 'http://api.globalbioticinteractions.org/taxon/Homo%20sapiens/preysOn/Canis%20lupus?type=json.v2');
});

test('url for interaction location only', function(t) {
	t.plan(1);
    var search = {'location': {'lat': 10.2, 'lng':12.2}};
	t.equal(globiData.urlForTaxonInteractionQuery(search), 'http://api.globalbioticinteractions.org/interaction?type=json.v2&lat=10.2&lng=12.2&');
});

test('url for interaction location only source taxon, target taxon', function(t) {
	t.plan(1);
    var search = {'location': {'lat': 10.2, 'lng':12.2}, 'sourceTaxa': ['Mammalia'], 'targetTaxa': ['Insecta', 'Ariopsis felis']};
	t.equal(globiData.urlForTaxonInteractionQuery(search), 'http://api.globalbioticinteractions.org/interaction?type=json.v2&lat=10.2&lng=12.2&sourceTaxon=Mammalia&targetTaxon=Insecta&targetTaxon=Ariopsis%20felis&');
});


test('url for search box location only source taxon, target taxon', function(t) {
	t.plan(1);
    var location = {nw_lat:41.574361, nw_lng:-125.53344800000002, se_lat:32.750323, se_lng: -114.74487299999998};
    var search = {location: location, sourceTaxa: ['Animalia'], targetTaxa: ['Insecta']};
	t.equal(globiData.urlForTaxonInteractionQuery(search), 'http://api.globalbioticinteractions.org/interaction?type=json.v2&nw_lat=41.574361&nw_lng=-125.53344800000002&se_lat=32.750323&se_lng=-114.74487299999998&sourceTaxon=Animalia&targetTaxon=Insecta&');
});

test('url for search box location for study stats', function(t) {
	t.plan(1);
    var location = {nw_lat:41.574361, nw_lng:-125.53344800000002, se_lat:32.750323, se_lng: -114.74487299999998};
    var search = {location: location, sourceTaxa: ['Animalia'], targetTaxa: ['Insecta']};
	t.equal(globiData.urlForStudyStats(search), 'http://api.globalbioticinteractions.org/contributors?&nw_lat=41.574361&nw_lng=-125.53344800000002&se_lat=32.750323&se_lng=-114.74487299999998&sourceTaxon=Animalia&targetTaxon=Insecta&');
});
