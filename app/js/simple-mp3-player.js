/**
 * SimpleMp3Player - A mp3Player implementation using  the SoundManager API
 * 
 * @author hal9087
 * @copyright hal9087 
 * @license MIT
 * 
 * @param elem
 * @param opts
 */
function SimpleMp3Player(elem , opts) {
  
  //some private variables,... ok a lot! :-)
  var self = this;
  var _mySound = null;
  var _namespace = "simple-mp3-player";
  
  var _defaultOpts = {
      selectors : {
          btnPlayPause     : '.' + _namespace + '-play-pause',
          btnStop          : '.' + _namespace + '-stop',
          mousePointerArea : '.' + _namespace + '-mouse-pointer-area',
          mousePointer     : '.' + _namespace + '-mouse-pointer',
          barWrap          : '.' + _namespace + '-play-loading-bar-wrap',
          playBar          : '.' + _namespace + '-play-bar',
          loadBar          : '.' + _namespace + '-loading-bar'
       },
       autoload : false,
       autoplay : false,

       playText  : "PLAY",
       pauseText : "PAUSE",
       stopText  : "STOP",
       playBarAnimationSpeed : 300,
       loadBarAnimationSpeed : 600
  };
  
  var _options = $.extend(_defaultOpts , opts);
 
  var _states  = {
     play  : _namespace + '-play-state',
     pause : _namespace + '-paused-state',
     stop  : _namespace + '-stopped-state'
  };
  
  // jQuery Elements
  var _$simpleMp3Player   = $(elem);
  var _$btnPlayPause      = _$simpleMp3Player.find(_options.selectors.btnPlayPause);
  var _$btnStop           = _$simpleMp3Player.find(_options.selectors.btnStop);
  var _$mousePointerArea  = _$simpleMp3Player.find(_options.selectors.mousePointerArea); 
  var _$barWrap           = _$simpleMp3Player.find(_options.selectors.barWrap);
  var _$playBar           = _$barWrap.find(_options.selectors.playBar);
  var _$loadBar           = _$barWrap.find(_options.selectors.loadBar);
  var _$mousePointer      = _$barWrap.find(_options.selectors.mousePointer);
  
  var _mousePointerOriginalWidth = _$mousePointer.width();
 
  //path to mp3 file
  var _mp3Url = _$btnPlayPause.data("mp3");
  
  /**
   * Initialize, attach sound events and user interaction events callbacks
   * @returns void
   */
  self.initialize = function () {
      //default interface state
      self.changeInterfaceState('stop');
      self.isLoaded = false;
      //creates sound, hooks callbacks
      _mySound = soundManager.createSound({
        id           : self.generateUniqueID(),
        url          : _mp3Url,
        autoLoad     : _options.autoload,
        autoPlay     : _options.autoplay,
        whileloading : self.whileLoading,
        whileplaying : self.whilePlaying,
        onplay       : self.onPlay,
        onpause      : self.onPause,
        onresume     : self.onResume,
        onstop       : self.onStop,
        onfinish     : self.onFinish
      });

      //hooks EVENTs
      _$btnPlayPause.click(function(e) { 
          _mySound.togglePause(); 
      });
      _$mousePointerArea.click(self.onChangePosition);
      _$mousePointerArea.hover(self.onMouseOverTheBar , self.onMouseOutTheBar)
      _$mousePointerArea.mousemove(self.onMouseMoveOverTheBar);
      _$btnStop.click(function() { 
        _mySound.stop();
      });
  };
  
  /***
   * 
   * 
   * EVENTS callbacks
   * 
   * 
   * * * * * * * * * * * * */
  
  /**
   * @returns void
   */
  self.onPlay = function () {
    _$btnPlayPause
        .text(_options.pauseText)
        .attr("title" , _options.pauseText);
    self.changeInterfaceState('play');
  };
  
  /**
   * @returns void
   */
  self.onPause = function() {
    _$btnPlayPause
        .text(_options.playText)
        .attr("title" , _options.playText);
    self.changeInterfaceState('pause');
  };
  
  /**
   * @returns void
   */
  self.onResume = function () {
     self.onPlay();
  };
  
  /**
   * @returns void
   */
  self.onStop = function () {
    _$btnPlayPause
        .text(_options.playText)
        .attr("title" , _options.playText);
    
    _$playBar.animate({width: 0}, _options.playBarAnimationSpeed);
    
    self.changeInterfaceState('stop');
  };
  
  /**
   * @returns void
   */
  self.onFinish = function () {
    self.onStop();
  };
  
  /**
   * @returns void
   */
  self.whilePlaying = function () {
    var soundObj = this;
    var curWidth = (_$barWrap.innerWidth() / soundObj.duration) * soundObj.position;
    _$playBar.width(curWidth);
  };
  
  /**
   * @returns void
   */
  self.whileLoading = function() {
    var soundObj = this;
    var curWidth = (_$barWrap.innerWidth() / soundObj.bytesTotal) * soundObj.bytesLoaded;
    _$loadBar.animate({width: curWidth + "px"}, _options.loadBarAnimationSpeed);

    if(soundObj.bytesTotal == soundObj.bytesLoaded) {
       self.isLoaded = true;
    }
  };
  
  /**
   * @param e - event
   * @returns void
   */
  self.onChangePosition = function(e) {
      var offset = _$barWrap.offset();
      var relX = e.pageX - offset.left;
      var toPosition = (_mySound.duration / _$barWrap.innerWidth()) * relX;
    
      //animation
      _$mousePointerArea.unbind("mousemove");
      _$mousePointer
        .css("left", 0)
        .animate({ width: relX + "px"}, 100)
        .animate({ width: 0,}, 100, function() {
          _$mousePointerArea.bind("mousemove",self.onMouseMoveOverTheBar);
        });
     
     if(_mySound.playState === 0 ){
       _mySound.play({position : toPosition});
     }else{
       _mySound.setPosition(toPosition);
     }
  };
  
  /**
   * @param e - event
   * @return void
   */
  self.onMouseMoveOverTheBar = function (e) {
    var offset = _$barWrap.offset();
    var relX = e.pageX - offset.left;
    _$mousePointer
        .show()
        .css({
            "left" : relX + "px", 
            "width"  : _mousePointerOriginalWidth + "px"
        });
  };
  
  /**
   * @return void
   */
  self.onMouseOutTheBar = function() {
    _$mousePointer.hide();
  };
  
  /**
   * @returns void
   */
  self.onMouseOverTheBar = function() {
    _$mousePointer.show();
  };
  
  
  /**
   * 
   * 
   * UTILITY methods
   * 
   * 
   * * * * * * * * * * * * * * * */
  
  /**
   * Change the visual interface state by add/remove css class
   * @param state
   * @returns {SimpleMp3Player}
   */
  self.changeInterfaceState = function(state) {
      $.each(_states , function (key , thisState) {
         _$simpleMp3Player.removeClass(thisState);
      });
      _$simpleMp3Player.addClass(_states[state]);
      return self;
  };
  
  /**
   * Generate a unique id
   * @returns {String}
   */
  self.generateUniqueID = function() {
    var date = new Date();
    var timestamp = [
      date.getYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    ].join("");

    var id = _namespace + timestamp;
    return id;
  };

  self.initialize();

}//function SimpleMp3Player





