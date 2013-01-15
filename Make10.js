/******************************************************************************* 
 * 
 * Copyright 2013 Bess Siegal
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 ******************************************************************************/

var TILE_WIDTH = 44;
var TILE_HEIGHT = 60;

var STAGE_WIDTH = 440;
var STAGE_HEIGHT = 600;

var MAX_WALL_INDEX = 9;

function Tile(/*int*/ value, /*int*/ x, /*int*/ y, /*String*/ tileType) {
    /*
     * int value of the tile
     */
    this.value = value; 
    /*
     * String type of tile: Valid values 'current', 'next', 'wall' 
     */
    this.type = tileType;
    /*
     * Kinetic.Group where the rect and text are
     */
    this.group = null; 
    /*
     * Of which TileRow this 'wall' tile is a member
     */
    this.tileRow = null;
    /*
     * int index of where in the TileRow it is a member
     */
    this.tileColIndex = undefined;
    this.x = x;
    this.y = y;
    
    this.init = function() {
        Make10.consoleLog('Tile.init value = ' + this.value);
        /*
         * For now just drawing a rectangle with a number value
         * (eventually use dots and Chinese character mahjong tile images?)
         */
        
        var group = new Kinetic.Group();
        
        /*
         * Draw the tile
         */
        var tile = new Kinetic.Rect({
            x: this.x,
            y: this.y,
            width: TILE_WIDTH,
            height: TILE_HEIGHT,
            name: 'tile',
            fill: 'white',
            stroke: 'black',
            strokeWidth: 1
        });
        group.add(tile);        
        
        /*
         * Add the value as a text
         */
        var label = '' + this.value;
        var text = new Kinetic.Text({
            x: this.x + TILE_WIDTH / 2 - 5,
            y: this.y + TILE_HEIGHT / 2 - 5,
            name: 'text',
            stroke: 'black',
//            strokeWidth: 2,
            fill: '#F9F9F9',
            text: label,
            fontSize: 20,
            fontFamily: 'Calibri',
            textFill: '#888',
//            textStroke: '#444',
//            padding: 7,
            align: 'center',
//            verticalAlign: 'middle'
        });
        group.add(text);
        
        /*
         * mouseout touchend (click and touch, too?) 
         * to test if the current tile plus
         */
        var thiz = this;
        group.on('click touch', function() {
            Make10.consoleLog('tile click touch value = ' + thiz.value + ', ' + thiz.type);
            if (thiz.type === 'wall') {
                if (Make10.currentTile.value + thiz.value === Make10.makeValue) {

                    Make10.valueMade(thiz);
                    
                } else {
                    
                    Make10.valueNotMade(thiz);
                }
            }
        });

        this.group = group;
    };    
    
    this.transitionTo = function(/*int*/ x, /*int*/ y, /*function*/ callback) {
        Make10.consoleLog('Tile.transition to x = ' + x + ' y = ' + y);
        this.group.transitionTo({
            x: x,
            y: y,
            duration: 0.5,
            easing: 'ease-out',
            callback: callback
          });
        this.x = x;
        this.y = y;

    };
    
    this.destroy = function() {
        if (this.type === 'wall') {
            this.tileRow.removeTile(this.tileColIndex);            
        }
        Make10.consoleLog('destroy group: ');
        Make10.consoleLog(this.group);
        // this is not a method on destroy this.group.destroy();
        /*
         * Destroy all children and remove group
         * TODO
         */
        
        this.group.remove();
    };
    
    this.moveToWall = function(/*int*/ tileColIndex, /*int*/ x, /*int*/ y) {
        /*
         * move this tile to the wall (must be current tile)
         */
        if (this.type === 'current') {
            this.type = 'wall';
            this.tileColIndex = tileColIndex;
            
            this.tileRow = new TileRow();
            Make10.consoleLog('tileRow created, about to push to Make10.tileRows who has length= ' + Make10.tileRows.length);
            Make10.tileRows.push(this.tileRow);    
            
            Make10.consoleLog('currentTile moved to wallLayer');
            Make10.baseLayer.draw();
            Make10.wallLayer.draw();
            Make10.consoleLog('base and wallLayers redrawn');
            
            //TEMP for now always create a new TileRow
            this.transitionTo(x, y, null);
            Make10.consoleLog('tileRows after push length = ' + Make10.tileRows.length);
            this.tileRow.addTile(tileColIndex, this);
            this.group.moveTo(Make10.wallLayer);
//            this.group.setListening(true);
//            Make10.consoleLog('moveToWall, group.getListening() = ' + this.group.getListening());
//            var thiz = this;
//            this.group.on('click touch', function() {
//                Make10.consoleLog('moveToWall.group.on tile click touch value = ' + thiz.value + ', ' + thiz.type);
//                if (thiz.type === 'wall') {
//                    if (Make10.currentTile.value + thiz.value === Make10.makeValue) {
//
//                        Make10.valueMade(thiz);
//                        
//                    } else {
//                        
//                        Make10.valueNotMade(thiz);
//                    }
//                }
//            });
//            Make10.consoleLog('about to draw WallLayer');
//            Make10.wallLayer.draw();
//            
        }
  
    };
    this.init();
};

function TileRow(/*int*/ tileRowIndex) {
    this.tileRowIndex = tileRowIndex;
    this.tiles = [];
    this.group = new Kinetic.Group();
    
    this.init = function() {
        Make10.consoleLog('TileRow.init');
        for (var i = 0; i < Make10.makeValue; i++) {
            this.tiles[i] = false; //initialize to have all 'false' values
        }
    };
    
    this.addTile = function(/*int*/ index, /*Tile*/ tile) {
        Make10.consoleLog('TileRow.addTile');
        this.tiles[index] = tile;
        tile.tileRow = this;
        tile.tileColIndex = index;
        this.group.add(tile.group);
        Make10.consoleLog('TileRow.addTile end of addTile');
    };
    
    this.removeTile = function(/*int*/ index) {
        this.tiles[index] = false;
    };
    
    this.transitionUp = function() {
        this.tileRowIndex++;
        this.group.transitionTo({
            y: -TILE_HEIGHT * this.tileRowIndex,
            duration: 0.5
        });
    };
    
    this.init();
}

var Make10 = {
    debug: true,
    /* int - the number to add to */
    makeValue: 10,
    /* Kinetic.Stage - the stage */
    stage: null,
    /* Kinetic.Layer for wall */
    wallLayer: null,
    /* Kinetic.Layer for currentTile and nextTile */
    baseLayer: null,
    /* array of Kinetic.Group of Tile objects for the wall -- a Kinetic.Group of Tiles is each row*/
    tileRows: [],
    /* Tile to be played */
    currentTile: null,
    /* Tile on deck to be come the currentTile */
    nextTile: null,
    /* the interval variable for repeatedly adding wall rows*/
    addWallTimer: undefined,
    /* time in ms for the addWallTimer */
    addWallTime: 4000,
    /* map of file name to Image */
    images: {},
    /* int score */
    score: 0,
    
    init: function() {
        Make10.stage = new Kinetic.Stage({container: 'game', width: STAGE_WIDTH, height: STAGE_HEIGHT});
        /*
         * make the stage container the same size as the stage
         */
        $('#game').css('height', STAGE_HEIGHT + 'px').css('width', STAGE_WIDTH + 'px');
        $('#container').css('width', STAGE_WIDTH + 'px');
        //Make10.loadImages();
        Make10.initLayers();       
    },    
        
    loadImages: function() {
        Make10.consoleLog('loadImages');
        Make10.loadedImages = 0;
        for (var i = 1; i <= 9 ; i++) {
            var src = 'MJt' + i;
            var img = new Image();
            img.onload = function() {
                if (++Make10.loadedImages === 9) {
                    Make10.initLayers();
                }
            };
            img.src = src;
            Make10.images[src] = img;
        }
    },
       
    initLayers: function() {
        Make10.consoleLog('initLayers');
        /*
         * Create the layer for the tiles in the wall.  This will listen
         * because touching tiles in the wall is how to move.
         */
        Make10.wallLayer = new Kinetic.Layer({
            listening: true
        });
        Make10.stage.add(Make10.wallLayer);
        /*
         * Create the layer for the borders, current tile to play, the tile on deck
         * and the score
         */
        Make10.baseLayer = new Kinetic.Layer({
            listening: false
        });
        Make10.stage.add(Make10.baseLayer);
        /*
         * Add 2 wall rows
         */
        Make10.addWallRow();
        Make10.addWallRow();
        Make10.createNext();
        Make10.createCurrent();

        Make10.addWallTimer = setInterval(function() {
            Make10.addWallRow();            
        }, Make10.addWallTime);
    },

    genRandom: function() {
        /* 
         * random integer value between 1 and 9 inclusive
         */
        return Math.floor(Math.random() * (Make10.makeValue - 1)) + 1;
    },
    
    addWallRow: function() {
        Make10.consoleLog('addWallRow');
        /*
         * For every existing row of tiles in the wall, transition them up one row
         */
        for (var i = 0, len = Make10.tileRows.length; i < len; i++) {
            Make10.consoleLog('addWallRow, inside loop of existing tileRows i = ' + i + "tilerowGroup :");
            var tileRow = Make10.tileRows[i];
            tileRow.transitionUp();
            Make10.consoleLog('addWallRow, inside loop of existing tileRows after transition called ');
        }
        /*
         * Add row of tiles for the wall inserting into the beginning of the array
         */
        var y = STAGE_HEIGHT - TILE_HEIGHT;
        var tileRow = new TileRow(0);
        Make10.wallLayer.add(tileRow.group);
        
        for (var i = 0; i < Make10.makeValue; i++) {
            var val = Make10.genRandom();
            var x = i * TILE_WIDTH;
            var tile = new Tile(val, x, y, 'wall'); 
            tileRow.addTile(i, tile);
        }
        
        Make10.tileRows.unshift(tileRow);            
        Make10.consoleLog('tileRows after unshift length = ' + Make10.tileRows.length);
        Make10.wallLayer.draw();
        Make10.consoleLog('initWallLayer wallLayer drawn');
        
        /*
         * Cancel repeating timer if length is maxed
         */
        Make10.consoleLog('Make10.addWallTimer = ' + Make10.addWallTimer);
        if (Make10.tileRows.length > MAX_WALL_INDEX) {
            clearInterval(Make10.addWallTimer);
            alert('Game Over.  Your score: ' + Make10.score);
        }

    },
    
    createNext: function() {
        Make10.consoleLog('createNext');
        /*
         * To generate a value that must make a match with at
         * least one tile somewhere in the wall, list out all the values
         * in a single array then randomly generate an index then pull the value out
         * of the Tile at that index.
         */
        var possibles = [];
        
        for (var i = Make10.tileRows.length - 1; i >= 0; i--) {
            var tileRowGroup = Make10.tileRows[i];
            for (var j = 0; j < Make10.makeValue; j++) {
                if (tileRowGroup.tiles[j]) {
                    possibles.push(tileRowGroup.tiles[j].value);
                    Make10.consoleLog('createNext, possibles pushed ' + tileRowGroup.tiles[j].value);                    
                }
            }
        }
        var val;
        if (possibles.length > 0) {
            var randomIndex = Math.floor(Math.random() * (possibles.length - 1)) + 1;        
            val = Make10.makeValue - possibles[randomIndex];
        } else {
            val = Make10.genRandom();
        }
        
        /*
         * create a tile and place in upper left corner
         */
        Make10.nextTile = new Tile(val, 0, 0, 'next'); 
        Make10.baseLayer.add(Make10.nextTile.group);
        Make10.baseLayer.draw();

    },
    
    createCurrent: function() {
        Make10.consoleLog('createCurrent');
        /*
         * Take the next tile
         * and move it to the current position
         */
        Make10.currentTile = Make10.nextTile;       
        Make10.currentTile.type = 'current';
        Make10.currentTile.transitionTo(STAGE_WIDTH / 2 - TILE_WIDTH / 2, 0, false);
        Make10.createNext();
    },
    
    valueMade: function(/*Tile*/ wallTile) {
        Make10.consoleLog('valueMade: '+ Make10.currentTile.value + ' + ' + wallTile.value + ' = '+ Make10.makeValue + ' :)');
        /*
         * It's a match!
         * Remove and destroy wallTile
         * Remove the current tile from the baseLayer,
         * Add to score,
         * Create a new current tile
         */
        Make10.currentTile.transitionTo(wallTile.x, wallTile.y - TILE_HEIGHT * wallTile.tileRow.tileRowIndex, function() {
            wallTile.destroy();                    
            Make10.wallLayer.draw();
            
            Make10.currentTile.destroy();
            Make10.baseLayer.draw();
            
            Make10.score += 10;
            
            Make10.createCurrent();      
            
        });
    },
    
    valueNotMade: function(/*Tile*/ wallTile) {
        Make10.consoleLog('valueNotMade: NO MATCH! '+ Make10.currentTile.value + ' + ' + wallTile.value + ' != '+ Make10.makeValue);
        /*
         * It's not a match, so we must drop the tile on top of the one touched.
         * Or if there is an exposed side, then on top of the column on the exposed side.
         */
//        //TEMP for now just drop on top only
//        /*
//         * What row and column got touched?
//         */
//        var col = wallTile.tileColIndex;
//        Make10.consoleLog('col = ' + col);
//        Make10.currentTile.moveToWall(col, TILE_WIDTH * col, TILE_HEIGHT * (MAX_WALL_INDEX - wallTile.tileRow.tileRowIndex - 1));
        
        //FOR now just destroy it
        Make10.currentTile.destroy();
        Make10.baseLayer.draw();
        Make10.consoleLog('about to create another current');
        Make10.createCurrent();      
        Make10.consoleLog('created another current');

    },  
    
    about: function(show) {
        if (show) {
            $('#about').slideDown();
        } else {
            $('#about').slideUp();
        }
    },
    
    toggleAbout: function() {
        if ($('#about').is(':visible')) {
            Make10.about(false);
        } else {
            Make10.about(true);
        }
    },
    
    consoleLog: function(msg) {
        if (Make10.debug && console && console.log) {
            console.log(msg);
        }
    }

};

$(function() {
    $('html').click(function() {
        if ($('#about').is(':visible')) {
            $('#about').slideUp();
        }
    });

    $('html,body').animate({scrollTop: $('#title').offset().top}, 'fast');
    
    
    Make10.init();
});
