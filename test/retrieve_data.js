var globiData = require('../');
var test = require('tape');

test('get species interactions', function(t) {
    t.plan(1);
    var search = {sourceTaxonScientificName:'Ariopsis felis'};
    var ee = globiData.findSpeciesInteractions(search);
    ee.on('ready', function() {
        t.ok(true);
    });
});

