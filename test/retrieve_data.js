var globiData = require('../');
var test = require('tape');

test('get species interactions', function (t) {
    t.plan(2);
    var search = {sourceTaxonScientificName: 'Ariopsis felis', interactionType: 'preysOn'};
    var ee = globiData.findSpeciesInteractions(search);
    t.ok(ee.interactions.length == 0, 'starting with no interactions');
    ee.on('ready', function () {
        console.log(ee.interactions.length);
        t.ok(ee.interactions.length > 0, 'should get at least one interaction');
    });
    ee.on('error', function () {

    });
});

test('get taxonInfo interactions', function (t) {
    t.plan(2);
    var ee = globiData.findTaxonInfo('Ariopsis felis');
    ee.on('ready', function () {
        t.ok(ee.taxonInfo.commonName === 'Hardhead Catfish', 'should have a common name');
        t.ok(ee.taxonInfo.scientificName === 'Ariopsis felis', 'should have a scientific name');
    });
    ee.on('error', function () {

    });
});

test('find close taxon matches', function (t) {
    t.plan(4);
    var ee = globiData.findCloseTaxonMatches('Dog');
    ee.on('ready', function () {
        t.ok(ee.closeMatches.length > 0, 'found at least one match');
        var firstMatch = ee.closeMatches[0];
        t.equal(firstMatch.scientificName, 'Mutinus caninus');
        console.log('common names: [' + firstMatch.commonNames + ']');
        t.ok(firstMatch.commonNames.length > 0, 'expected at least one common name');
        console.log('taxon path [' + firstMatch.path + ']');

        t.ok(firstMatch.path.length > 0, 'expected some parent taxa');
    });
    ee.on('error', function () {

    });
});


