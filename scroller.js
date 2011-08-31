//=========================================================
// custom scroller developed for 2027.org by aaron boodman
//
// some sections based on ypSimpleScroll.js.
//
// www.youngpup.net
// 3/28/2001 (3 hours before site launch!)
//
// updated 
// - 8/29/02 : fixed performance issues related to using
//   background images
//=========================================================
// code is art!
//=========================================================

var Scroller = {
	speed			: 100,
	aniLen			: 1000,
	clipH			: 253,
	thumbMax		: 223,
	thumbH			: 14,
	scrollbarH		: 237,
	scrollTop		: 0,
	scrollLeft		: 0,
	minRes			: 10,
	ie4				: navigator.appName == "Microsoft Internet Explorer" && !document.getElementById,
	ns4				: document.layers ? 1 : 0,
	dom				: document.getElementById ? 1 : 0,
	mac				: navigator.platform == "MacPPC",
	mo5				: navigator.userAgent.indexOf("Gecko") != -1,

	imgElevBack1	: ypImage("elevator1.gif"),
	imgElevBack2	: ypImage("elevator2.gif"),
	imgElevBack3	: ypImage("elevator3.gif"),

	imgThumb1		: ypImage("thumb1.gif"),
	imgThumb2		: ypImage("thumb2.gif"),

	imgUp1			: ypImage("scrollUp1.gif"),
	imgUp2			: ypImage("scrollUp2.gif"),
	imgUp3			: ypImage("scrollUp3.gif"),
	imgDn1			: ypImage("scrollDn1.gif"),
	imgDn2			: ypImage("scrollDn2.gif"),
	imgDn3			: ypImage("scrollDn3.gif"),

	dir:0,lastTime:0,aniTimer:0,dragActive:0,dragLastY:0,dragStartOffset:0,
	startPos:0,startTime:0,accel:0,endPos:0,dist:0
}

Scroller.init = function() {
	with (this) {
		// gather pieces
		this.lyrFrame			= getLyr("scroller", document)
		this.lyrScrollbar		= getLyr("scrollbar", lyrFrame)
		this.lyrThumb			= getLyr("thumb", lyrScrollbar)
		this.lyrMarker			= getLyr("marker", lyrScrollbar)
		this.lyrElevUp			= getLyr("elevUp", lyrScrollbar)
		this.lyrElevDn			= getLyr("elevDn", lyrScrollbar)
		this.lyrScrollUp		= getLyr("scrollUp", lyrFrame)
		this.lyrScrollDn		= getLyr("scrollDn", lyrFrame)
		this.lyrThumbArrowUp	= getLyr("thumbArrowUp", lyrScrollbar)
		this.lyrThumbArrowDn	= getLyr("thumbArrowDn", lyrScrollbar)
		this.lyrContainer		= getLyr("container", lyrFrame)
		this.lyrContent			= getLyr("content", lyrContainer)

		// calculate some values
		this.docH				= Math.max(ns4 ? lyrContent.document.height : lyrContent.offsetHeight, clipH)
		this.scrollH			= docH - clipH

		if (this.docH > clipH) {
			// hook events
			lyrElevUp.onmousedown   = slideTo
			lyrElevDn.onmousedown	= slideTo
			lyrThumb.onmousedown    = startDrag
			lyrThumb.onmouseover    = function() { Scroller.toggleThumb(true) }
			lyrThumb.onmouseout     = function() { Scroller.toggleThumb(false) }
			lyrThumb.ondragstart	= function() { return false; }
			lyrElevUp.onmouseover   = function() { Scroller.toggleElev(Scroller.lyrElevUp, 2) }
			lyrElevUp.onmouseout    = function() { Scroller.toggleElev(Scroller.lyrElevUp, 1) }
			lyrElevDn.onmouseover	= function() { Scroller.toggleElev(Scroller.lyrElevDn, 2) }
			lyrElevDn.onmouseout	= function() { Scroller.toggleElev(Scroller.lyrElevDn, 1) }
			lyrScrollDn.onmouseover = function() { Scroller.toggleButton("Dn", 2); Scroller.startScroll('+'); }
			lyrScrollDn.onmousedown = function() { Scroller.toggleButton("Dn", 3); Scroller.speed = 350; return false }
			lyrScrollDn.onmouseup   = function() { Scroller.toggleButton("Dn", 2); Scroller.speed = 100 }
			lyrScrollDn.onmouseout  = function() { Scroller.toggleButton("Dn", 1); Scroller.endScroll() }
			lyrScrollUp.onmouseover = function() { Scroller.toggleButton("Up", 2); Scroller.startScroll('-') }
			lyrScrollUp.onmousedown = function() { Scroller.toggleButton("Up", 3); Scroller.speed = 350; return false }
			lyrScrollUp.onmouseup   = function() { Scroller.toggleButton("Up", 2); Scroller.speed = 100 }
			lyrScrollUp.onmouseout  = function() { Scroller.toggleButton("Up", 1); Scroller.endScroll() }

			// initialize some settings
			lyrThumb.s.top = 0

			// ns4 bullshit.
			if (document.layers) { 
				lyrThumb.captureEvents(Event.MOUSEDOWN)
				lyrElevDn.captureEvents(Event.MOUSEDOWN | Event.MOUSEMOVE)
				lyrElevUp.captureEvents(Event.MOUSEDOWN | Event.MOUSEMOVE)
				lyrScrollUp.captureEvents(Event.MOUSEDOWN | Event.MOUSEUP)
				lyrScrollDn.captureEvents(Event.MOUSEDOWN | Event.MOUSEUP)
			}

			// mozilla5 bullshit.
			if (mo5) document.getElementById("scrollerMo5Shim").style.height = docH
		} 
		else 
		{
			this.lyrScrollbar.s.visibility = 
				this.lyrScrollUp.s.visibility =
				this.lyrScrollDn.s.visibility = 
				'hidden';
		}

		// all done!
		this.loaded = true
	}
}

Scroller.startScroll = function(dir) {
	if (this.aniTimer) window.clearTimeout(this.aniTimer)

	this.dir		= dir
	this.lastTime	= (new Date()).getTime() - this.minRes
	this.startPos	= this.scrollTop
	this.aniTimer	= window.setTimeout("Scroller.scroll()", this.minRes)
}

Scroller.scroll = function() {
	this.aniTimer	= window.setTimeout("Scroller.scroll()", this.minRes)
	var now			= (new Date()).getTime()
	var elapsed		= now - this.lastTime
	var ny			= eval(this.scrollTop + this.dir + (elapsed * this.speed / 1000))
	this.lastTime	= now
	if (ny > this.scrollH && this.dir == "+" || ny < 0 && this.dir == "-") {
		this.endScroll()
		this.jumpTo(this.dir == "+" ? this.scrollH : 0)
	}
	else this.jumpTo(ny)
}

Scroller.endScroll = function() {
	if (this.aniTimer) this.aniTimer = window.clearTimeout(this.aniTimer)
}

Scroller.startDrag = function(e) {
	if (!e) e = window.event
	with (Scroller) {
		if (aniTimer) window.clearTimeout(aniTimer)
		var ey = e.pageY ? e.pageY : e.y
		dragLastY = ey
		dragStartOffset = ey - parseInt(lyrThumb.s.top)
		dragActive = true
		if (ns4) window.document.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP)
		window.document.onmousemove = doDrag
		window.document.onmouseup = stopDrag
	}
	return false
}

Scroller.doDrag = function(e) {
	if (!e) e = window.event
	var s  = Scroller
	var ey = (e.pageY ? e.pageY : e.y)
	var dy = ey - s.dragLastY
	var ny = parseInt(Scroller.lyrThumb.s.top) + dy

	// constrain
	if (ny >= s.thumbMax) s.dragLastY = s.thumbMax + s.dragStartOffset
	else if (ny < 0) s.dragLastY = s.dragStartOffset
	else s.dragLastY = ey
	ny = Math.min(Math.max(ny, 0), s.thumbMax)

	s.jumpTo(ny * s.scrollH / s.thumbMax)
	return false;
}

Scroller.positionThumbArrows = function(ny) {
	this.lyrThumbArrowUp.s.top = ny - 6
	this.lyrThumbArrowDn.s.top = ny + 15
}

Scroller.stopDrag = function() {
	Scroller.dragActive = false
	Scroller.toggleThumb(false)
	if (Scroller.ns4) window.document.releaseEvents(Event.MOUSEMOVE | Event.MOUSEUP)
	window.document.onmousemove = null
	window.document.onmouseup   = null
}

// slideTo gets called in the scope of lyrElevUp or lyrElevDn
Scroller.slideTo = function(e) {
	if (!e) e = window.event
	var ey = e.offsetY ? e.offsetY : e.layerY
	if (typeof ey == "undefined") ey = 0
	var ny = (this.id == "elevDn") ? ey-14 : ey
	ny += this.s.top == "" ? 0 : parseInt(this.s.top)
	ny *= Scroller.scrollH / Scroller.thumbMax
	ny = Math.min(ny, Scroller.scrollH)

	with (Scroller) {
		startTime = (new Date()).getTime()
		startPos = scrollTop
		endPos = ny
		dist = endPos - startPos
		accel = dist / 1000 / 1000
		if (aniTimer) aniTimer = window.clearInterval(aniTimer)
		aniTimer = window.setInterval("Scroller.slide()", 10)
	}
}

Scroller.slide = function() {
	with (this) {
		var now = (new Date()).getTime()
		var elapsed = now - startTime
		if (elapsed > 1000) endScroll()
		else {
			var t = 1000 - elapsed
			var ny = endPos - t * t * accel
			jumpTo(ny)
		}
	}
}

Scroller.jumpTo = function(ny) {
	var thumbTop = ny * this.thumbMax / this.scrollH
	this.lyrElevUp[document.layers ? "clip" : "style"].height = thumbTop
	this.lyrElevDn[document.layers ? "clip" : "style"].height = this.scrollbarH - thumbTop
	this.lyrElevDn.s.top = thumbTop
	this.lyrThumb.s.top = thumbTop
	this.lyrContent.s.top = -ny
	this.positionThumbArrows(ny * this.thumbMax / this.scrollH)
	this.scrollTop = ny
}

Scroller.toggleThumb = function(bOn) {
	var img = this.getFirstImage(this.lyrThumb)
	img.src = !bOn && !this.dragActive ? this.imgThumb1.src : this.imgThumb2.src
	if (!bOn && !this.dragActive) this.toggleThumbArrows(false)
	else {
		this.positionThumbArrows(parseInt(this.lyrThumb.s.top))
		this.toggleThumbArrows(true)
	}
}

Scroller.toggleThumbArrows = function(bOn) {
	this.lyrThumbArrowUp.s.visibility = bOn ? "visible" : "hidden"
	this.lyrThumbArrowDn.s.visibility = bOn ? "visible" : "hidden"
}

Scroller.toggleElev = function(lyr, iState) {
	var img = this["imgElevBack" + iState];
	with (this) {
		if (document.layers) lyr.document.images[0].src = img.src;
		else lyr.firstChild.src = img.src;
		lyr.onmousemove = iState == 2 ? moveMarker : null
		if (iState == 1) lyrMarker.s.visibility = "hidden"
	}
}

Scroller.moveMarker = function(e) {
	with (Scroller) {	
		if (!lyrThumb.active) {
			if (!e) e = window.event
			var ey = e.layerY ? e.layerY : e.offsetY
			if (isNaN(ey)) ey = 0
			var ny = Math.round(ey / 2) * 2
			ny += (this.s.top == "" ? 0 : parseInt(this.s.top))
			ny -= 1
			lyrMarker.s.top = ny
			lyrMarker.s.visibility = "visible"
		}
	}
}

Scroller.toggleButton = function(suffix, iState) {
	var lyr = eval("Scroller.lyrScroll" + suffix)
	var img = this.getFirstImage(lyr)
	img.src = "scroll"+suffix+iState+".gif"
}

Scroller.getLyr = function(sLyrId, oNestRef) {
	var o
	if (document.all) o = oNestRef.all[sLyrId]
	else if (document.layers) o = oNestRef.layers[sLyrId]
	else o = this.recursiveNs6Get(sLyrId, oNestRef)
	o.s = document.layers ? o : o.style
	return o
}

// this is kinda slow for ns6 -> 
// but best way I could think of w/o totally bloating the code.
Scroller.recursiveNs6Get = function(id, p) {
	if (p.childNodes) {
		for (var i = 0; i < p.childNodes.length; i++) {
			if (p.childNodes[i].id == id) return p.childNodes[i]
			else if (p.childNodes[i].childNodes.length > 0) {
				var obj = Scroller.recursiveNs6Get(id, p.childNodes[i])
				if (obj && obj != null) return obj
			}
		}
	}
	return false
}

Scroller.getFirstImage = function(lyr) {
	return document.layers ? lyr.document.images[0] : document.all ? lyr.all.tags("IMG")[0] : lyr.getElementsByTagName("IMG")[0]
}

function ypImage(s) {
	var oImg  = new Image()
	oImg.src = s
	return oImg
}

function dbg(obj) {
	var s = ""
	for (prop in obj) s += prop + ":" + obj[prop] + "\n"
	alert(s)
}