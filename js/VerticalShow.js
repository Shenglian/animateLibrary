(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.VerticalShow = factory();
	}
}(this, function() {

	class VerticalShow {
		constructor({
			inViewBox,
			boxs,
			maxOutline = 4,
			second = 1000,
		} = {}) {
			// init
			this.inViewBox = inViewBox
			
			this.boxs = boxs
			
			this.distance = this.boxs.children[0].offsetHeight
			
			this.maxOutline = maxOutline
			this.timeID = null
			this.boxTotalLen = this.boxs.children.length
			this.index = this.boxs.children.length
			this.second = second

			this.last = 0

			this.init()
		}

		init() {
			this.cloneChilds(this.boxs, this.maxOutline)

			this.boxs.style.webkitTransform = `translate3d(0, -${this.distance * this.index}px, 0)`
			this.inViewBox.style.overflow = 'hidden'
			this.inViewBox.style.height = `${this.distance * this.maxOutline}px`

			this.bindEvent();

			this.start();
		}

		goAnimate(now) {
			this.timeID = requestAnimationFrame(() => {
				if (!this.last || now - this.last >= this.second) {
					this.last = now

					this.index === 0 
					? this.index = this.boxTotalLen - this.maxOutline
					: this.index--;
				
					this.move(this.distance * this.index, false)	
				}
				this.timeID = requestAnimationFrame(this.goAnimate.bind(this, new Date().getTime()))
			})
		}

		bindEvent() {
			this.boxs.addEventListener('transitionend', e => {
				if (this.index === 0) {
					this.index = this.boxTotalLen - this.maxOutline;
					this.move(this.distance * this.index, true)
				}
			})
		}

		move(value, end) {
			this.boxs.style.webkitTransform = `translate3d(0, -${value}px, 0)`;
			this.boxs.style.webkitTransition = `transform ${end ? '0s' : '.3s ease-in'}`;
		}

		cloneChilds(originDom, nums) {
			const _originDomLen   = originDom.children.length;
			const _firstItemClone = originDom.children[0];
			let doms = [];

			for (let n = 1; n <= nums; n++) {
				doms.push(originDom.children[_originDomLen - n].cloneNode(true))
			}

			// 倒著排序
			for (let m = doms.length - 1; m >= 0; m--) {
				originDom.insertBefore(doms[m], _firstItemClone);
			}
			
			this.index += nums;
			this.boxTotalLen += nums;
		}

		destroyed() {
			cancelAnimationFrame(this.timeID)

			this.inViewBox = null
			this.boxs = null
			this.distance = null
			this.maxOutline = null
			this.timeID = null
			this.boxTotalLen = null
			this.index = null
			this.second = null
			this.last = null
		}
		
		pause() {
			cancelAnimationFrame(this.timeID)
		}
	
		start() {
			this.timeID = this.goAnimate.bind(this, new Date().getTime())()
		}
	}

	return VerticalShow;
}));