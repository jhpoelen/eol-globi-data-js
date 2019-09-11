var globiData = require('../');
var test = require('tape');

test('get species interactions', function (t) {
    t.plan(1);
    var search = {sourceTaxonScientificName: 'Ariopsis felis', interactionType: 'eats'};
    var callback = function (interactions) {
        t.ok(interactions.length > 0, 'should get at least one interaction');
    };
    var ee = globiData.findSpeciesInteractions(search, callback);
});




test('get species interactions using nodes/links json format', function (t) {
    t.plan(8);
    var search = {sourceTaxon: 'Ariopsis felis', interactionType: 'eats', resultType: 'd3'};
    var callback = function (interactions) {
        var links = interactions.links;
        var nodes = interactions.nodes;
        t.ok(links !== undefined, 'should have links');
        t.ok(links[0].source !== undefined, 'link should have source');
        t.ok(links[0].target !== undefined, 'link should have target');
        t.ok(links[0].interaction_type !== undefined, 'link should have interactionType');

        t.ok(nodes !== undefined, 'should have links');
        t.ok(nodes[0].taxon_name !== undefined, 'node should have taxonName');
        t.ok(nodes[0].taxon_path !== undefined, 'node should have taxon path');
        t.ok(nodes[0].taxon_external_id, 'node should have taxon id');

    };
    globiData.findSpeciesInteractions(search, callback);
});

test('get species interactions using nodes/links json format using bbox', function (t) {
    t.plan(8);
    var search = { bbox: '3.36,50.75,7.23,53.59', limit: 10, resultType: 'd3'};
    var callback = function (interactions) {
        var links = interactions.links;
        var nodes = interactions.nodes;
        t.ok(links !== undefined, 'should have links');
        t.ok(links[0].source !== undefined, 'link should have source');
        t.ok(links[0].target !== undefined, 'link should have target');
        t.ok(links[0].interaction_type !== undefined, 'link should have interactionType');

        t.ok(nodes !== undefined, 'should have links');
        t.ok(nodes[0].taxon_name !== undefined, 'node should have taxonName');
        t.ok(nodes[0].taxon_path !== undefined, 'node should have taxon path');
        t.ok(nodes[0].taxon_external_id, 'node should have taxon id');

    };
    globiData.findSpeciesInteractions(search, callback);
});


test('get information for one taxon name', function (t) {
    t.plan(1);
    var callback = function (taxonInfo) {
        t.equal('Homo sapiens', taxonInfo.scientificName, 'should have a scientific name');
    };
    globiData.findTaxonInfo('EOL:327955', callback);
});

test('close match no path', function (t) {
    t.plan(1);
    var callback = function (taxonMatches) {
        t.ok(taxonMatches.length > 0, "should have at least one match");
    };
    globiData.findCloseTaxonMatches('Ungusurculus komodoensis', callback);
});


test('get information for two taxon names', function (t) {
    t.plan(2);
    var callback = function (taxonInfo) {
        t.equal(taxonInfo[0].commonName, 'human', 'should have a common name');
        t.equal('Homo sapiens', taxonInfo[0].scientificName, 'should have a scientific name');
    };
    globiData.findTaxaInfo(['EOL:327955', 'Ariopsis felis'], callback);
});

test('find close taxon matches', function (t) {
    t.plan(3);
    var callback = function (closeMatches) {
        t.ok(closeMatches.length > 0, 'found at least one match');
        var foundAtLeastSomeCommonNames = false;
        var foundAtLeastSomePaths = false;
        closeMatches.forEach(function (match) {
            foundAtLeastSomeCommonNames = foundAtLeastSomeCommonNames || match.commonNames.count > 0;
            foundAtLeastSomePaths = foundAtLeastSomePaths || match.path.length > 0;
        });
        t.ok(foundAtLeastSomeCommonNames, 'expected at least one common name');
        t.ok(foundAtLeastSomePaths, 'expected some parent taxa');

    };
    globiData.findCloseTaxonMatches('Dog', callback);
});
