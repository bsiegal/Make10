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

//set in Make10.resize
var STAGE_WIDTH = 440;
var STAGE_HEIGHT = 600;
var PADDING = null;
var CENTERX = null;
var CENTERY = null;
var THOUGHT_WIDTH = null;
var THOUGHT_HEIGHT = null;
var PIGGY_WIDTH = null;
var PIGGY_HEIGHT = null;
var COIN_PADDING = null;

function Tile(/*int*/ value, /*int*/ x, /*int*/ y, /*String*/ tileType) {
    this.value = value;
    this.x = x;
    this.y = y;
    this.type = tileType; //Valid values 'current', 'next', 'wall'
    
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
            x: this.x + TILE_WIDTH / 2,
            y: this.y + TILE_HEIGHT / 2,
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
            Make10.consoleLog('tile mouseout touchend value = ' + thiz.value + ', ' + thiz.type);
            if (thiz.type === 'wall') {
                if (Make10.currentTile.value + thiz.value === Make10.makeValue) {
                    Make10.consoleLog('made '+ Make10.currentTile.value + ' + ' + thiz.value + ' = '+ Make10.makeValue + '!');
                    /*
                     * Remove thiz.group from the wall group, 
                     * Remove the current tile from the waitingLayer
                     * Create a new current tile
                     */
                    thiz.group.remove();
                    Make10.wallLayer.draw();
                    
                    Make10.currentTile.group.remove();
                    Make10.waitingLayer.draw();
                    
                    Make10.createCurrent();  
                }
            }
        });

        this.group = group;
    };    
    
    this.setPosition = function(/*int*/ x, /*int*/ y) {
        this.x = x;
        this.y = y;
        this.group.attrs.x = x;
        this.group.attrs.y = y;
    };

    this.transitionTo = function(/*int*/ x, /*int*/ y) {
        var thiz = this;
        this.group.transitionTo({
            x: x,
            y: y,
            duration: 1,
            easing: 'ease-out',
            callback: function() {
                Make10.consoleLog('Tile with value ' + thiz.value + ': x from ' + thiz.x + ' to ' + x + ', y from ' + thiz.y + ' to ' + y);
            }
          });
        this.x = x;
        this.y = y;

    };
    
    this.init();
};


var Make10 = {
    debug: true,
    /* int - the number to add to */
    makeValue: 10,
    /* Kinetic.Stage - the stage */
    stage: null,
    /* Kinetic.Layer for wall */
    wallLayer: null,
    /* Kinetic.Layer for currentTile and nextTile */
    waitingLayer: null,
    /* array of Kinetic.Group of Tile objects for the wall -- a Kinetic.Group of Tiles is each row*/
    tileRows: [],
    /* Tile to be played */
    currentTile: null,
    /* Tile on deck to be come the currentTile */
    nextTile: null,
    /* map of file name to Image */
    images: {},
    
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
         * Create the layer for the current tile to play and the tile on deck.
         */
        Make10.waitingLayer = new Kinetic.Layer({
            listening: false
        });
        Make10.stage.add(Make10.waitingLayer);
        /*
         * Add 2 wall rows
         */
        Make10.addWallRow();
        Make10.addWallRow();
        Make10.createNext();
        Make10.createCurrent();


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
            var tileRowGroup = Make10.tileRows[i];
            Make10.consoleLog(tileRowGroup);
            tileRowGroup.transitionTo({
                y: -TILE_HEIGHT,
                duration: 1,
                callback: function() {
                    Make10.consoleLog('transitioned row done');
                }
            });
            Make10.consoleLog('addWallRow, inside loop of existing tileRows after transition called ');
        }
        /*
         * Add row of tiles for the wall inserting into the beginning of the array
         */
        var y = STAGE_HEIGHT - TILE_HEIGHT;
        var tileGroup = new Kinetic.Group();
        Make10.wallLayer.add(tileGroup);
        
        for (var i = 0; i < Make10.makeValue; i++) {
            var val = Make10.genRandom();
            var x = i * TILE_WIDTH;
            var tile = new Tile(val, x, y, 'wall'); 
            tileGroup.add(tile.group);
        }
        
        Make10.tileRows.unshift(tileGroup);            

        Make10.wallLayer.draw();
        Make10.consoleLog('initWallLayer wallLayer drawn');

    },
    
    createNext: function() {
        Make10.consoleLog('createNext');
        /*
         * create a tile and place in upper left corner
         */
        var val = Make10.genRandom();
        Make10.nextTile = new Tile(val, 0, 0, 'next'); 
        Make10.waitingLayer.add(Make10.nextTile.group);
        Make10.waitingLayer.draw();

    },
    
    createCurrent: function() {
        Make10.consoleLog('createCurrent');
        /*
         * Take the next tile
         * and move it to the current position
         */
        Make10.currentTile = Make10.nextTile;       
        Make10.currentTile.type = 'current';
        Make10.currentTile.transitionTo(STAGE_WIDTH / 2 - TILE_WIDTH / 2, 0);
        Make10.createNext();
    },
    
    whichPiggy: function(/*Coin*/ coin) {
        /*
         * Test all the piggies.  If it is close to the top/middle of one
         * return that one.        
         */
        var a = coin.coin.getAbsolutePosition();

        for (var i = 0; i < Make10.piggies.length; i++) {
            Make10.consoleLog('a.x = ' + a.x + ', a.y = ' + a.y);
            var o = Make10.piggies[i].slotPosition;
            Make10.consoleLog('i = ' + i + ': o.x = ' + o.x + ', o.y = ' + o.y);
            if (a.x > o.x - SLOT_TOLERANCE_X && a.x < o.x + SLOT_TOLERANCE_X && a.y > o.y - SLOT_TOLERANCE_Y) {                
                return Make10.piggies[i];
            }
        }
        return null;
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
