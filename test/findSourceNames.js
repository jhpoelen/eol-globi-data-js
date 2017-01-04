var globiData = require('../');
var test = require('tape');

test('find names', function (t) {
  t.plan(1);
  var repos = globiData.findSourceNames(function(names) {
    t.ok(names.length > 0);
  });

});
