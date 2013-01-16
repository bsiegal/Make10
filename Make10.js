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

var Constants = {
    TILE_WIDTH: 44,
    TILE_HEIGHT: 60,
    MAX_COLS: 8,
    MAX_ROWS: 8,
    STAGE_WIDTH: 44 * 8/*Constants.TILE_WIDTH * Constants.MAX_COLS*/,
    STAGE_HEIGHT: 60 * 8/*Constants.TILE_HEIGHT * Constants.MAX_ROWS*/
};

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
            width: Constants.TILE_WIDTH,
            height: Constants.TILE_HEIGHT,
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
            x: this.x + Constants.TILE_WIDTH / 2 - 5,
            y: this.y + Constants.TILE_HEIGHT / 2 - 5,
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
        group.on('click tap', function() {
            Make10.consoleLog('tile click tap value = ' + thiz.value + ', ' + thiz.type);
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
    
//    this.moveToWall = function(/*int*/ tileColIndex, /*int*/ x, /*int*/ y) {
//        /*
//         * move this tile to the wall (must be current tile)
//         */
//        if (this.type === 'current') {
//            this.type = 'wall';
//            this.tileColIndex = tileColIndex;
//            
//            this.tileRow = new TileRow();
//            Make10.consoleLog('tileRow created, about to push to Make10.tileRows who has length= ' + Make10.tileRows.length);
//            Make10.tileRows.push(this.tileRow);    
//            
//            Make10.consoleLog('currentTile moved to wallLayer');
//            Make10.baseLayer.draw();
//            Make10.wallLayer.draw();
//            Make10.consoleLog('base and wallLayers redrawn');
//            
//            //TEMP for now always create a new TileRow
//            this.transitionTo(x, y, null);
//            Make10.consoleLog('tileRows after push length = ' + Make10.tileRows.length);
//            this.tileRow.addTile(tileColIndex, this);
//            this.group.moveTo(Make10.wallLayer);
////            this.group.setListening(true);
////            Make10.consoleLog('moveToWall, group.getListening() = ' + this.group.getListening());
////            var thiz = this;
////            this.group.on('click touch', function() {
////                Make10.consoleLog('moveToWall.group.on tile click touch value = ' + thiz.value + ', ' + thiz.type);
////                if (thiz.type === 'wall') {
////                    if (Make10.currentTile.value + thiz.value === Make10.makeValue) {
////
////                        Make10.valueMade(thiz);
////                        
////                    } else {
////                        
////                        Make10.valueNotMade(thiz);
////                    }
////                }
////            });
////            Make10.consoleLog('about to draw WallLayer');
////            Make10.wallLayer.draw();
////            
//        }
//  
//    };
    this.init();
};

function TileRow(/*int*/ tileRowIndex) {
    this.tileRowIndex = tileRowIndex;
    this.tiles = [];
    this.group = new Kinetic.Group();
    
    this.init = function() {
        Make10.consoleLog('TileRow.init');
        for (var i = 0; i < Constants.MAX_COLS; i++) {
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
            y: -Constants.TILE_HEIGHT * this.tileRowIndex,
            duration: 0.5
        });
    };
    
    this.isEmpty = function() {
        Make10.consoleLog('TileRow isEmpty');
        for (var i = 0; i < Constants.MAX_COLS; i++) {
            if (this.tiles[i]) {
                Make10.consoleLog('TileRow isEmpty no because of i = ' + i + ' has Tile:' + this.tiles[i]);
                return false;
            }
        }
        return true;
    };
    
    this.init();
}

var Make10 = {
    debug: false,
    /* int - the number to add to */
    makeValue: undefined,
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
    addWallTime: 12000,
    /* map of file name to Image */
    images: {},
    /* int score */
    score: 0,
    /* Kinetic.Group in the baseLayer to show when you earn points */
    plus10: null,
    /* Kinetic.Group in the baseLayer to show when you don't earn points */
    plus0: null,
    
    init: function() {
        if (localStorage.MAKE10_MAKE_VALUE) {
            Make10.makeValue = parseInt(localStorage.MAKE10_MAKE_VALUE);
            $('.makeValue').html(localStorage.MAKE10_MAKE_VALUE);
            $('#makeValue').val(localStorage.MAKE10_MAKE_VALUE);
        } else {
            Make10.makeValue = 10;
        }
        Make10.stage = new Kinetic.Stage({container: 'game', width: Constants.STAGE_WIDTH, height: Constants.STAGE_HEIGHT});
        /*
         * make the stage container the same size as the stage
         */
        $('#game').css('height', Constants.STAGE_HEIGHT + 'px').css('width', Constants.STAGE_WIDTH + 'px');
        $('#container').css('width', Constants.STAGE_WIDTH + 'px');
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
        
        Make10.createPoints();
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
        var y = Constants.STAGE_HEIGHT - Constants.TILE_HEIGHT;
        var tileRow = new TileRow(0);
        Make10.wallLayer.add(tileRow.group);
        
        for (var i = 0; i < Constants.MAX_COLS; i++) {
            var val = Make10.genRandom();
            var x = i * Constants.TILE_WIDTH;
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
        if (Make10.tileRows.length > Constants.MAX_ROWS - 1) {
            Make10.endGame();
        }

    },
    
    createNext: function() {
        Make10.consoleLog('createNext');
        /*
         * To generate a value that must make a match with at
         * least one tile somewhere in the wall, list out all the values
         * in a single array then randomly generate an index then pull the value out
         * of the Tile at that index. <-- That's actually a little too hard to make a row
         * disappear, so let's stop after the equivalent of the first 2 rows
         */
        var possibles = [];
        
        for (var i = Make10.tileRows.length - 1; i >= 0; i--) {
            var tileRowGroup = Make10.tileRows[i];
            for (var j = 0; j < Constants.MAX_COLS; j++) {
                if (tileRowGroup.tiles[j]) {
                    possibles.push(tileRowGroup.tiles[j].value);
                    Make10.consoleLog('createNext, possibles pushed ' + tileRowGroup.tiles[j].value);     
                    if (possibles.length > Constants.MAX_COLS * 2) {
                        break;
                    }
                }
            }
            if (possibles.length > Constants.MAX_COLS * 2) {
                break;
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
        Make10.currentTile.transitionTo(Constants.STAGE_WIDTH / 2 - Constants.TILE_WIDTH / 2, 0, false);
        Make10.createNext();
    },
    
    createPoints: function() {
        var p10 = new Kinetic.Group();
        var star = new Kinetic.Star({
            x: Constants.STAGE_WIDTH - 20,
            y: 20,
            numPoints: 9,
            innerRadius: 12,
            outerRadius: 20,
            fill: 'yellow',
            stroke: 'black',
            strokeWidth: 1
          });
        p10.add(star);
        var p10Txt = new Kinetic.Text({
            x: Constants.STAGE_WIDTH - 30,
            y: 15,
            text: '+10',
            fontSize: 12,
            fontFamily: 'Calibri',
            fill: 'black'
          });
        p10.add(p10Txt);
        p10.setVisible(false);
        Make10.baseLayer.add(p10);
        Make10.plus10 = p10;
        
        var p0 = new Kinetic.Group();
        var oct = new Kinetic.RegularPolygon({
            x: Constants.STAGE_WIDTH - 20,
            y: 20,
            sides: 8,
            radius: 20,
            fill: 'red',
            stroke: 'black',
            strokeWidth: 1
          });
        p0.add(oct);
        var p0Txt = new Kinetic.Text({
            x: Constants.STAGE_WIDTH - 30,
            y: 15,
            text: '+ 0',
            fontSize: 12,
            fontFamily: 'Calibri',
            fill: 'black'
          });
        p0.add(p0Txt);
        p0.setVisible(false);
        Make10.baseLayer.add(p0);
        Make10.plus0 = p0;
        Make10.baseLayer.draw();
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
        Make10.currentTile.transitionTo(wallTile.x, wallTile.y - Constants.TILE_HEIGHT * wallTile.tileRow.tileRowIndex, function() {
            var tileRow = wallTile.tileRow;
            wallTile.destroy();                    
            Make10.wallLayer.draw();
            Make10.consoleLog('valueMade, tileRow isEmpty? ' + tileRow.isEmpty());
            if (tileRow.isEmpty()) {
                Make10.consoleLog('valueMade, tileRow is now empty');
                Make10.tileRows.splice(tileRow.tileRowIndex, 1);
                Make10.consoleLog('valueMade, tileRows was spliced so its length is now ' + Make10.tileRows.length);
            }
            
            Make10.currentTile.destroy();
            
            Make10.showPlus(10);            
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
//        Make10.currentTile.moveToWall(col, Constants.TILE_WIDTH * col, Constants.TILE_HEIGHT * (Constants.MAX_ROWS - 1 - wallTile.tileRow.tileRowIndex - 1));
        
        //FOR now just destroy it
        Make10.showPlus(0);
        Make10.currentTile.destroy();
        Make10.baseLayer.draw();
        Make10.consoleLog('about to create another current');
        Make10.createCurrent();      
        Make10.consoleLog('created another current');

    },  
    
    showPlus: function(/*int either 0 or 10*/ points) {
        if (points === 10) {
            Make10.plus10.setVisible(true);
            Make10.baseLayer.draw();
            setTimeout(function() {
                Make10.plus10.setVisible(false);
                Make10.baseLayer.draw();
            }, 300);
        } else if (points === 0) {
            Make10.plus0.setVisible(true);
            Make10.baseLayer.draw();
            setTimeout(function() {
                Make10.plus0.setVisible(false);
                Make10.baseLayer.draw();
            }, 300);
        }
    },
    
    endGame: function() {
        clearInterval(Make10.addWallTimer);
        var html = 'Game Over';
        if (localStorage.MAKE10_HI_SCORE) {
            var localHi = parseInt(localStorage.MAKE10_HI_SCORE);
            if (Make10.score > localHi) {
                html += '<br/><br/>Congratulations!<br/><br/>New high score: ' + Make10.score;
                localStorage.MAKE10_HI_SCORE = Make10.score;
            } else {
                html += '<br/><br/>Your score: ' + Make10.score + '<br/><br/>High score:' + localHi;
            }
        } else {
            html += '<br/><br/>Congratulations!<br/><br/>New high score: ' + Make10.score;
            localStorage.MAKE10_HI_SCORE = Make10.score;
        }
        $('#score').html(html);
        $('#gameover').fadeIn(1000);    
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

    $('#play').click(function() {
        Make10.consoleLog('play clicked');
        Make10.addWallTimer = setInterval(function() {
            Make10.addWallRow();            
        }, Make10.addWallTime);
        
        $('#start').hide();
    });

    $('#score').click(function() {
        document.location.reload(true);
    });
    
    var makeValue = $('#makeValue');
    makeValue.change(function() {
        var val = makeValue.val();
        localStorage.MAKE10_MAKE_VALUE = val; 
        $('.makeValue').html(val);
        document.location.reload(true);
    });    
});
