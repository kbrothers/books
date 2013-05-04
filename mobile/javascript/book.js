/*!
 * jQuery Double Tap Plugin.
 * 
 * Copyright (c) 2010 Raul Sanchez (http://www.sanraul.com)
 * 
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */

(function($){                                                        //触屏的双击、单击事件
	// Determine if we on iPhone or iPad
	var isiOS = false;
	var agent = navigator.userAgent.toLowerCase();
	if(agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0){
	       isiOS = true;
	}
	
	$.fn.doubletap = function(onDoubleTapCallback, onTapCallback, delay){
		//debug("in doubletapg");
		var eventName, action;
		delay = delay == null? 300 : delay;
		eventName = isiOS == true? 'touchend' : 'click';
		//debug("in doubletapg:eventName="+eventName);
		
		$(this).bind(eventName, function(event){
										 
			var now = new Date().getTime();
			var lastTouch = $(this).data('lastTouch') || now + 1 /** the first time this will make delta a negative number */;
			var delta = now - lastTouch;
			var lastPoint=$(this).data('lastPoint')||{x:-1000,y:-1000};
			var currentPoint={x:event.pageX,y:event.pageY};
			//var str='go2:'+event.pageX+','+event.originalEvent.changedTouches;
			 if (event.originalEvent.changedTouches&&event.originalEvent.changedTouches.length >0)
			  {
			   currentPoint.x = event.originalEvent.changedTouches[0].pageX;
			   currentPoint.y = event.originalEvent.changedTouches[0].pageY
			//   str+='has touches...:'+ event.originalEvent.changedTouches[0].pageX;
			  }
			var dx=currentPoint.x-lastPoint.x;
			var dy=currentPoint.y-lastPoint.y;
			//clearTimeout(action);
		//	debug(str+'dx='+dx+',dy='+dy);
			if(delta<delay && delta>0&&Math.abs(dx)<50&&Math.abs(dy)<50){
				//debug("do double tap:");
				//$(this).trigger('doubletap', [event]);
				if(onDoubleTapCallback != null && typeof onDoubleTapCallback == 'function'){
					onDoubleTapCallback(event);
					 $(this).data('lastTouch',-1);
					return;
				}
			}else{
				//$(this).data('lastTouch', now);
				/**
				action = setTimeout(function(evt){
					if(onTapCallback != null && typeof onTapCallback == 'function'){
						onTapCallback(evt);
					}
					clearTimeout(action);   // clear the timeout
				}, delay, [event]);
				****/
			}
			$(this).data('lastTouch', now);
			$(this).data('lastPoint', currentPoint);
		});
	};
})(jQuery);

function debug(str){
		$('#log').html(str);		
		if(window.console&&window.console.log){
			window.console.log(str);
		}
	}

var myFun=
(function() {
	//alert(123);
	// Dimensions of the whole book
	
	var isiOS = false;
	var agent = navigator.userAgent.toLowerCase();
	if(agent.indexOf('iphone') >= 0 || agent.indexOf('ipad') >= 0 || agent.indexOf('android') >= 0 ){
	       isiOS = true;
	}
	
	var BOOK_WIDTH = 830;
	var BOOK_HEIGHT = 260;
	var isZoomPage=false;
	
	var startX=0;
	var startY=0;
	var endX=0;
	var endY=0;
	var currentPageText=$("#fbCurrentPageIndex");
	var totalPageTextt=$("#fbTotalPageCount");	
	
	// Dimensions of one page in the book
	var PAGE_WIDTH = 400;
	var PAGE_HEIGHT = 250;
	var TOTAL_PAGE_COUNT=0;
	var NORMAL_PAGE_DIR="files/page/";
	var ZOOM_PAGE_DIR="files/large/";
	var IMAGE_EXT=".jpg";
	
	BOOK_WIDTH=fboptions.pageWidth+30;
	BOOK_HEIGHT=fboptions.pageHeight+10;
	PAGE_WIDTH=fboptions.pageWidth;
	PAGE_HEIGHT=fboptions.pageHeight;
	NORMAL_PAGE_DIR=fboptions.normalPageDir;
	ZOOM_PAGE_DIR=fboptions.zoomPageDir;
	TOTAL_PAGE_COUNT=fboptions.totalPage;
	totalPageTextt.text(TOTAL_PAGE_COUNT);
	
	var originalW_H={newBookWidth:BOOK_WIDTH,newBookHeight:BOOK_HEIGHT,newPageWidth:PAGE_WIDTH,newPageHeight:PAGE_HEIGHT};
	
	// Vertical spacing between the top edge of the book and the papers
	var PAGE_Y = ( BOOK_HEIGHT - PAGE_HEIGHT ) / 2;
	
	// The canvas size equals to the book dimensions + this padding
	var CANVAS_PADDING = 60;
	
	var page = 0;    //当前页index
	var toPage=0;    //要去到的页index
	
	var canvas = document.getElementById( "pageflip-canvas" );
	var context = canvas.getContext( "2d" );
	var imageDir="";
	var _html="";
	var _images=[];
	var self=this;
	var book = $("#book");		//document.getElementById( "book" );
	var bookImg=$("#bookImg");
	var _pageSection=$("#pages");
	for(var i=0;i<TOTAL_PAGE_COUNT;i++){
		imageDir=NORMAL_PAGE_DIR+String(i+1)+IMAGE_EXT;
		_html=$("<section></section>")
		$("#pages").append(_html);
		var pageLoading=$("<div class='fbPageLoading'></div>");
		var _image=$("<img src=''></img>");
		_html.append(pageLoading);
		pageLoading.append(_image);
		
		var fbPage={section:_html,loading:pageLoading,image:_image};
		$.fn.extend(fbPage,{
					resize:function(_width,_height){
						this.section.width(_width);
						this.section.height(_height);
						this.loading.width(_width);
						this.loading.height(_height);
						this.image.width(_width);
						this.image.height(_height);
					},
					showLoading:function(){
						this.find(".fbPageLoading").show();
					},
					hideLoading:function(){
						this.find(".fbPageLoading").hide();
					}
					});
		_images.push(fbPage);
	}
	
	var showNearByImage=function(pageIndex){
		var tmpPage;
		var _imageDir;
		for(var i=pageIndex-3;i<pageIndex+3;i++){
			if(i>=0 && i<TOTAL_PAGE_COUNT){
				_imageDir=NORMAL_PAGE_DIR+String(i+1)+IMAGE_EXT;
				_images[i].image.attr("src",_imageDir);
			}
		}
	}
	
	var _zoomPage={zoomsection:null,zoomloading:null,zoomimage:null};
	
	var getZoomPage=function(pageIndex){
		var zoomDir=ZOOM_PAGE_DIR+String(pageIndex+1)+IMAGE_EXT;
		var zoomSection=$("<section id='zoomPageSection' style='position:absolute;'></section>");
		var zoomLoading=$("<div id='zoomPageLoading' class='fbPageLoading'></div>");
		var zoomImage=$("<img id='zoomImage' src='"+zoomDir+"'></img>");
		$("#bookFrame").append(zoomSection);
		zoomSection.append(zoomLoading);
		zoomLoading.append(zoomImage);
		_zoomPage={zoomsection:zoomSection,zoomloading:zoomLoading,zoomimage:zoomImage};
		zoomSection.css("left",_images[0].section.css("left"));
		zoomImage.css("left",_images[0].section.css("left"));
		zoomSection.css("top",_images[0].section.css("top"));
		zoomImage.css("top",_images[0].section.css("top"));
		$.fn.extend(_zoomPage,{
					resize:function(_width,_height){
						this.zoomsection.width(_width);
						this.zoomsection.height(_height);
						this.zoomloading.width(_width);
						this.zoomloading.height(_height);
						this.zoomimage.width(_width);
						this.zoomimage.height(_height);	
					},
					zoomIn:function(zoomWidth,zoomHeight){
						//debug("351561111111111111111111111111111111111111111");
						this.zoomsection.animate({width:zoomWidth,height:zoomHeight},{duration:500,easing:'easeInSine',step:function(){
							_zoomPage.zoomsection.css("left",($(window).width()-_zoomPage.zoomsection.width())/2);
							_zoomPage.zoomsection.css("top",($(window).height()-_zoomPage.zoomsection.height())/2);
							
																														   }});
																				
						this.zoomloading.animate({width:zoomWidth,height:zoomHeight},{duration:500,easing:'easeInSine',step:function(){
							_zoomPage.zoomloading.css("left",($(window).width()-_zoomPage.zoomsection.width())/2);
							_zoomPage.zoomloading.css("top",($(window).height()-_zoomPage.zoomsection.height())/2);
																														   }});
						this.zoomimage.animate({width:zoomWidth,height:zoomHeight},{duration:500,easing:'easeInSine',step:function(){
							_zoomPage.zoomimage.css("left",($(window).width()-_zoomPage.zoomsection.width())/2);
							_zoomPage.zoomimage.css("top",($(window).height()-_zoomPage.zoomsection.height())/2);
							if(isiOS){					
								document.getElementById("zoomImage").addEventListener("touchstart",onZoomTouchStart,false);
							}else{					
								document.getElementById("zoomImage").addEventListener("mousedown",onZoomMouseDown,false);
							}
																														   }});
					},
					zoomOut:function(zoomWidth,zoomHeight){//
						this.zoomsection.animate({width:zoomWidth,height:zoomHeight,left:($(window).width()-zoomWidth)/2,top:(book.height()-zoomHeight)/2},{
									   duration:500,easing:'easeInSine',
									   complete:function(){
									   _zoomPage.zoomsection.remove();
									   }
									   });
						this.zoomloading.animate({width:zoomWidth,height:zoomHeight,left:($(window).width()-zoomWidth)/2,top:(book.height()-zoomHeight)/2},{
									   duration:500,easing:'easeInSine',
									   complete:function(){
									   _zoomPage.zoomloading.remove();
									   }
									   });
						this.zoomimage.animate({width:zoomWidth,height:zoomHeight,left:($(window).width()-zoomWidth)/2,top:(book.height()-zoomHeight)/2},{
									   duration:500,easing:'easeInSine',
									   complete:function(){
										   resizeBook(false);
   										   showNormalBook();
										    _zoomPage.zoomimage.remove();
										   /*if(isiOS){					
											   document.getElementById("zoomImage").removeEventListener("touchstart",onZoomTouchStart,false);
										   }else{					
											   document.getElementById("zoomImage").removeEventListener("mousedown",onZoomMouseDown,false);
									   	   
									   	   }*/
									   }
									   });
				    }
					})
		zoomSection.doubletap(function(){onZoom();});
	}
	
	var mouse = { x: 0, y: 0 };
	
	var flips = [];	
	
	if(true){
		//alert("aaaaaaaaaaaaaaa");
		book.doubletap(function(){onZoom();});
	}
	// List of all the page elements in the DOM
	var pages = document.getElementsByTagName( "section" );
	//var sc=document.createElement('')
	// Organize the depth of our pages and create the flip definitions
	for( var i = 0, len = pages.length; i < len; i++ ) {
		pages[i].style.zIndex = len - i;
		
		flips.push( {
			// Current progress of the flip (left -1 to right +1)
			progress: 1,
			// The target value towards which progress is always moving
			target: 1,
			// The page DOM element related to this flip
			page: pages[i], 
			// True while the page is being dragged
			dragging: false
		} );
	}
	
	var showNormalBook=function(){
		canvas.style.display="block";
		//bookImg.css("display","block");
		for(var i=0;i<TOTAL_PAGE_COUNT;i++){
			_images[i].section.css("display","block");
			_images[i].loading.css("display","block");
			_images[i].loading.width(PAGE_WIDTH);
			_images[i].image.css("display","block");
			_images[i].image.width(PAGE_WIDTH);
		}
	}
	
	var hideNormalBook=function(){
		//debug("54321789++++++");
		canvas.style.display="none";
		bookImg.css("display","none");
		for(var i=0;i<TOTAL_PAGE_COUNT;i++){
			_images[i].section.css("display","none");
			_images[i].loading.css("display","none");
			_images[i].image.css("display","none");
		}
	}
	
	var getWidth_Height=function(){
			var returnValue={newBookWidth:830,newBookHeight:260,newPageWidth:400,newPageHeight:250};
			
			var marginTop=10;				//上下左右边距
			var marginBottom=10;
			var marginLeft=10;
			var marginRight=10;
			var stageWidth=$(window).width()-marginLeft-marginRight;			//舞台大小
			var stageHeight=$(window).height()-marginTop-marginBottom;
			var bookWidth=BOOK_WIDTH;
			var bookHeight=BOOK_HEIGHT;
			var W_H=bookWidth/bookHeight;
			if(W_H>=stageWidth/stageHeight){
				returnValue.newBookWidth=stageWidth;
				returnValue.newBookHeight=(stageWidth*bookHeight)/bookWidth;
			}else{
				returnValue.newBookWidth=stageHeight*W_H;
				returnValue.newBookHeight=stageHeight;
			}
			returnValue.newPageWidth=(returnValue.newBookWidth-30);
			returnValue.newPageHeight=returnValue.newBookHeight*25/26;
			return returnValue;
	};
	
	var resizeBook=function(zoomIn){
		
		if(!zoomIn){
			var bookW_H=getWidth_Height();
		}else{
			var bookW_H=originalW_H;
		}
		BOOK_WIDTH=bookW_H.newBookWidth;
		BOOK_HEIGHT=bookW_H.newBookHeight;
		PAGE_WIDTH=bookW_H.newPageWidth;
		PAGE_HEIGHT=bookW_H.newPageHeight;
		
		book.css("left",($(window).width()-BOOK_WIDTH)/2);
		book.css("top",($(window).height()-BOOK_HEIGHT)/2);
		book.width(BOOK_WIDTH);
		book.height(BOOK_HEIGHT);
		/*book.style.left = ($(window).width()-BOOK_WIDTH)/2 + "px";
		book.style.top = ($(window).height()-BOOK_HEIGHT)/2 + "px";
		book.width=BOOK_WIDTH;
		bookheight=BOOK_HEIGHT;*/
		bookImg.width(BOOK_WIDTH);
		bookImg.height(BOOK_HEIGHT);
		bookImg.css("left",0);
		bookImg.css("top",0);
		bookImg.css("position","relative");
	//	alert("BOOK_WIDTH="+BOOK_WIDTH+", BOOK_HEIGHT="+BOOK_HEIGHT+", page_HEIGHT="+PAGE_HEIGHT+",  PAGE_WIDTH="+PAGE_WIDTH)
		/*_pageSection.width(PAGE_WIDTH);
		_pageSection.height(PAGE_HEIGHT);*/
		/*_pageSection.css("left",BOOK_WIDTH/2);
		_pageSection.css("top",BOOK_HEIGHT/52);*/
		PAGE_Y = ( BOOK_HEIGHT - PAGE_HEIGHT ) / 2;
		
		var _image;
		for(var i=0;i<TOTAL_PAGE_COUNT;i++){
			if(i==page && zoomIn ){				
				continue;
			}
			_image=_images[i];
			if(_image.image==null){
				continue;
			}
			_image.resize(PAGE_WIDTH,PAGE_HEIGHT);
			//_image.section.width(PAGE_WIDTH);
			//_image.section.height(PAGE_HEIGHT);
			_image.section.css("left",15);
			_image.section.css("top",BOOK_HEIGHT/52);
			//_image.image.width(PAGE_WIDTH);
			//_image.image.height(PAGE_HEIGHT);
			_image.image.css("left",15);
			_image.image.css("top",BOOK_HEIGHT/52);
			if(i<page){
				_image.resize(0.1,PAGE_HEIGHT);
			}
		}
		canvas.width = BOOK_WIDTH*2 + ( CANVAS_PADDING * 2 );
		canvas.height = BOOK_HEIGHT + ( CANVAS_PADDING * 2 );
	
		// Offset the canvas so that it's padding is evenly spread around the book
		canvas.style.top = -CANVAS_PADDING+ "px";
		canvas.style.left =-(CANVAS_PADDING+PAGE_WIDTH)+ "px"; 
	}
	resizeBook();
	showNearByImage(0);
	
	// Resize the canvas to match the book size
	canvas.width = BOOK_WIDTH*2 + ( CANVAS_PADDING * 2 );
	canvas.height = BOOK_HEIGHT + ( CANVAS_PADDING * 2 );
	
	// Offset the canvas so that it's padding is evenly spread around the book
	canvas.style.top = -CANVAS_PADDING+ "px";
	canvas.style.left =-(CANVAS_PADDING+PAGE_WIDTH)+ "px"; 
	
	// Render the page flip 60 times a second
    setInterval( render, 1000 / 60 );
	
	var onStageResize=function(){
	//alert("onStageResize************");
		if(!isZoomPage){
			resizeBook(false);
		}
	};
	if(isiOS){
		//book.mouseup
		document.getElementById("book").addEventListener("touchstart",onTouchStart,false);
		
		/*document.addEventListener("touchstart",onTouchStart,true);
		document.addEventListener('touchmove',onTouchMove,false);
		document.addEventListener("touchend",onTouchEnd,false);*/
	}else{
		//document.getElementById("book").addEventListener("dblclick",onDBLClick,false);
		document.getElementById("book").addEventListener( "mousedown", mouseDownHandler, false );
		//document.getElementById("book").addEventListener( "mousemove", mouseMoveHandler, false );
		//document.getElementById("book").addEventListener( "mouseup", mouseUpHandler, false );
		/*document.addEventListener( "mousemove", mouseMoveHandler, false );
		document.addEventListener( "mousedown", mouseDownHandler, false );
		document.addEventListener( "mouseup", mouseUpHandler, false );*/
	}
	//document.addEventListener("resize",onStageResize,false);
	
	var onZoom=function(){
		//debug("do you come to doubleclick??????");
		if(!isZoomPage){
			
			isZoomPage=true;
			var toWidth=originalW_H.newPageWidth;
			var toHeight=originalW_H.newPageHeight;
			var zoomObj=_images[page];
			var zoomPage=getZoomPage(page);
			if(_zoomPage.zoomsection!=null){
				_zoomPage.resize(PAGE_WIDTH,PAGE_HEIGHT);
				hideNormalBook();
				_zoomPage.zoomIn(toWidth,toHeight);
				/*_zoomPage.zoompage.animate({width:toWidth,height:toHeight},{duration:500,easing:'easeInSine',step:function(){
					_zoomPage.zoompage.css("left",($(window).width()-_zoomPage.zoompage.width())/2);
					_zoomPage.zoompage.css("top",($(window).height()-_zoomPage.zoompage.height())/2);
																														   }});
				//_zoomPage.zoompage.animate({left:});
				_zoomPage.zoomimage.animate({width:toWidth,height:toHeight},{duration:500,easing:'easeInSine',step:function(){
				_zoomPage.zoomimage.css("left",($(window).width()-_zoomPage.zoomimage.width())/2);
				_zoomPage.zoomimage.css("top",($(window).height()-_zoomPage.zoomimage.height())/2);
				
				if(isiOS){
					
					document.getElementById("zoomImage").addEventListener("touchstart",onZoomTouchStart,false);
				}else{
					//document.getElementById("zoomImage").addEventListener("dblclick",onZoomDBLClick,false);
					
					document.getElementById("zoomImage").addEventListener("mousedown",onZoomMouseDown,false);
				}
				}});*/
			}
		}else{
			var newW_H=getWidth_Height();
			isZoomPage=false;
			_zoomPage.zoomOut(newW_H.newPageWidth,newW_H.newPageHeight);
			/*_zoomPage.zoompage.animate({width:newW_H.newPageWidth,height:newW_H.newPageHeight},{
									   duration:500,easing:'easeInSine',step:function(){
									   _zoomPage.zoompage.css("left",($(window).width()-_zoomPage.zoompage.width())/2);
									   _zoomPage.zoompage.css("top",($(window).height()-_zoomPage.zoompage.height())/2);
									   },
									   complete:function(){
									   _zoomPage.zoompage.remove();
									   }
									   });
			_zoomPage.zoomimage.animate({width:newW_H.newPageWidth,height:newW_H.newPageHeight},{
											duration:500,easing:'easeInSine',step:function(){
												_zoomPage.zoomimage.css("left",($(window).width()-_zoomPage.zoomimage.width())/2);
												_zoomPage.zoomimage.css("top",($(window).height()-_zoomPage.zoomimage.height())/2);
											},
											complete:function(){
												resizeBook(false);
												showNormalBook();
												_zoomPage.zoomimage.remove();
											}
										});*/
		}
	}
	
	function onDBLClick(e){
		
		onZoomIn();
		e.preventDefault();
	}
	
	var isZoomPageDown=false;
	var mouseDownX=0;
	var mouseDownY=0;
	
	/*var isDoubleTouch=function(event){
		debug("befort getTime");
		var now = new Date().getTime();
		debug("past getTime!!!!!!!!!!!");
		var lastTouch = $(this).data('lastTouch') || now + 1 // the first time this will make delta a negative number ;
		debug("past lastTouch#####");
		var delta = now - lastTouch;
		debug("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");
		var lastPoint=$(this).data('lastPoint')||{x:-1000,y:-1000};
		debug("ddddddddddddddddddddddddddddddddd");
		var currentPoint={x:event.pageX,y:event.pageY};
			//var str='go2:'+event.pageX+','+event.originalEvent.changedTouches;
		if (event.originalEvent.changedTouches&&event.originalEvent.changedTouches.length >0)
		{
			debug("befort get event point");
			currentPoint.x = event.originalEvent.changedTouches[0].pageX;
			currentPoint.y = event.originalEvent.changedTouches[0].pageY;
			debug("after get event point");
			//   str+='has touches...:'+ event.originalEvent.changedTouches[0].pageX;
		}
		var dx=currentPoint.x-lastPoint.x;
		var dy=currentPoint.y-lastPoint.y;
		$(this).data('lastTouch', now);
		$(this).data('lastPoint', currentPoint);
		if(delta<300 && Math.abs(dx)<20 && Math.abs(dy)<20){
			if(isZoomPage){
				onZoomMouseDown(event);
			}else{
				onDBLClick(event);
			}
			debug("The return is true.");
			doubleTouch= true;
		}else{
			debug("The return is false.");
			doubleTouch= false;
		}		
	};*/ 
	
	var zoomMD_TS=function(e){
		isZoomPageDown=true;		
		startX=_zoomPage.zoomimage.offset().left;
		startY=_zoomPage.zoomimage.offset().top;
		if(isiOS){
			mouseDownX=e.touches[0].pageX;
			mouseDownY=e.touches[0].pageY;
			document.addEventListener("touchmove",onZoomTouchMove,false);
			document.addEventListener("touchend",onZoomTouchEnd,false);	
		}else{
			mouseDownX=e.clientX;
			mouseDownY=e.clientY;
			document.addEventListener("mousemove",onZoomMouseMove,false);
			document.addEventListener("mouseup",onZoomMouseUp,false);	
		}
		e.preventDefault();
	}
	
	function onZoomTouchStart(e){
		zoomMD_TS(e);
	}
	
	function onZoomMouseDown(e){
		zoomMD_TS(e);
	}
	
	function onZoomTouchMove(e){
		var moveX=(e.touches[0].pageX-mouseDownX)+startX;
		var moveY=(e.touches[0].pageY-mouseDownY)+startY;
		//_zoomPage.zoomimage.css("left",moveX);
		//_zoomPage.zoomimage.css("top",moveY);
		_zoomPage.zoomsection.css("left",moveX);
		_zoomPage.zoomsection.css("top",moveY);
	}
	
	function onZoomTouchEnd(e){
		isZoomPageDown=false;
		document.removeEventListener("touchmove",onZoomTouchMove,false);
		document.removeEventListener("touchend",onZoomTouchEnd,false);
	}
	
	function onZoomMouseMove(e){
		var moveX=(e.clientX-mouseDownX)+startX;
		var moveY=(e.clientY-mouseDownY)+startY;
		//_zoomPage.zoomimage.css("left",moveX);
		//_zoomPage.zoomimage.css("top",moveY);
		_zoomPage.zoomsection.css("left",moveX);
		_zoomPage.zoomsection.css("top",moveY);
	}
	
	function onZoomMouseUp(e){
		isZoomPageDown=false;
		document.removeEventListener("mousemove",onZoomMouseMove,false);
		document.removeEventListener("mouseup",onZoomMouseUp,false);
	}
	
	function onZoomDBLClick(e){
		//resizeBook(false);  //还原
			var newW_H=getWidth_Height();
			isZoomPage=false;
			_zoomPage.zoompage.animate({width:newW_H.newPageWidth,height:newW_H.newPageHeight},{
									   duration:500,easing:'easeInSine',step:function(){
									   _zoomPage.zoompage.css("left",($(window).width()-_zoomPage.zoompage.width())/2);
									   _zoomPage.zoompage.css("top",($(window).height()-_zoomPage.zoompage.height())/2);
									   },
									   complete:function(){
									   _zoomPage.zoompage.remove();
									   }
									   });
			_zoomPage.zoomimage.animate({width:newW_H.newPageWidth,height:newW_H.newPageHeight},{
											duration:500,easing:'easeInSine',step:function(){
												_zoomPage.zoomimage.css("left",($(window).width()-_zoomPage.zoomimage.width())/2);
												_zoomPage.zoomimage.css("top",($(window).height()-_zoomPage.zoomimage.height())/2);
											},
											complete:function(){
												resizeBook(false);
												showNormalBook();
												_zoomPage.zoomimage.remove();
											}
										});
			
	}
	
	$(window).resize(onStageResize);
	
	var isPlaying=function(){
		for(var i=0;i<TOTAL_PAGE_COUNT;i++){
			if(Math.abs( flips[i].progress )>=0.999){
				isAnyPagePlaying=false;
			}else{
				isAnyPagePlaying=true;
				break;
			}
		}
	}

    function onTouchStart(e){
		isPlaying();
		if(isAnyPagePlaying){
			return;
		}
		
		
		if(isZoomPage){
			
		}else{
		startX=e.touches[0].pageX;
		startY=e.touches[0].pageY;
		//alert("i'm not come here!!!!");
		mouse.x=startX-book.offset().left;
		mouse.y=startY- book.offset().top;
		if(mouse.x<BOOK_WIDTH/4 && mouse.x>-BOOK_WIDTH/4 && page - 1 >= 0){
			flips[page - 1].progress=-1;
			flips[page - 1].dragging = true;
				//toPage=page ;
				//sortPage();
		}else if (mouse.x >= 3*BOOK_WIDTH/4 && page + 1 < flips.length) {
				// We are on the right side, drag the current page
			flips[page ].progress=1;
			flips[page].dragging = true;
			_images[page+1].section.width(PAGE_WIDTH);
				//toPage=page+1;
				//sortPage();
		}
		}
		e.preventDefault();
		document.addEventListener('touchmove',onTouchMove,false);
		document.addEventListener("touchend",onTouchEnd,false);
	}
	
	function onTouchMove(e){
		//if(isAnyPagePlaying){
		//	return;
		//}
		mouse.x =e.touches[0].pageX-book.offset().left - ( BOOK_WIDTH / 2 );
		mouse.y =e.touches[0].pageY - book.offset().top;
	}
	
	var doubleTouch=false;
	
	function onTouchEnd(e){
		
		//endX=e.touches[0].pageX;
		//endY=e.touches[0].pageY;
		//debug("flips.length==============================="+flips.length);
		for( var i = 0; i < flips.length; i++ ) {
			// If this flip was being dragged, animate to its destination
			if( flips[i].dragging ) {
				// Figure out which page we should navigate to
				if( mouse.x < 0 ) {
					flips[i].target = -1;
					page = Math.min( page + 1, flips.length );
				}
				else {
					flips[i].target = 1;
					page = Math.max( page - 1, 0 );
				}
			}
			currentPageText.text(page+1);
			flips[i].dragging = false;
			
		}
		
		document.removeEventListener('touchmove',onTouchMove,false);
		document.removeEventListener("touchend",onTouchEnd,false);
		showNearByImage(page);
	}
	
	function mouseMoveHandler( event ) {
		// Offset mouse position so that the top of the book spine is 0,0
		mouse.x = event.clientX - book.offset().left - (15);
		mouse.y = event.clientY - book.offset().top;
	}
	
	function mouseDownHandler( event ) {
		isPlaying();
	//	debug("isAnyPagePlaying==============="+isAnyPagePlaying);
		if(isAnyPagePlaying || isZoomPage){
			return;
		}
		// Make sure the mouse pointer is inside of the book
		mouse.x = event.clientX - book.offset().left - 15;
		mouse.y = event.clientY - book.offset().top;
		
		if (Math.abs(mouse.x) < PAGE_WIDTH) {
			
			if ((mouse.x <= BOOK_WIDTH/4) &&(mouse.x >= -BOOK_WIDTH/4) && (page - 1 >= 0)) {
				// We are on the left side, drag the previous page
				flips[page - 1].progress=-1;
				flips[page - 1].dragging = true;
				//toPage=page ;
				//sortPage();
			}
			else if (mouse.x > 3*BOOK_WIDTH/4 && page + 1 < flips.length) {
				// We are on the right side, drag the current page
				flips[page ].progress=1;
				flips[page].dragging = true;
				_images[page+1].section.width(PAGE_WIDTH);
				//toPage=page+1;
				//sortPage();
			}
			
		}
		
		document.addEventListener( "mousemove", mouseMoveHandler, false );
		document.addEventListener( "mouseup", mouseUpHandler, false );
		// Prevents the text selection
		event.preventDefault();
	}
	
	var gotoNext=function(){//下一页
	    //debug("gotoNext++++++++++++");
		isPlaying();
		if(isAnyPagePlaying){
			return;
		}
		
		if(page+2<=TOTAL_PAGE_COUNT){
			gotoPage(page+1);
		}
	};
	
	var gotoPrevious=function(){					//前一页
		isPlaying();
		if(isAnyPagePlaying){
			return;
		}
		if(page>=1){
			gotoPage(page-1);
		}
	};
	
	var gotoFirst=function(){		//第一页
		isPlaying();
		if(isAnyPagePlaying){
			return;
		}
		if(page!=0){
			gotoPage(0);
			//_images[i].section.width(PAGE_WIDTH);
			//flips[toPage].progress=1;
		}
	};
	
	//document.addEventListener('mousedown', gotoNext, false);
	
	var gotoLast=function(){                     //最后一页
		//debug("gotoLast++++++++++++++++++++++");
		isPlaying();
		if(isAnyPagePlaying){
			return;
		}
		if(page!=TOTAL_PAGE_COUNT-1){
			gotoPage(TOTAL_PAGE_COUNT-1);
		}
		for(var i=1;i<TOTAL_PAGE_COUNT-1;i++){
			_images[i].section.width(0.1);
			//flips[toPage].progress=-1;
		}
	};
	var isGotoPage=false;
	
	var gotoPage =function(pageIndex){
		if(isZoomPage){
			var newZoomDir=ZOOM_PAGE_DIR+String(pageIndex+1)+IMAGE_EXT;
			_zoomPage.zoomimage.attr("src",newZoomDir);
		}
		
		isGotoPage=true;
		if(pageIndex<0 || pageIndex>TOTAL_PAGE_COUNT-1 || pageIndex==page){
			return;
		}
		toPage=pageIndex;
		//sortPage();
		flips[page].dragging = false;
		if(pageIndex>page){
			flips[page].target = -1;
			flips[toPage].progress=1;
			_images[toPage].section.width(PAGE_WIDTH);//css("display","block");//
			page=pageIndex;
		}else{
			flips[toPage].target = 1;
			flips[toPage].progress=-1;
			page=pageIndex;
		}
		showNearByImage(toPage);
		currentPageText.text(toPage+1);
	};
	
    var fillPage=function(centerPageIndex){
		for(var i=centerPageIndex-2;i<centerPageIndex+2;i++){
			if(i<0 || i>TOTAL_PAGE_COUNT-1){
				return;
			}
			
		}
	};
	
	function mouseUpHandler( event ) {

		for( var i = 0; i < flips.length; i++ ) {
			// If this flip was being dragged, animate to its destination
			if( flips[i].dragging ) {
				// Figure out which page we should navigate to
				if( mouse.x < 0 ) {
					flips[i].target = -1;
					page = Math.min( page + 1, flips.length );
					currentPageText.text(page+1);
				}
				else {
					flips[i].target = 1;
					page = Math.max( page - 1, 0 );
					currentPageText.text(page+1);
				}
			}
			
			flips[i].dragging = false;
		}
		document.removeEventListener( "mousemove", mouseMoveHandler, false );
		document.removeEventListener( "mouseup", mouseUpHandler, false );
		showNearByImage(page);
	}
	
	//var debugCount=0;
	var fx=0;
	var fw=0;
	var isAnyPagePlaying=false;
	
	function render() {
		
		// Reset all pixels in the canvas
		var clearX=CANVAS_PADDING + fx;
		var clearY=CANVAS_PADDING;
		
		//debug("clearX=="+clearX+",  clearY=="+clearY+",  fw=="+fw+",  PAGE_HEIGHT=="+PAGE_HEIGHT);
		//debug("clearX=========="+clearX+",  fw============="+fw);
		context.clearRect(clearX-30, 0,fw+100,canvas.height);//(0,0,canvas.width, canvas.height );
		
		for( var i = 0, len = flips.length; i < len; i++ ) {
			var flip = flips[i];
			
			if( flip.dragging ) {
				flip.target = Math.max( Math.min( mouse.x / PAGE_WIDTH, 1 ), -1 );
			}
			
			// Ease progress towards the target value 
			flip.progress += ( flip.target - flip.progress ) * 0.4;
			
			
			/*if(isGotoPage&& debugCount<=100){
				debugCount++;
				debug("flip.progress===="+flip.progress+",  flip.target==="+flip.target);
			}*/
			// If the flip is being dragged or is somewhere in the middle of the book, render it
			if( flip.dragging || Math.abs( flip.progress ) < 0.997 ) { 
				/*if(isGotoPage&& debugCount<=100){
					debugCount++;
					debug("flip.dragging+++++++++++++++++++++++++");
				}*/
				drawFlip( flip );
			}			
		}		
	}
	
	function drawFlip( flip ) {
		// Strength of the fold is strongest in the middle of the book
		var strength = 1 - Math.abs( flip.progress );
		// Width of the folded paper
		var foldWidth = ( PAGE_WIDTH * 0.5 ) * ( 1 - flip.progress );
		
		// X position of the folded paper
		var foldX = PAGE_WIDTH * flip.progress + foldWidth;
		fx=(1+flip.progress)*PAGE_WIDTH;
		fw=foldWidth;
		
		// How far the page should outdent vertically due to perspective
		var verticalOutdent = 20 * strength;
		
		// The maximum width of the left and right side shadows
		var paperShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( 1 - flip.progress, 0.5 ), 0 );
		var rightShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( strength, 0.5 ), 0 );
		var leftShadowWidth = ( PAGE_WIDTH * 0.5 ) * Math.max( Math.min( strength, 0.5 ), 0 );
		
		
		
		// Change page element width to match the x position of the fold
		flip.page.style.width = Math.max(foldX, 0) + "px";
		//( BOOK_WIDTH / 2 
		context.save();
		context.translate( CANVAS_PADDING +PAGE_WIDTH+15 , PAGE_Y + CANVAS_PADDING );
		
		/*canvas.width=foldWidth;
		canvas.height=PAGE_HEIGHT;
		canvas.style.left=foldX;
		canvas.style.top=20;*/
		
		// Draw a sharp shadow on the left side of the page
		/*context.strokeStyle = 'rgba(0,0,0,'+(0.05 * strength)+')';
		context.lineWidth = 30 * strength;
		context.beginPath();
		context.moveTo(foldX - foldWidth, -verticalOutdent * 0.5);
		context.lineTo(foldX - foldWidth, PAGE_HEIGHT + (verticalOutdent * 0.5));
		context.stroke();*/
		
		
		// Right side drop shadow
		/*var rightShadowGradient = context.createLinearGradient(foldX, 0, foldX + rightShadowWidth, 0);
		rightShadowGradient.addColorStop(0, 'rgba(0,0,0,'+(strength*0.2)+')');
		rightShadowGradient.addColorStop(0.8, 'rgba(0,0,0,0.0)');
		
		context.fillStyle = rightShadowGradient;
		context.beginPath();
		context.moveTo(foldX, 0);//
		context.lineTo(foldX + rightShadowWidth, 0);
		context.lineTo(foldX + rightShadowWidth, PAGE_HEIGHT);
		context.lineTo(foldX, PAGE_HEIGHT);
		context.fill();
		
		
		// Left side drop shadow
		var leftShadowGradient = context.createLinearGradient(foldX - foldWidth - leftShadowWidth, 0, foldX - foldWidth, 0);
		leftShadowGradient.addColorStop(0, 'rgba(0,0,0,0.0)');
		leftShadowGradient.addColorStop(1, 'rgba(0,0,0,'+(strength*0.15)+')');
		
		context.fillStyle = leftShadowGradient;
		context.beginPath();
		context.moveTo(foldX - foldWidth - leftShadowWidth, 0);//
		context.lineTo(foldX - foldWidth, 0);
		context.lineTo(foldX - foldWidth, PAGE_HEIGHT);
		context.lineTo(foldX - foldWidth - leftShadowWidth, PAGE_HEIGHT);
		context.fill();
	*/
		
		// Gradient applied to the folded paper (highlights & shadows)
		var foldGradient = context.createLinearGradient(foldX - paperShadowWidth, 0, foldX, 0);
		foldGradient.addColorStop(0.35, '#fafafa');
		foldGradient.addColorStop(0.73, '#eeeeee');
		foldGradient.addColorStop(0.9, '#fafafa');
		foldGradient.addColorStop(1.0, '#e2e2e2');
		
		context.fillStyle = foldGradient;
		context.strokeStyle = 'rgba(0,0,0,0.06)';
		context.lineWidth = 0.5;
		
		// Draw the folded piece of paper
		context.beginPath();
		context.moveTo(foldX, 0);//
		context.lineTo(foldX, PAGE_HEIGHT);
		context.quadraticCurveTo(foldX, PAGE_HEIGHT + (verticalOutdent * 2), foldX - foldWidth, PAGE_HEIGHT + verticalOutdent);
		context.lineTo(foldX - foldWidth, -verticalOutdent);
		context.quadraticCurveTo(foldX, -verticalOutdent * 2, foldX, 0);
		
		/*context.strokeStyle = 'rgba(0,0,0,0.06)';
		context.beginPath();
		context.moveTo(foldX, 0);
		context.lineTo(foldX, PAGE_HEIGHT);
		context.lineTo(foldX - foldWidth, PAGE_HEIGHT);
		context.lineTo(foldX - foldWidth, 0);
		context.lineTo(foldX , 0);*/
		
		context.fill();
		context.stroke();
		
		
		context.restore();
	}
	/*if(isiOS){
		alert("isiOS*************");
		$("#btnLast").addEventListener("touchend",gotoLast,false);
		//$("#btnLast").touchend(gotoLast);
		$("#btnRight").touchend(gotoNext);
		$("#btnLeft").touchend(gotoPrevious);
		$("#btnFirst").touchend(gotoFirst);
	}else{*/
	//debug("addEventListener");
	//$("#btnLast").addEventListener("touchend",gotoLast,false);
	$("#btnLast").mouseup(gotoLast);
	$("#btnRight").mouseup(gotoNext);
	$("#btnLeft").mouseup(gotoPrevious);
	$("#btnFirst").mouseup(gotoFirst);
	//debug("addEventListener33333333333333");
	//}
});
$(document).ready(myFun);


