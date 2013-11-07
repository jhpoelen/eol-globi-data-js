var globiData = require('../');
var test = require('tape');

test('get species interactions', function (t) {
    t.plan(1);
    var search = {sourceTaxonScientificName: 'Ariopsis felis', interactionType: 'preysOn'};
    var callback = function (interactions) {
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
        t.ok(firstMatch.commonNames.length > 0, 'expected at least one common name');
        t.ok(firstMatch.path.length > 0, 'expected some parent taxa');

    };
    globiData.findCloseTaxonMatches('Dog', callback);
});

var assertCloseMatches = function (t, closeMatches) {
    t.ok(closeMatches.length > 0, 'found at least one match');
    closeMatches.forEach(function (match, index) {
        var match = closeMatches[index];
        if (index == 0) {
            t.ok(match.commonNames.length > 0, 'expected at least one common name');
            t.ok(match.path.length > 0, 'expected some parent taxa');
        }
    });
};

test('find close taxon matches [Homo s]', function (t) {
    t.plan(3);
    globiData.findCloseTaxonMatches('Homo s', function (closeMatches) {
        assertCloseMatches(t, closeMatches);
    });
});

test('find close taxon matches for [Homo]', function (t) {
    t.plan(3);
    globiData.findCloseTaxonMatches('Homo', function (closeMatches) {
        assertCloseMatches(t, closeMatches);
    });
});

test('find close taxon matches for [hardhead catfish]', function (t) {
    t.plan(3);
    globiData.findCloseTaxonMatches('hardhead catfish', function (closeMatches) {
        assertCloseMatches(t, closeMatches);
    });
});





