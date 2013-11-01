var globiData = require('../');
var test = require('tape');

test('get species interactions', function (t) {
    t.plan(1);
    var search = {sourceTaxonScientificName: 'Ariopsis felis', interactionType: 'preysOn'};
    var callback =  function (interactions) {
        t.ok(interactions.length > 0, 'should get at least one interaction');
    };
    var ee = globiData.findSpeciesInteractions(search, callback);
});

test('get taxonInfo interactions', function (t) {
    t.plan(2);
    var callback = function (taxonInfo) {
        t.equal('Hardhead Catfish', taxonInfo.commonName, 'should have a common name');
        t.equal('Ariopsis felis', taxonInfo.scientificName, 'should have a scientific name');
    };
    globiData.findTaxonInfo('Ariopsis felis', callback);
});

test('find close taxon matches', function (t) {
    t.plan(4);
    var callback = function (closeMatches) {
        t.ok(closeMatches.length > 0, 'found at least one match');
        var firstMatch = closeMatches[0];
        t.equal(firstMatch.scientificName, 'Mutinus caninus');
        console.log('common names: [' + firstMatch.commonNames + ']');
        t.ok(firstMatch.commonNames.length > 0, 'expected at least one common name');
        console.log('taxon path [' + firstMatch.path + ']');
        t.ok(firstMatch.path.length > 0, 'expected some parent taxa');

    };
    globiData.findCloseTaxonMatches('Dog', callback);
});


