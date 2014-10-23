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

test('get information for one taxon name', function (t) {
    t.plan(2);
    var callback = function (taxonInfo) {
        t.equal('Sea Catfish', taxonInfo.commonName, 'should have a common name');
        t.equal('Ariopsis felis', taxonInfo.scientificName, 'should have a scientific name');
    };
    globiData.findTaxonInfo('Ariopsis felis', callback);
});

test('close match no path', function(t) {
  t.plan(1);
  var callback = function (taxonMatches) {
    t.ok(taxonMatches.length > 0, "should have at least one match");
  };
  globiData.findCloseTaxonMatches('Ungusurculus komodoensis', callback);
});


test('get information for two taxon names', function (t) {
    t.plan(4);
    var callback = function (taxonInfo) {
        t.equal('Humans', taxonInfo[0].commonName, 'should have a common name');
        t.equal('Homo sapiens', taxonInfo[0].scientificName, 'should have a scientific name');
        t.equal('Sea Catfish', taxonInfo[1].commonName, 'should have a common name');
        t.equal('Ariopsis felis', taxonInfo[1].scientificName, 'should have a scientific name');
    };
    globiData.findTaxaInfo(['Homo sapiens','Ariopsis felis'], callback);
});

test('find close taxon matches', function (t) {
    t.plan(4);
    var callback = function (closeMatches) {
        t.ok(closeMatches.length > 0, 'found at least one match');
        var foundMuntinusCaninus = false;
		var foundAtLeastSomeCommonNames = false;
		var foundAtLeastSomePaths = false;
		closeMatches.forEach(function(match) {
			foundMuntinusCaninus = foundMuntinusCaninus || match.scientificName === 'Mutinus caninus';
			foundAtLeastSomeCommonNames = foundAtLeastSomeCommonNames || match.commonNames.length > 0;
			foundAtLeastSomePaths = foundAtLeastSomePaths || match.path.length > 0;
		});
        t.ok(foundMuntinusCaninus, 'expected Mutinus caninus');
        t.ok(foundAtLeastSomeCommonNames, 'expected at least one common name');
        t.ok(foundAtLeastSomePaths, 'expected some parent taxa');

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

test('find close taxon matches for [sea catfish]', function (t) {
    t.plan(3);
    globiData.findCloseTaxonMatches('sea catfish', function (closeMatches) {
        assertCloseMatches(t, closeMatches);
    });
});





