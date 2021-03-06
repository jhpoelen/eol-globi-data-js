var globiData = require('../');
var test = require('tape');

test('url for taxon info', function(t) {
	t.plan(1);
	t.equal(globiData.urlForTaxonImageQuery('Homo sapiens'), 'https://api.globalbioticinteractions.org/imagesForName?name=Homo%20sapiens');
});

test('url for taxon info with preferred language', function(t) {
	t.plan(1);
	t.equal(globiData.urlForTaxonImageQuery('Homo sapiens', { 'lang': 'en' }), 'https://api.globalbioticinteractions.org/imagesForName?name=Homo%20sapiens&lang=en');
});

test('url for interaction no target', function(t) {
	t.plan(1);
    var search = {'sourceTaxonScientificName': 'Homo sapiens', 'interactionType': 'preysOn'};
	t.equal(globiData.urlForTaxonInteractionQuery(search), 'https://api.globalbioticinteractions.org/taxon/Homo%20sapiens/preysOn?type=json.v2');
});

test('url for interaction with target', function(t) {
	t.plan(1);
    var search = {'sourceTaxonScientificName': 'Homo sapiens', 'interactionType': 'preysOn', 'targetTaxonScientificName': 'Canis lupus'};
	t.equal(globiData.urlForTaxonInteractionQuery(search), 'https://api.globalbioticinteractions.org/taxon/Homo%20sapiens/preysOn/Canis%20lupus?type=json.v2');
});

test('url for interaction location only', function(t) {
	t.plan(1);
    var search = {'location': {'lat': 10.2, 'lng':12.2}};
	t.equal(globiData.urlForTaxonInteractionQuery(search), 'https://api.globalbioticinteractions.org/interaction?type=json.v2&lat=10.2&lng=12.2');
});

test('url for interaction location only source taxon, target taxon', function(t) {
	t.plan(1);
    var search = {'location': {'lat': 10.2, 'lng':12.2}, 'sourceTaxa': ['Mammalia'], 'targetTaxa': ['Insecta', 'Ariopsis felis']};
	t.equal(globiData.urlForTaxonInteractionQuery(search), 'https://api.globalbioticinteractions.org/interaction?type=json.v2&lat=10.2&lng=12.2&sourceTaxon=Mammalia&targetTaxon=Insecta&targetTaxon=Ariopsis%20felis');
});

test('url for interaction location include observations', function(t) {
	t.plan(1);
    var search = {'includeObservations' : true};
	t.equal(globiData.urlForTaxonInteractionQuery(search), 'https://api.globalbioticinteractions.org/interaction?type=json.v2&includeObservations=true');
});

test('url for interaction exact name matches only', function(t) {
	t.plan(1);
    var search = {'exactNameMatchOnly' : true};
	t.equal(globiData.urlForTaxonInteractionQuery(search), 'https://api.globalbioticinteractions.org/interaction?type=json.v2&exactNameMatchOnly=true');
});

test('url for interactions according to', function(t) {
	t.plan(1);
    var search = {'accordingTo' : 'https://inaturalist.org/observations/123'};
	t.equal(globiData.urlForTaxonInteractionQuery(search), 'https://api.globalbioticinteractions.org/interaction?type=json.v2&accordingTo=https%3A%2F%2Finaturalist.org%2Fobservations%2F123');
});


test('url for search box location only source taxon, target taxon', function(t) {
	t.plan(1);
    var location = {nw_lat:41.574361, nw_lng:-125.53344800000002, se_lat:32.750323, se_lng: -114.74487299999998};
    var search = {location: location, sourceTaxa: ['Animalia'], targetTaxa: ['Insecta']};
	t.equal(globiData.urlForTaxonInteractionQuery(search), 'https://api.globalbioticinteractions.org/interaction?type=json.v2&nw_lat=41.574361&nw_lng=-125.53344800000002&se_lat=32.750323&se_lng=-114.74487299999998&sourceTaxon=Animalia&targetTaxon=Insecta');
});

test('url for interaction - different result types', function(t) {
    t.plan(5);
    var searchWithResultTypeJson = {'sourceTaxonScientificName': 'Homo sapiens', 'interactionType': 'preysOn', 'resultType': 'json'};
    t.equal(globiData.urlForTaxonInteractionQuery(searchWithResultTypeJson), 'https://api.globalbioticinteractions.org/taxon/Homo%20sapiens/preysOn?type=json');
    var searchWithResultTypeCsv = {'sourceTaxonScientificName': 'Homo sapiens', 'interactionType': 'preysOn', 'resultType': 'csv'};
    t.equal(globiData.urlForTaxonInteractionQuery(searchWithResultTypeCsv), 'https://api.globalbioticinteractions.org/taxon/Homo%20sapiens/preysOn.csv?type=csv');
    var searchWithResultTypeDot = {'sourceTaxonScientificName': 'Homo sapiens', 'interactionType': 'preysOn', 'resultType': 'dot'};
    t.equal(globiData.urlForTaxonInteractionQuery(searchWithResultTypeDot), 'https://api.globalbioticinteractions.org/taxon/Homo%20sapiens/preysOn.dot?type=dot');
    searchWithResultTypeCsv = {'sourceTaxa': ['Homo sapiens'], 'interactionType': 'preysOn', 'resultType': 'csv'};
    t.equal(globiData.urlForTaxonInteractionQuery(searchWithResultTypeCsv), 'https://api.globalbioticinteractions.org/interaction.csv?type=csv&interactionType=preysOn&sourceTaxon=Homo%20sapiens');
    var searchWithNoSpecificResultType = {'sourceTaxonScientificName': 'Homo sapiens', 'interactionType': 'preysOn'};
    t.equal(globiData.urlForTaxonInteractionQuery(searchWithNoSpecificResultType), 'https://api.globalbioticinteractions.org/taxon/Homo%20sapiens/preysOn?type=json.v2');
});

test('url with fields', function(t) {
    t.plan(1);
    var searchWithResultTypeJson = {'sourceTaxa': ['Homo sapiens'], 'interactionType': 'preysOn', 'fields': ['interaction_type', 'source_taxon_name']};
    t.equal(globiData.urlForTaxonInteractionQuery(searchWithResultTypeJson), 'https://api.globalbioticinteractions.org/interaction?type=json.v2&interactionType=preysOn&sourceTaxon=Homo%20sapiens&field=interaction_type&field=source_taxon_name');
});

test('url with taxon array', function(t) {
    t.plan(1);
    var searchWithResultTypeJson = { sourceTaxon: ['Homo sapiens'], interactionType: 'preysOn'};
    t.equal(globiData.urlForTaxonInteractionQuery(searchWithResultTypeJson), 'https://api.globalbioticinteractions.org/interaction?type=json.v2&sourceTaxon=Homo%20sapiens&interactionType=preysOn');
});

test('url with taxon value', function(t) {
    t.plan(1);
    var searchWithResultTypeJson = { sourceTaxon: 'Homo sapiens', interactionType: 'preysOn'};
    t.equal(globiData.urlForTaxonInteractionQuery(searchWithResultTypeJson), 'https://api.globalbioticinteractions.org/interaction?type=json.v2&sourceTaxon=Homo%20sapiens&interactionType=preysOn');
});

test('url with taxa and taxon array', function(t) {
    t.plan(1);
    var searchWithResultTypeJson = { sourceTaxa: ['Ariopsis felis'], sourceTaxon: ['Homo sapiens'], interactionType: 'preysOn'};
    t.equal(globiData.urlForTaxonInteractionQuery(searchWithResultTypeJson), 'https://api.globalbioticinteractions.org/interaction?type=json.v2&sourceTaxon=Homo%20sapiens&interactionType=preysOn');
});

test('url with bbox', function(t) {
    t.plan(1);
    var searchWithBBoxSet = {'bbox': '42,23,100,100'};
    t.equal(globiData.urlForTaxonInteractionQuery(searchWithBBoxSet), 'https://api.globalbioticinteractions.org/interaction?type=json.v2&bbox=42%2C23%2C100%2C100');
});
