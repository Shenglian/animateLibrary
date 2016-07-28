//  TODO:
// INFINITE 		DONE
// PRVE AND NEXT 
// SET SECOND
// DOT              DONE
// 橫向兩則圖片

(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.Swipe = factory();
	}
}(this, function() {

	function Swipe(el, option){
		this._option = option || {
			image: null,
			infinite: false,
			dot: false
		};

		this._current = option.infinite === true ? 1 : 0;

		this._el = el;
		this._parentNodeWidth = el.parentNode.clientWidth;
		this._eLen = el.children.length;
		// infinite 會多兩個
		this._eArrayLen = option.infinite === true ? el.children.length + 1 : el.children.length - 1;

		this._dotHTML = '';

		this._pageX = null;
		this._pageY = null;

		this._fingerMove = 0;

		this._width = null;
		this._height = null;

	 	this.timer = null;

	 	this._handlerResizeFn = this.resizeFix.bind(this);

		// init
		this.init();
	}

	Swipe.prototype.cloneItem = function(){
		var _firstChild = this._el.children[0];
		var _firstItemClone = this._el.firstElementChild.cloneNode(true);
		var _lastItemClone = this._el.lastElementChild.cloneNode(true);

		// Clone 一前一後 
		this._el.appendChild(_firstItemClone);
		this._el.insertBefore(_lastItemClone,  _firstChild.previousSibling);
	};

	Swipe.prototype.setLayoutSize = function(){	

		// resizeValue
		this._parentNodeWidth = this._el.parentNode.clientWidth;

		// if (window.orientation === 0) {
			this._width = this._parentNodeWidth;

			this.setX(this._el, this._width * this._current * -1);
			this.setLayoutType('straight');
			
		// } else {
		// 	this.current = (Math.floor(this.current / 2));

		// 	this._width = this._parentNodeWidth / 2;

		// 	this.setX(this._el, this._width * this._current * 2 * -1);
		// 	this.setLayoutType('horizontal');
		// }

		this._el.style.width = this._width * this._el.children.length + 'px';
		return this;
	};

	Swipe.prototype.setLayoutType = function(layout){
		var image = document.querySelectorAll(this._option.image),
			len = image.length;

		switch(layout){
			case 'straight':
				for(var i = 0; len > i; i++){
					image[i].style.width = this._el.parentNode.clientWidth + 'px';
				}
			break;

			case 'horizontal':
				for(var j = 0; len > j; j++){
					image[j].style.width = this._el.parentNode.clientWidth / 2 + 'px';
				}
			break;
		}
	};

	Swipe.prototype.bindEvents = function(){
		var self = this;
		var evt = "onorientationchange" in window ? "orientationchange" : "resize";

		if (evt === 'resize') {
			window.addEventListener('resize', this._handlerResizeFn, false);
		} else {
			window.addEventListener('orientationchange', self.setLayoutSize.bind(self), false);
		}

		'touchstart touchmove touchend'.split(' ').forEach(function(evn){
			self._el.addEventListener(evn, self[evn].bind(self), false);
		});

		if (self._option.infinite === true) {
			self._el.addEventListener('webkitTransitionEnd', function(event) { 
				if (self._current === 0) {
					self._el.classList.remove('animate');
					self.setX(self._el, self._width * (self._eLen) * -1);

					self._current = self._eLen;
				}

				if (self._current === self._eLen + 1) {
					self._el.classList.remove('animate');
					self.setX(self._el, self._width * -1);

					self._current = 1;
				}
			},false);	
		}	
	};

	Swipe.prototype.resizeFix = function(){
		var self = this;
		if (this.timer) {
			clearTimeout(this.timer);
		}
		this.timer = setTimeout(function(){
			self.setLayoutSize();
		}, 100);
	};

	// Get touch start point value
	Swipe.prototype.touchstart = function(e){

		// addAnimate
		this._el.classList.add('animate');

		var touches = e.touches[0];

		this._pageX = touches.pageX;
		this._pageY = touches.pageY;
	};

	Swipe.prototype.touchmove = function(e){
		var touches = e.touches[0];

		// END - START
		var X = touches.pageX - this._pageX;
		var Y = touches.pageY - this._pageY;

		this._fingerMove = X;

		e.preventDefault();
	    e.stopPropagation();

	    // if(window.orientation === 0){
	    	this.setX(this._el, X - this._width * this._current);
	    // } else {
	    // 	this.setX(this._el, X - this._width * this._current * 2);
	    // }
	};

	Swipe.prototype.touchend = function(e){

		var minRange = 50;

		// if(window.orientation === 0){
			if(this._fingerMove < minRange){
				if(this._current < this._eArrayLen) {
					this._current++;
					if (this._option.dot === true) { this.moveDot(this._current); }
				}
				return this.next(this._width); 
			}

			if(this._fingerMove > minRange){
				if(this._current > 0) { 
					this._current--;
					if (this._option.dot === true) { this.moveDot(this._current); }
				}
				return this.prev(this._width);
			}
		// } else {
		// 	if(this._fingerMove < minRange){ 
		// 		if(this._current < Math.floor(this._eArrayLen / 2)){
		// 			this._current++;	
		// 		}
		// 		return this.next(this._width); 
		// 	}
		// 	if(this._fingerMove > minRange){ 
		// 		if(this._current > 0) { this._current--; }
		// 		return this.prev(this._width);
		// 	}
		// }


	};

	Swipe.prototype.setX = function(el, x, unit){
		el && (el.style.webkitTransform = 'translate3d(' + x + (unit || 'px') + ',0,0)');
	};

	Swipe.prototype.next = function(width) {
		// if(window.orientation === 0){
			this.setX(this._el, width * this._current * -1);
		// } else {
		// 	this.setX(this._el, width * this._current * -1 * 2);
		// }
	};

	Swipe.prototype.prev = function(width) {
		// if(window.orientation === 0){
			this.setX(this._el, width * this._current * -1);
		// } else {
		// 	this.setX(this._el, width * this._current * -1 * 2);
		// }
	};

	Swipe.prototype.setDot = function(){
		var swipeDotSection = document.getElementById('swipe_dot_section');

		for (var z = 0; this._eLen > z; z++){
			this._dotHTML += '<div class="swipe_dot"></div>';
		}

		swipeDotSection.innerHTML = this._dotHTML;
	};

	Swipe.prototype.moveDot = function(index){
		var children = document.getElementById('swipe_dot_section').children;
		var childrenLen = children.length;

		for (var g = 0; childrenLen > g; g++) {
			if (children[g].classList.contains('active')) {
				children[g].classList.remove('active');
			}
		}

		if (this._option.infinite === true) {
			if (index > childrenLen) {
				index = 1;
			}

			if (index <= 0) {
				index = childrenLen;	
			}

			children[index - 1].classList.add('active');
		} else {
			children[index].classList.add('active');
		}
	};

	Swipe.prototype.destory = function(){
		var self = this;
		window.removeEventListener('resize', this._handlerResizeFn, false);
	};

	Swipe.prototype.init = function(){
		if (this._option.infinite === true) { this.cloneItem(); }
		if (this._option.dot === true) { this.setDot(); this.moveDot(this._current); }
		this.setLayoutSize().bindEvents();
	};

	return Swipe;

}));