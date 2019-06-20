$(function(){
  "use-strict";


  /*
    Active description based on active floor image
  */
  // Left side - Desktops
  var $building               = $("#one65building"),
      $buildingPieces         = $building.find(".building-pieces");
      $buildingFloorsGlow     = $building.find(".ctn-part"),
      $buildingFloorsGlowImgs = $buildingFloorsGlow.find("img");

  // Right side - Desktops
  var $textBlock    = $("#text-block"),
      $aboutFloors  = $textBlock.find("#about-floors"),
      floorNrs      = $aboutFloors.children().length - 1,
      $prevFloorBtn = $("#prev-floor"),
      $nextFloorBtn = $("#next-floor");

  var mobileStylesStartBelowWidth = 768;

  function adjustTextContentHeight() {
    if( window.innerWidth < mobileStylesStartBelowWidth ) {
        $textBlock.attr("style") && $textBlock.removeAttr("style");
    } else {
      var buildingHeight = $buildingPieces.first().height();

      $textBlock.css({
        "height" : buildingHeight + "px",
        "transform" : "none"
      });
    }
  }

  // Didn't work with: $(document).on("load resize", adjustTextContentHeight);
  $(window).on("load", adjustTextContentHeight);
  $(window).on("resize", adjustTextContentHeight);


  // Direct children of the elements will be affected
  var $activeContainers = $buildingPieces.add($aboutFloors);

  var activeFloorNr = (function() {
    var $isDefaultFloor = $buildingPieces.find(".glow .active");
    if( $isDefaultFloor.length  ) {
      return $isDefaultFloor.data("fl");
    } else {
      // Default floor set from Javascript if one is not set inside the HTML(#one65building .building-pieces .glow)
      return 3
    }
  })();
  switchActiveFloor(activeFloorNr);


  function nextFloor() {

      if(activeFloorNr === 0) {
        activeFloorNr = 3;
      } else {
        activeFloorNr--;
      }

      switchActiveFloor(activeFloorNr);
  }

  function prevFloor() {

      if(activeFloorNr === 3 ){
        activeFloorNr = 0;
      } else{
        activeFloorNr++;
      }

      switchActiveFloor(activeFloorNr);
  }

  $prevFloorBtn.on("click", prevFloor);
  $nextFloorBtn.on("click", nextFloor);


  $buildingFloorsGlow.on("mouseenter focus", function(e) {
    currentFloorNr = $(this).data("fl");
    switchActiveFloor(currentFloorNr);
  });



  var fadingRunning;
  function alreadyActive(floorNr) {
    // return $buildingPieces.find("[data-fl=" + floorNr + "]").hasClass("active");
    // return $buildingPieces.find("[data-fl=" + floorNr + "]").hasClass("active");
    return floorNr == activeFloorNr;
  }

  function switchActiveFloor(floorNr) {
    var activeFloorSelector    = "[data-fl='" + activeFloorNr + "']",
        newActiveFloorSelector = "[data-fl='" + floorNr + "']";

    debugger;
    console.log("switchActiveFloor(" + floorNr + ")");

    if( alreadyActive(floorNr) ) {
      return;
    }

    if( fadingRunning ) {
      console.log("fadingRunning");
      return;
      // TODO need to ad logic for prevention of duplicate .active classes, or use bettew approach without .class, only jQuery animation
      $buildingPieces
        .find("[data-fl]")
        // .removeClass("active")
        .stop(true, true);
      // $buildingPieces
      //   .find("[data-fl=" + floorNr + "]")
      //   .addClass("active");
    }

    if( fadingRunning ) {
      // TODO need to ad logic for prevention of duplicate .active classes, or use bettew approach without .class, only jQuery animation
      // {
        $buildingPieces
          .find("[data-fl]")
          .stop(true, true);
        // fadingRunning = 0;
      // }
    }

    // ? return
    //

    fadingRunning = 1;


    // PROBLEM: Two $aboutFloors.find("[data-fl]") can have class ".active", however, this is only used to mark the active element in JS
    // Can use activeFloorNr for this!
    // ? Fast nav - remember last clicked floor image, if true, call switchFloor with it.
    // ? update activeFloorNr inside $aboutFloors? when?
    // .active is used to start the fadeOut process


    // About floors - logo and text
    $aboutFloors.find(activeFloorSelector)
      .fadeOut({
        start : function() {
          console.log("onFloor_FadeOut_START");
          // Building pieces
          $buildingPieces
            .find(".active")
            .removeClass("active");
          $buildingPieces
            .find(newActiveFloorSelector)
            .addClass("active");

          // About floors
          // $(this)
          //   .removeClass("active");
        },
        // how much time(milliseconds) it takes a block to fade out
        duration : 500,
        complete : onFloorFadeOutCompleted
      });


    function onFloorFadeOutCompleted() {
      console.log("onFloorFadeOutCompleted");
      // $aboutFloors
      //   .find(newActiveFloorSelector)
      //   .addClass("active");
      // debugger;
      $aboutFloors
        .find(newActiveFloorSelector)
        // What if the animation is canceled during this phase?
        // Need to have a backup - restore, based on current progress and then rerun with the new request.
        .fadeIn({
          start : function() {
            console.log("onFloor_FadeIn_START");
            activeFloorNr = floorNr;
          },
          duration : 1000,
          complete : onFloorFadeInCompleted
        });
    };

    function onFloorFadeInCompleted() {
      console.log("onFloorFadeInCompleted");
      // debugger;
      fadingRunning = false;
    };

  }


  /*
    Mobiles
  */
  $buildingFloorsGlowImgs.on("click", function() {
    $("html, body")
      // Show visible floor(clicked)
      .delay(500)
      .animate(
        {
          scrollTop: $textBlock.offset().top
        }, 1000);
  });



  /*
    Accesibility
  */
  $(document).on("keydown", function(e) {
    // TODO: Simplification

    var key;
    // e is a jQuery event
    if( e.key === " " ) {
      key = e.originalEvent.code;
    } else {
      key = e.key;
    }

    /*
    If a floor image is "focused" and
      - "ArrowRight" key is pressed
      - "Enter" key is pressed
        => "focus" the ".active" description(text block - right)
    */
    if( key === "ArrowRight" || key === "Enter" ) {
      if( $buildingPieces.find(".active").is(":focus") ) {
        $aboutFloors.find(".active").focus();
      }
    }

    /*
    If a floor description(text block - right) is "focused" and
      - "ArrowLeft" key is pressed
      - "Escape" key is pressed
        => "focus" the ".active" floor image
    */
    if( key === "ArrowLeft" || ( key === "Escape" || key === "Esc" ) ) {
      if( $aboutFloors.find(".active").is(":focus") ) {
        $buildingPieces.find(".active").focus();
      }
    }

  });


});



  /*
    Navigation
  */
  $(function() {
  	// might strict mode: https://www.w3schools.com/js/js_strict.asp
  	// "use-strict";


  	var $bntOpenNav = $("#btn-open-nav"),
  			$navOverlay = $("#nav-overlay"),
  			$nav   			= $navOverlay.find("#nav"),
  			$navLinks   = $nav.find(".nav-link"),
  			$btnCloseNav = $("#btn-close-nav");

  	var transEndEventNames = {
  				'WebkitTransition': 'webkitTransitionEnd',
  				'MozTransition': 'transitionend',
  				'OTransition': 'oTransitionEnd',
  				'msTransition': 'MSTransitionEnd',
  				'transition': 'transitionend'
  			},
  			transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
  			// support = { csstransitions : Modernizr.csstransitions },
  			cssTransitionsSupported = transEndEventName;



  	function hideOverlay() {
  		$navOverlay.removeClass("open");
  	}

  	var transitionEndEventAttached;
  	function attachTransitionEndEvent() {
  		// Call animation of menu elements after the $navOverlay is fully visible
  		$navOverlay.on(transEndEventName, function() {
  			if( event.target.id === "nav-overlay" && event.propertyName === "opacity" ) {

  				// Overlay shown
  				if( $(event.target).hasClass("open") ) {
  					showNavElements();
  					// debugger;
  					// $(".btn_close.js-menuCloseBtn").trigger("focus");
  				}

  			}
  		});
  		transitionEndEventAttached = 1;
  	}

  	function toggleOverlay() {

  		if( $navOverlay.hasClass("open") ) {
  			/*
  				Close
  			*/

  			// Before hiding the overlay, start the hiding animation of nav element
  			// null is the time, default will be used in this case
  			// hideOverlay() is the callback
  			hideNavElements(null, hideOverlay);
  		}
  		else {
  			/*
  				Open
  			*/
  			if( !transitionEndEventAttached && cssTransitionsSupported ) {
  				attachTransitionEndEvent();
  			}

  			$navOverlay.addClass("open");
  			if( !cssTransitionsSupported ) {
  				showNavElements();
  			}
  		}

  	}

  	// Open Close $navOverlay
  	// Both elements call the same function
  	// Open and Close buttons
  	$bntOpenNav.add($btnCloseNav)
  		.on("click", toggleOverlay)


  	// Close $navOverlay on "Escape" key
  	$(window).on("keyup", function(e) {

  		if( ( e.key === "Escape" || e.key === "Esc") && $navOverlay.hasClass("open") ) {
  			// console.log("Escape key - keyup");
  			toggleOverlay();
  		}

  	});

  	// Close $navOverlay if clicked area is not content(links, close button)
  	$navOverlay.on("click", function() {
  		if( event.target.id === "nav") {
  			toggleOverlay();
  		}
  	});



    var totalNavElements   = $navLinks.length,
        visibleNavElements = 0,
        visibilityInterval,
        hidingInterval;

  	function clearIntervals(intervalsArray) {
  		$.each(intervalsArray, function(index, interval) {
  			clearInterval(interval);
  		});
  	}

    function showNavElements(beforeNextFunctionStarts) {

  		// Show navigation elements without animation
  		if( !cssTransitionsSupported ) {
  			$navLinks.addClass("visible");
  			return;
  		}

  		// Ensure that intervals are not running(rapid clicking on open/close nav )
  		clearIntervals([hidingInterval, visibilityInterval]);
  		// How much time it takes untill the next nav link STARTS becoming visible(speed of visibility is added through CSS: #nav li a)
  		// Parameter sets the time in milliseconds
  		// Default time is 150
      beforeNextFunctionStarts = beforeNextFunctionStarts || 150; // milliseconds

      visibilityInterval = setInterval(function () {
        // debugger;

        if( totalNavElements === visibleNavElements ) {
          clearInterval(visibilityInterval);
          return;
        }

        // $navLinks.eq(visibleNavElements).slideDown(200);
        $navLinks.eq(visibleNavElements).addClass("visible");
        visibleNavElements++;

      }, beforeNextFunctionStarts);
    }

    function hideNavElements(beforeNextFunctionStarts, callback) {

  		// Hide navigation elements without animation
  		if( !cssTransitionsSupported ) {
  			$navLinks.remove("visible");
  			callback();
  			return;
  		}

  		// Ensure that intervals are not running(rapid clicking on open/close nav )
  		clearIntervals([hidingInterval, visibilityInterval]);
  		// How much time it takes untill the next nav link STARTS becoming visible(speed of visibility is added through CSS: #nav li a)
  		// Parameter sets the time in milliseconds
  		// Default time is 150
      beforeNextFunctionStarts = beforeNextFunctionStarts || 150; // milliseconds

      hidingInterval = setInterval(function () {
        // debugger;

        if( visibleNavElements === 0 ) {
          clearInterval(hidingInterval);
  				callback();
          return;
        }

        $navLinks.eq(visibleNavElements - 1).removeClass("visible");
        visibleNavElements--;

      }, beforeNextFunctionStarts);
    }

  });

  //
  // /*
  //   Development purpose
  //   Development purpose
  //   TODO - Remove
  // */
  // $(document).on("keydown", function(e) {
  //   // inspired from: http://stackoverflow.com/questions/16006583/capturing-ctrlz-key-combination-in-javascript#answer-16006607
  //   //
  //   // if ( e.key === "ArrowRight" ) {
  //   //   e.preventDefault();
  //   //   nextFloor();
  //   // }
  //   // if ( e.key === "ArrowLeft" ) {
  //   //   e.preventDefault();
  //   //   prevFloor();
  //   // }
  //   if ( e.originalEvent.code == "Space") {
  //     stopAboutFloorsAnimation("Ctrl+shift+Space");
  //   }
  // });
  //
  // function stopAboutFloorsAnimation(){
  //   console.log("called - stopAboutFloorsAnimation()");
  //   $("#about-floors").find("[data-fl]").stop(true, true);
  // }
  //
  // /*
  //   END - Development purpose
  //   END - Development purpose
  //   TODO - Remove
  // */




/*
  Important: Plugin uses MutationObserver IE10+ support
*/

/*!
	Modaal - accessible modals - v0.4.4
	by Humaan, for all humans.
	http://humaan.com
 */

!function(a){function t(a){var t={},o=!1;a.attr("data-modaal-type")&&(o=!0,t.type=a.attr("data-modaal-type")),a.attr("data-modaal-content-source")&&(o=!0,t.content_source=a.attr("data-modaal-content-source")),a.attr("data-modaal-animation")&&(o=!0,t.animation=a.attr("data-modaal-animation")),a.attr("data-modaal-animation-speed")&&(o=!0,t.animation_speed=a.attr("data-modaal-animation-speed")),a.attr("data-modaal-after-callback-delay")&&(o=!0,t.after_callback_delay=a.attr("data-modaal-after-callback-delay")),a.attr("data-modaal-is-locked")&&(o=!0,t.is_locked="true"===a.attr("data-modaal-is-locked")),a.attr("data-modaal-hide-close")&&(o=!0,t.hide_close="true"===a.attr("data-modaal-hide-close")),a.attr("data-modaal-background")&&(o=!0,t.background=a.attr("data-modaal-background")),a.attr("data-modaal-overlay-opacity")&&(o=!0,t.overlay_opacity=a.attr("data-modaal-overlay-opacity")),a.attr("data-modaal-overlay-close")&&(o=!0,t.overlay_close="false"!==a.attr("data-modaal-overlay-close")),a.attr("data-modaal-accessible-title")&&(o=!0,t.accessible_title=a.attr("data-modaal-accessible-title")),a.attr("data-modaal-start-open")&&(o=!0,t.start_open="true"===a.attr("data-modaal-start-open")),a.attr("data-modaal-fullscreen")&&(o=!0,t.fullscreen="true"===a.attr("data-modaal-fullscreen")),a.attr("data-modaal-custom-class")&&(o=!0,t.custom_class=a.attr("data-modaal-custom-class")),a.attr("data-modaal-close-text")&&(o=!0,t.close_text=a.attr("data-modaal-close-text")),a.attr("data-modaal-close-aria-label")&&(o=!0,t.close_aria_label=a.attr("data-modaal-close-aria-label")),a.attr("data-modaal-background-scroll")&&(o=!0,t.background_scroll="true"===a.attr("data-modaal-background-scroll")),a.attr("data-modaal-width")&&(o=!0,t.width=parseInt(a.attr("data-modaal-width"))),a.attr("data-modaal-height")&&(o=!0,t.height=parseInt(a.attr("data-modaal-height"))),a.attr("data-modaal-confirm-button-text")&&(o=!0,t.confirm_button_text=a.attr("data-modaal-confirm-button-text")),a.attr("data-modaal-confirm-cancel-button-text")&&(o=!0,t.confirm_cancel_button_text=a.attr("data-modaal-confirm-cancel-button-text")),a.attr("data-modaal-confirm-title")&&(o=!0,t.confirm_title=a.attr("data-modaal-confirm-title")),a.attr("data-modaal-confirm-content")&&(o=!0,t.confirm_content=a.attr("data-modaal-confirm-content")),a.attr("data-modaal-gallery-active-class")&&(o=!0,t.gallery_active_class=a.attr("data-modaal-gallery-active-class")),a.attr("data-modaal-loading-content")&&(o=!0,t.loading_content=a.attr("data-modaal-loading-content")),a.attr("data-modaal-loading-class")&&(o=!0,t.loading_class=a.attr("data-modaal-loading-class")),a.attr("data-modaal-ajax-error-class")&&(o=!0,t.ajax_error_class=a.attr("data-modaal-ajax-error-class")),a.attr("data-modaal-instagram-id")&&(o=!0,t.instagram_id=a.attr("data-modaal-instagram-id")),o&&a.modaal(t)}var o={init:function(t,o){var e=this;if(e.dom=a("body"),e.$elem=a(o),e.options=a.extend({},a.fn.modaal.options,e.$elem.data(),t),e.xhr=null,e.scope={is_open:!1,id:"modaal_"+(new Date).getTime()+Math.random().toString(16).substring(2),source:e.options.content_source?e.options.content_source:e.$elem.attr("href")},e.$elem.attr("data-modaal-scope",e.scope.id),e.private_options={active_class:"is_active"},e.lastFocus=null,e.options.is_locked||"confirm"==e.options.type||e.options.hide_close?e.scope.close_btn="":e.scope.close_btn='<button type="button" class="modaal-close" id="modaal-close" aria-label="'+e.options.close_aria_label+'"><span>'+e.options.close_text+"</span></button>","none"===e.options.animation&&(e.options.animation_speed=0,e.options.after_callback_delay=0),a(o).on("click.Modaal",function(a){a.preventDefault(),e.create_modaal(e,a)}),!0===e.options.outer_controls)var i="outer";else var i="inner";e.scope.prev_btn='<button type="button" class="modaal-gallery-control modaal-gallery-prev modaal-gallery-prev-'+i+'" id="modaal-gallery-prev" aria-label="Previous image (use left arrow to change)"><span>Previous Image</span></button>',e.scope.next_btn='<button type="button" class="modaal-gallery-control modaal-gallery-next modaal-gallery-next-'+i+'" id="modaal-gallery-next" aria-label="Next image (use right arrow to change)"><span>Next Image</span></button>',!0===e.options.start_open&&e.create_modaal(e)},create_modaal:function(a,t){var o,a=this;if(a.lastFocus=a.$elem,!1!==a.options.should_open&&("function"!=typeof a.options.should_open||!1!==a.options.should_open())){switch(a.options.before_open.call(a,t),a.options.type){case"inline":a.create_basic();break;case"ajax":o=a.options.source(a.$elem,a.scope.source),a.fetch_ajax(o);break;case"confirm":a.options.is_locked=!0,a.create_confirm();break;case"image":a.create_image();break;case"iframe":o=a.options.source(a.$elem,a.scope.source),a.create_iframe(o);break;case"video":a.create_video(a.scope.source);break;case"instagram":a.create_instagram()}a.watch_events()}},watch_events:function(){var t=this;t.dom.off("click.Modaal keyup.Modaal keydown.Modaal"),t.dom.on("keydown.Modaal",function(o){var e=o.keyCode,i=o.target;9==e&&t.scope.is_open&&(a.contains(document.getElementById(t.scope.id),i)||a("#"+t.scope.id).find('*[tabindex="0"]').focus())}),t.dom.on("keyup.Modaal",function(o){var e=o.keyCode,i=o.target;return o.shiftKey&&9==o.keyCode&&t.scope.is_open&&(a.contains(document.getElementById(t.scope.id),i)||a("#"+t.scope.id).find(".modaal-close").focus()),!t.options.is_locked&&27==e&&t.scope.is_open?!a(document.activeElement).is("input:not(:checkbox):not(:radio)")&&void t.modaal_close():"image"==t.options.type?(37==e&&t.scope.is_open&&!a("#"+t.scope.id+" .modaal-gallery-prev").hasClass("is_hidden")&&t.gallery_update("prev"),void(39==e&&t.scope.is_open&&!a("#"+t.scope.id+" .modaal-gallery-next").hasClass("is_hidden")&&t.gallery_update("next"))):void 0}),t.dom.on("click.Modaal",function(o){var e=a(o.target);if(!t.options.is_locked&&(t.options.overlay_close&&e.is(".modaal-inner-wrapper")||e.is(".modaal-close")||e.closest(".modaal-close").length))return void t.modaal_close();if(e.is(".modaal-confirm-btn"))return e.is(".modaal-ok")&&t.options.confirm_callback.call(t,t.lastFocus),e.is(".modaal-cancel")&&t.options.confirm_cancel_callback.call(t,t.lastFocus),void t.modaal_close();if(e.is(".modaal-gallery-control")){if(e.hasClass("is_hidden"))return;return e.is(".modaal-gallery-prev")&&t.gallery_update("prev"),void(e.is(".modaal-gallery-next")&&t.gallery_update("next"))}})},build_modal:function(t){var o=this,e="";"instagram"==o.options.type&&(e=" modaal-instagram");var i,l="video"==o.options.type?"modaal-video-wrap":"modaal-content";switch(o.options.animation){case"fade":i=" modaal-start_fade";break;case"slide-down":i=" modaal-start_slidedown";break;default:i=" modaal-start_none"}var n="";o.options.fullscreen&&(n=" modaal-fullscreen"),""===o.options.custom_class&&void 0===o.options.custom_class||(o.options.custom_class=" "+o.options.custom_class);var s="";o.options.width&&o.options.height&&"number"==typeof o.options.width&&"number"==typeof o.options.height?s=' style="max-width:'+o.options.width+"px;height:"+o.options.height+'px;overflow:auto;"':o.options.width&&"number"==typeof o.options.width?s=' style="max-width:'+o.options.width+'px;"':o.options.height&&"number"==typeof o.options.height&&(s=' style="height:'+o.options.height+'px;overflow:auto;"'),("image"==o.options.type||"video"==o.options.type||"instagram"==o.options.type||o.options.fullscreen)&&(s="");var d="";o.is_touch()&&(d=' style="cursor:pointer;"');var r='<div class="modaal-wrapper modaal-'+o.options.type+i+e+n+o.options.custom_class+'" id="'+o.scope.id+'"><div class="modaal-outer-wrapper"><div class="modaal-inner-wrapper"'+d+">";"video"!=o.options.type&&(r+='<div class="modaal-container"'+s+">"),r+='<div class="'+l+' modaal-focus" aria-hidden="false" aria-label="'+o.options.accessible_title+" - "+o.options.close_aria_label+'" role="dialog">',"inline"==o.options.type?r+='<div class="modaal-content-container" role="document"></div>':r+=t,r+="</div>"+o.scope.close_btn,"video"!=o.options.type&&(r+="</div>"),r+="</div>","image"==o.options.type&&!0===o.options.outer_controls&&(r+=o.scope.prev_btn+o.scope.next_btn),r+="</div></div>",a("#"+o.scope.id+"_overlay").length<1&&o.dom.append(r),"inline"==o.options.type&&t.appendTo("#"+o.scope.id+" .modaal-content-container"),o.modaal_overlay("show")},create_basic:function(){var t=this,o=a(t.scope.source),e="";o.length?(e=o.contents().detach(),o.empty()):e="Content could not be loaded. Please check the source and try again.",t.build_modal(e)},create_instagram:function(){var t=this,o=t.options.instagram_id,e="",i="Instagram photo couldn't be loaded, please check the embed code and try again.";if(t.build_modal('<div class="modaal-content-container'+(""!=t.options.loading_class?" "+t.options.loading_class:"")+'">'+t.options.loading_content+"</div>"),""!=o&&null!==o&&void 0!==o){var l="https://api.instagram.com/oembed?url=http://instagr.am/p/"+o+"/";a.ajax({url:l,dataType:"jsonp",cache:!1,success:function(o){t.dom.append('<div id="temp-ig" style="width:0;height:0;overflow:hidden;">'+o.html+"</div>"),t.dom.attr("data-igloaded")?window.instgrm.Embeds.process():t.dom.attr("data-igloaded","true");var e="#"+t.scope.id+" .modaal-content-container";a(e).length>0&&setTimeout(function(){a("#temp-ig").contents().clone().appendTo(e),a("#temp-ig").remove()},1e3)},error:function(){e=i;var o=a("#"+t.scope.id+" .modaal-content-container");o.length>0&&(o.removeClass(t.options.loading_class).addClass(t.options.ajax_error_class),o.html(e))}})}else e=i;return!1},fetch_ajax:function(t){var o=this;null==o.options.accessible_title&&(o.options.accessible_title="Dialog Window"),null!==o.xhr&&(o.xhr.abort(),o.xhr=null),o.build_modal('<div class="modaal-content-container'+(""!=o.options.loading_class?" "+o.options.loading_class:"")+'">'+o.options.loading_content+"</div>"),o.xhr=a.ajax(t,{success:function(t){var e=a("#"+o.scope.id).find(".modaal-content-container");e.length>0&&(e.removeClass(o.options.loading_class),e.html(t),o.options.ajax_success.call(o,e))},error:function(t){if("abort"!=t.statusText){var e=a("#"+o.scope.id+" .modaal-content-container");e.length>0&&(e.removeClass(o.options.loading_class).addClass(o.options.ajax_error_class),e.html("Content could not be loaded. Please check the source and try again."))}}})},create_confirm:function(){var a,t=this;a='<div class="modaal-content-container"><h1 id="modaal-title">'+t.options.confirm_title+'</h1><div class="modaal-confirm-content">'+t.options.confirm_content+'</div><div class="modaal-confirm-wrap"><button type="button" class="modaal-confirm-btn modaal-ok" aria-label="Confirm">'+t.options.confirm_button_text+'</button><button type="button" class="modaal-confirm-btn modaal-cancel" aria-label="Cancel">'+t.options.confirm_cancel_button_text+"</button></div></div></div>",t.build_modal(a)},create_image:function(){var t,o,e=this,i="";if(e.$elem.is("[data-group]")||e.$elem.is("[rel]")){var l=e.$elem.is("[data-group]"),n=l?e.$elem.attr("data-group"):e.$elem.attr("rel"),s=a(l?'[data-group="'+n+'"]':'[rel="'+n+'"]');s.removeAttr("data-gallery-active","is_active"),e.$elem.attr("data-gallery-active","is_active"),o=s.length-1;var d=[];i='<div class="modaal-gallery-item-wrap">',s.each(function(t,o){var e="",i="",l="",n=!1,s=!1,r=o.getAttribute("data-modaal-desc"),c=o.getAttribute("data-gallery-active");a(o).attr("data-modaal-content-source")?e=a(o).attr("data-modaal-content-source"):a(o).attr("href")?e=a(o).attr("href"):a(o).attr("src")?e=a(o).attr("src"):(e="trigger requires href or data-modaal-content-source attribute",s=!0),""!=r&&null!==r&&void 0!==r?(i=r,l='<div class="modaal-gallery-label"><span class="modaal-accessible-hide">Image '+(t+1)+" - </span>"+r.replace(/</g,"&lt;").replace(/>/g,"&gt;")+"</div>"):l='<div class="modaal-gallery-label"><span class="modaal-accessible-hide">Image '+(t+1)+"</span></div>",c&&(n=!0);var m={url:e,alt:i,rawdesc:r,desc:l,active:n,src_error:s};d.push(m)});for(var r=0;r<d.length;r++){var c="",m=d[r].rawdesc?"Image: "+d[r].rawdesc:"Image "+r+" no description";d[r].active&&(c=" "+e.private_options.active_class);var p=d[r].src_error?d[r].url:'<img src="'+d[r].url+'" alt=" " style="width:100%">';i+='<div class="modaal-gallery-item gallery-item-'+r+c+'" aria-label="'+m+'">'+p+d[r].desc+"</div>"}i+="</div>",1!=e.options.outer_controls&&(i+=e.scope.prev_btn+e.scope.next_btn)}else{var u,_=!1;e.$elem.attr("data-modaal-content-source")?u=e.$elem.attr("data-modaal-content-source"):e.$elem.attr("href")?u=e.$elem.attr("href"):e.$elem.attr("src")?u=e.$elem.attr("src"):(u="trigger requires href or data-modaal-content-source attribute",_=!0);var v="",f="",m="";e.$elem.attr("data-modaal-desc")?(m=e.$elem.attr("data-modaal-desc"),v=e.$elem.attr("data-modaal-desc"),f='<div class="modaal-gallery-label"><span class="modaal-accessible-hide">Image - </span>'+v.replace(/</g,"&lt;").replace(/>/g,"&gt;")+"</div>"):m="Image with no description";var p=_?u:'<img src="'+u+'" alt=" " style="width:100%">';i='<div class="modaal-gallery-item is_active" aria-label="'+m+'">'+p+f+"</div>"}t=i,e.build_modal(t),a(".modaal-gallery-item.is_active").is(".gallery-item-0")&&a(".modaal-gallery-prev").hide(),a(".modaal-gallery-item.is_active").is(".gallery-item-"+o)&&a(".modaal-gallery-next").hide()},gallery_update:function(t){var o=this,e=a("#"+o.scope.id),i=e.find(".modaal-gallery-item"),l=i.length-1;if(0==l)return!1;var n=e.find(".modaal-gallery-prev"),s=e.find(".modaal-gallery-next"),d=0,r=0,c=e.find(".modaal-gallery-item."+o.private_options.active_class),m="next"==t?c.next(".modaal-gallery-item"):c.prev(".modaal-gallery-item");return o.options.before_image_change.call(o,c,m),("prev"!=t||!e.find(".gallery-item-0").hasClass("is_active"))&&(("next"!=t||!e.find(".gallery-item-"+l).hasClass("is_active"))&&void c.stop().animate({opacity:0},250,function(){m.addClass("is_next").css({position:"absolute",display:"block",opacity:0});var t=a(document).width(),i=t>1140?280:50;d=e.find(".modaal-gallery-item.is_next").width(),r=e.find(".modaal-gallery-item.is_next").height();var p=e.find(".modaal-gallery-item.is_next img").prop("naturalWidth"),u=e.find(".modaal-gallery-item.is_next img").prop("naturalHeight");p>t-i?(d=t-i,e.find(".modaal-gallery-item.is_next").css({width:d}),e.find(".modaal-gallery-item.is_next img").css({width:d}),r=e.find(".modaal-gallery-item.is_next").find("img").height()):(d=p,r=u),e.find(".modaal-gallery-item-wrap").stop().animate({width:d,height:r},250,function(){c.removeClass(o.private_options.active_class+" "+o.options.gallery_active_class).removeAttr("style"),c.find("img").removeAttr("style"),m.addClass(o.private_options.active_class+" "+o.options.gallery_active_class).removeClass("is_next").css("position",""),m.stop().animate({opacity:1},250,function(){a(this).removeAttr("style").css({width:"100%"}),a(this).find("img").css("width","100%"),e.find(".modaal-gallery-item-wrap").removeAttr("style"),o.options.after_image_change.call(o,m)}),e.find(".modaal-gallery-item").removeAttr("tabindex"),e.find(".modaal-gallery-item."+o.private_options.active_class).attr("tabindex","0").focus(),e.find(".modaal-gallery-item."+o.private_options.active_class).is(".gallery-item-0")?n.stop().animate({opacity:0},150,function(){a(this).hide()}):n.stop().css({display:"block",opacity:n.css("opacity")}).animate({opacity:1},150),e.find(".modaal-gallery-item."+o.private_options.active_class).is(".gallery-item-"+l)?s.stop().animate({opacity:0},150,function(){a(this).hide()}):s.stop().css({display:"block",opacity:n.css("opacity")}).animate({opacity:1},150)})}))},create_video:function(a){var t,o=this;t='<iframe src="'+a+'" class="modaal-video-frame" frameborder="0" allowfullscreen></iframe>',o.build_modal('<div class="modaal-video-container">'+t+"</div>")},create_iframe:function(a){var t,o=this;t=null!==o.options.width||void 0!==o.options.width||null!==o.options.height||void 0!==o.options.height?'<iframe src="'+a+'" class="modaal-iframe-elem" frameborder="0" allowfullscreen></iframe>':'<div class="modaal-content-container">Please specify a width and height for your iframe</div>',o.build_modal(t)},modaal_open:function(){var t=this,o=a("#"+t.scope.id),e=t.options.animation;"none"===e&&(o.removeClass("modaal-start_none"),t.options.after_open.call(t,o)),"fade"===e&&o.removeClass("modaal-start_fade"),"slide-down"===e&&o.removeClass("modaal-start_slide_down");var i=o;a(".modaal-wrapper *[tabindex=0]").removeAttr("tabindex"),i="image"==t.options.type?a("#"+t.scope.id).find(".modaal-gallery-item."+t.private_options.active_class):o.find(".modaal-iframe-elem").length?o.find(".modaal-iframe-elem"):o.find(".modaal-video-wrap").length?o.find(".modaal-video-wrap"):o.find(".modaal-focus"),i.attr("tabindex","0").focus(),"none"!==e&&setTimeout(function(){t.options.after_open.call(t,o)},t.options.after_callback_delay)},modaal_close:function(){var t=this,o=a("#"+t.scope.id);t.options.before_close.call(t,o),null!==t.xhr&&(t.xhr.abort(),t.xhr=null),"none"===t.options.animation&&o.addClass("modaal-start_none"),"fade"===t.options.animation&&o.addClass("modaal-start_fade"),"slide-down"===t.options.animation&&o.addClass("modaal-start_slide_down"),setTimeout(function(){"inline"==t.options.type&&a("#"+t.scope.id+" .modaal-content-container").contents().detach().appendTo(t.scope.source),o.remove(),t.options.after_close.call(t),t.scope.is_open=!1},t.options.after_callback_delay),t.modaal_overlay("hide"),null!=t.lastFocus&&t.lastFocus.focus()},modaal_overlay:function(t){var o=this;"show"==t?(o.scope.is_open=!0,o.options.background_scroll||o.dom.addClass("modaal-noscroll"),a("#"+o.scope.id+"_overlay").length<1&&o.dom.append('<div class="modaal-overlay" id="'+o.scope.id+'_overlay"></div>'),a("#"+o.scope.id+"_overlay").css("background",o.options.background).stop().animate({opacity:o.options.overlay_opacity},o.options.animation_speed,function(){o.modaal_open()})):"hide"==t&&a("#"+o.scope.id+"_overlay").stop().animate({opacity:0},o.options.animation_speed,function(){a(this).remove(),o.dom.removeClass("modaal-noscroll")})},is_touch:function(){return"ontouchstart"in window||navigator.maxTouchPoints}},e=[];a.fn.modaal=function(t){return this.each(function(i){var l=a(this).data("modaal");if(l){if("string"==typeof t)switch(t){case"open":l.create_modaal(l);break;case"close":l.modaal_close()}}else{var n=Object.create(o);n.init(t,this),a.data(this,"modaal",n),e.push({element:a(this).attr("class"),options:t})}})},a.fn.modaal.options={type:"inline",content_source:null,animation:"fade",animation_speed:300,after_callback_delay:350,is_locked:!1,hide_close:!1,background:"#000",overlay_opacity:"0.8",overlay_close:!0,accessible_title:"Dialog Window",start_open:!1,fullscreen:!1,custom_class:"",background_scroll:!1,should_open:!0,close_text:"Close",close_aria_label:"Close (Press escape to close)",width:null,height:null,before_open:function(){},after_open:function(){},before_close:function(){},after_close:function(){},source:function(a,t){return t},confirm_button_text:"Confirm",confirm_cancel_button_text:"Cancel",confirm_title:"Confirm Title",confirm_content:"<p>This is the default confirm dialog content. Replace me through the options</p>",confirm_callback:function(){},confirm_cancel_callback:function(){},gallery_active_class:"gallery_active_item",outer_controls:!1,before_image_change:function(a,t){},after_image_change:function(a){},loading_content:'<div class="modaal-loading-spinner"><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div></div>',loading_class:"is_loading",ajax_error_class:"modaal-error",ajax_success:function(){},instagram_id:null},a(function(){var o=a(".modaal");o.length&&o.each(function(){t(a(this))});var i=new MutationObserver(function(o){o.forEach(function(o){if(o.addedNodes&&o.addedNodes.length>0){[].some.call(o.addedNodes,function(o){var i=a(o);(i.is("a")||i.is("button"))&&(i.hasClass("modaal")?t(i):e.forEach(function(t){if(t.element==i.attr("class"))return a(i).modaal(t.options),!1}))})}})}),l={subtree:!0,attributes:!0,childList:!0,characterData:!0};setTimeout(function(){i.observe(document.body,l)},500)})}(jQuery,window,document);

// Documentation: https://github.com/humaan/Modaal
$('.inline').modaal();
