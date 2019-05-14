(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.SwipeCard = factory();
	}
}(this, function() {

  class SwipeCard {
    constructor({
      cardList,
      cards,
      cardDot,
      bodyWidth,
      gap = false,
      secondCardInitGap = 30
    } = {}) {
      this.cardList = cardList
      this.cards = cards
      this.cardDot = cardDot

      this.currentIndex = 0;

      this.bodyWidth = bodyWidth;
      this.leftRatio = 1.5; // 因為 css left 移動 50%, then 又 transform. 所以要補回來 

      this.pageX = null;
      this.pageY = null;

      this.fingerMove = null;

      this.distancePlus = 0

      this.durationTime = 0;

      this.gap = gap ? Math.round((this.bodyWidth - this.cards[0].clientWidth) / 2) : 0

      // this._mousemove = this.mousemove.bind(this);
      // this._mouseup = this.mouseup.bind(this);

      this.secondCardInitGap = secondCardInitGap
    }

    init() {
      this.bindEvents();
      this.setZindex();
      this.setTransform();
      this.setDot();

      this.setStyle(
        this.cards[this.currentIndex],
        this.gap
      )

      this.moveDot(this.currentIndex)
    }

    isMobile() {
      if (navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) {
        return true
      }
    }

    setTransform() {
      for (const c of Array.from(this.cards)) {
        this.setOriginStyle(c, this.gap)
        setTimeout(() => {
          c.style.transition = 'transform .5s'
        }, 0);
      }
    }

    bindEvents() {
      // 'touchstart touchmove touchend mousedown'.split(' ').forEach(evn => {
      'touchstart touchmove touchend'.split(' ').forEach(evn => {
        this.cardList.addEventListener(evn, this[evn].bind(this), false);
      });
    }

    // bindDesktopEvents() {
    //   document.addEventListener('mousemove', this._mousemove, false);
    //   document.addEventListener('mouseup', this._mouseup, false);
    // }

    setZindex() {
      for (const [index, c] of Array.from(this.cards).entries()) {
        c.style.zIndex = this.cards.length - index + 1
        c.dataset.id = this.cards.length - index + 1
      }
    }

    touchstart(e) {
      if (e.target.classList.contains('btn')) return

      let touches = e.touches[0];

      this.pageX = touches.pageX;
      this.pageY = touches.pageY;

      this.durationTime = +new Date;
    };

    touchmove(e) {
      if (e.target.classList.contains('btn')) return

      const touches = e.touches[0];

      // END - START
      const X = touches.pageX - this.pageX;
      const Y = touches.pageY - this.pageY;

      this.fingerMove = X;

      // e.preventDefault();
      // e.stopPropagation();

      this.setStyle(
        this.cards[this.currentIndex],
        X,
        'px',
        true
      );
    }

    touchend(e) {
      if (
        e.target.classList.contains('btn') ||
        this.fingerMove === null
      ) return

      const minRange = 50;

      const duration = +new Date - this.durationTime;
      // Number(duration) > 150 && 
      if (Math.abs(this.cards[0].clientWidth / 4) > Math.abs(this.fingerMove)) {
        this.setStyle(
          this.cards[this.currentIndex],
          this.gap
        )

        return
      }

      this.fingerMove < minRange
      ? this.next() 
      : this.prev()
    }

    next() {
      if (this.currentIndex === this.cards.length - 1) {
        this.setEndStyle(
          this.cards[this.currentIndex],
          this.gap,
          'px',
          true
        )
        this.fingerMove = null;

        return;
      }

      this.setEndStyle(
        this.cards[this.currentIndex],
        -(this.bodyWidth * this.leftRatio)
      )

      this.currentIndex += 1

      this.setStyle(
        this.cards[this.currentIndex],
        this.gap
      )

      this.moveDot(this.currentIndex)

      this.fingerMove = null;
    }

    prev() {
      if (this.currentIndex === 0) {
        this.setStyle(
          this.cards[this.currentIndex],
          this.gap
        )
        this.fingerMove = null;

        return;
      }

      this.setOriginStyle(
        this.cards[this.currentIndex],
        this.gap
      )

      this.currentIndex -= 1

      this.setStyle(
        this.cards[this.currentIndex],
        this.gap
      )

      this.moveDot(this.currentIndex)
      this.fingerMove = null;
    }

    // mousedown(e) {
    //   console.log('mousedown')

    //   if (e.target.classList.contains('btn') || this.isMobile()) return

    //   this.pageX = e.x;
    //   this.pageY = e.y;

    //   this.bindDesktopEvents();
    // }

    // mousemove(e) {
    //   console.log('mousemove')

    //   if (e.target.classList.contains('btn') || this.isMobile()) return

    //   // END - START
    //   const X = e.x - this.pageX;
    //   const Y = e.y - this.pageY;

    //   this.fingerMove = X;

    //   e.preventDefault();
    //   e.stopPropagation();

    //   this.setStyle(
    //     this.cards[this.currentIndex],
    //     X,
    //     'px',
    //     true
    //   );
    // }

    // mouseup(e) {
    //   console.log('mouseup')
    //   if (
    //     e.target.classList.contains('btn') || 
    //     this.isMobile() ||
    //     this.fingerMove === null) return

    //   const minRange = 50;

    //   if (this.fingerMove < minRange) {
    //     if (this.currentIndex === this.cards.length - 1) {
    //       this.setEndStyle(
    //         this.cards[this.currentIndex],
    //         this.gap,
    //         'px',
    //         true
    //       )

    //       this.destroyDesktopEvent();
    //       this.fingerMove = null;

    //       return;
    //     }

    //     this.setEndStyle(
    //       this.cards[this.currentIndex],
    //       -(this.bodyWidth * this.leftRatio)
    //     )

    //     this.currentIndex += 1

    //     this.setStyle(
    //       this.cards[this.currentIndex],
    //       this.gap
    //     )
    //   } else {
    //     console.log('desktop mouseDown')

    //     if (this.currentIndex === 0) {
    //       this.setStyle(
    //         this.cards[this.currentIndex],
    //         this.gap
    //       )

    //       this.destroyDesktopEvent();
    //       this.fingerMove = null;

    //       return;
    //     }

    //     this.setOriginStyle(
    //       this.cards[this.currentIndex],
    //       this.gap
    //     )

    //     this.currentIndex -= 1

    //     this.setStyle(
    //       this.cards[this.currentIndex],
    //       this.gap
    //     )
    //   }

    //   this.destroyDesktopEvent();
    //   this.fingerMove = null
    // }

    setDot() {
      let dot = '';

      for (let z = 0; this.cards.length > z; z++) {
        dot += '<div></div>';
      }

      this.cardDot.innerHTML = dot;
    };

    moveDot(index) {
      for (let z = 0; this.cardDot.children.length > z; z++) {
        this.cardDot.children[z].classList.remove('active')
      }

      this.cardDot.children[index].classList.add('active')
    }

    setOriginStyle(el, x) {
      el && (el.style.webkitTransform = `translate3d(${this.secondCardInitGap + x}px, -50%, 0) scale(.9)`);
    }

    setStyle(el, x, unit, active) {
      el && (el.style.webkitTransform = `translate3d(${x}${(unit || 'px')}, -50%, 0) ${active ? 'scale(.95)' : ''}`);
    };

    setEndStyle(el, x, unit, lastOne) {
      el && (el.style.webkitTransform = `translate3d(${x}${(unit || 'px')}, -50%, 0) ${lastOne ? '' : 'scale(.9)'}`);
    };

    // destroyDesktopEvent() {
    //   document.removeEventListener('mousemove', this._mousemove, false);
    //   document.removeEventListener('mouseup', this._mouseup, false);
    // }

    destroyed() {
      this.cardList = null
      this.cards = null
      this.cardDot = null
      this.pageX = null
      this.pageY = null
      this.currentIndex = null
      this.bodyWidth = null
      this.leftRatio = null
      this.fingerMove = null
      this.distancePlus = null
      this._mousemove = null
      this._mouseup = null
    }
  }

  return SwipeCard;
}));