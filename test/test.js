var globiData = require('../');
var test = require('tape');

test('my first test', function(t) {
	t.plan(2);
	t.equal(globiData.fooz, 'barz');
    t.equal(globiData.foo(), "bar");
    
});
