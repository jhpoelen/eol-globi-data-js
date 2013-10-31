eol-globi-data-js
=================

[![Build Status](https://ci.testling.com/jhpoelen/eol-globi-data-js.png)](https://ci.testling.com/jhpoelen/eol-globi-data-js)

Javascript API for accessing global species interaction data.  Find out who eats who. . .

If you are not using npm (node package manager), please use globi-data-dist.js to embed this library into your app.


If you'd like to see more that the samples below, please see test/ and example/ directories.

```javascript

var consoleDiv = document.getElementById('console');

// lookup some species by some string 'sea otter'
var matcher = globiData.findCloseTaxonMatches('sea otter');
matcher.on('ready', function() {
    matcher.closeMatches.forEach(function(closeMatch){
        // log scientific names of matches
        console.log(closeMatch.scientificName);
        var p = document.createElement('p');
        p.innerHTML = 'close match for sea otter [' + closeMatch.scientificName + ']';
        consoleDiv.appendChild(p);
    });
});

// find out what a sea otter (Enhydra lutris) eats. . .
var search =  {sourceTaxonScientificName: 'Enhydra lutris', interactionType: 'preysOn'};
var seaOtterPrey = globiData.findSpeciesInteractions(search);
seaOtterPrey.on('ready', function() {
    seaOtterPrey.interactions.forEach(function(interaction) {
        var p = document.createElement('p');
        p.innerHTML = '[' + interaction.source.name  + '] preys on ['  + interaction.target.name + ']';
        consoleDiv.appendChild(p);
    });
});

// lookup some more info (including image urls) about the sea otter
var info = globiData.findTaxonInfo('Enhydra lutris');
info.on('ready', function() {
    var name = info.taxonInfo.commonName + ' (<i>' + info.taxonInfo.scientificName + '</i>)';
    var infoDiv = document.createElement('div');
    infoDiv.innerHTML = '<table class="image"><caption align="bottom">' + name + '</caption>'
            + '<tr><td><img src="' + info.taxonInfo.thumbnailURL + '"/></td></tr></table>';
    consoleDiv.appendChild(infoDiv);
});

```