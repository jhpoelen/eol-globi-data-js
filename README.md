# eol-globi-data-js

Find out what species interacts (e.g. eats, is eaten by) with other species.  Data provided by EOL's GloBI (Global Biotic Interactions): http://github.com/jhpoelen/eol-globi-data/wiki .

# example
If you'd like to see more that the samples below, please see test/ and example/ directories.

```javascript
var consoleDiv = document.getElementById('console');

// lookup some species by some string 'sea otter'
var closeMatchCallback = function(closeMatches) {
    closeMatches.forEach(function(closeMatch){
        // log scientific names of matches
        console.log(closeMatch.scientificName);
        var p = document.createElement('p');
        p.innerHTML = 'close match for sea otter [' + closeMatch.scientificName + ']';
        consoleDiv.appendChild(p);
    });
};
globiData.findCloseTaxonMatches('sea otter', closeMatchCallback);

// find out what a sea otter (Enhydra lutris) eats. . .
var search =  {sourceTaxonScientificName: 'Enhydra lutris', interactionType: 'preysOn'};
var callback = function(interactions) {
    interactions.forEach(function(interaction) {
        var p = document.createElement('p');
        p.innerHTML = '[' + interaction.source.name  + '] preys on ['  + interaction.target.name + ']';
        consoleDiv.appendChild(p);
    });
};
globiData.findSpeciesInteractions(search, callback);

// lookup some more info (including image urls) about the sea otter
var infoCallback = function(taxonInfo) {
    var name = taxonInfo.commonName + ' (<i>' + taxonInfo.scientificName + '</i>)';
    var infoDiv = document.createElement('div');
    infoDiv.innerHTML = '<table class="image"><caption align="bottom">' + name + '</caption>'
            + '<tr><td><img src="' + taxonInfo.thumbnailURL + '"/></td></tr></table>';
    consoleDiv.appendChild(infoDiv);
};
globiData.findTaxonInfo('Enhydra lutris', infoCallback);
```

[![Build Status](https://ci.testling.com/jhpoelen/eol-globi-data-js.png)](https://ci.testling.com/jhpoelen/eol-globi-data-js)

# methods

```javascript
var globiData = require('globi-data.js');
```

## globiData.findInteractionTypes
Returns available interaction types.

## globiData.findSpeciesInteractions(searchOptions, callback)
Provides a list of interactions to callback specific to search options.  Possible search options are:

 1. sourceTaxonScientificName

 2. targetTaxonScientificName

 3. interactionType

 4. lat / lng: latitude, longitude of interactions.

 5. nw_lat, nw_lng, se_lat, se_lng: spatial rectangle specified by north west and south east positions:

 ```
 nw(lat,lng) ------  ne
 |                    |
 |                    |
 sw ----------------se(lat,lng)
 ```

 an example of search options, where we'd like to find the prey of Hardhead Catfish _(Ariopsis felis)_ in a specific area:
 ```javascript
 options = {sourceTaxonScientificName: 'Ariopsis felis',
            interactionType: 'preysOn',
            nw_lat:30.52, nw_lng:-99.51, se_lat: 20.52, se_lng:-82.75}

 ```

 or example of search options, where we'd like to find which Arthropods _(Arthropoda)_ of Hardhead Catfish _(Ariopsis felis)_ in a specific area:
 ```javascript
  options = {sourceTaxonScientificName: 'Ariopsis felis',
               targetTaxonScientificName: 'Arthropoda'
             interactionType: 'preysOn',
             nw_lat:30.52, nw_lng:-99.51, se_lat: 20.52, se_lng:-82.75}

  ```

 example of returned interactions: two interactions where Hardhead Catfish _(Ariopsis felis)_ eats Chordates _(Chordata)_ and Palaemonid Shrimps _(Palaemonidae)_:

 ```javascript
[
    {
        "source":{"name":"Ariopsis felis"},
        "target":{"name":"Chordata"},
        "type":"preysOn"
    },
    {
        "source":{"name":"Ariopsis felis"},
        "target":{"name":"Palaemonidae"},
        "type":"preysOn"
    }
]
 ```

# Note

If you are not using npm (node package manager), please use globi-data-dist.js to embed this library into your app.