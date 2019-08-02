(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.SwipeCard = factory();
	}
}(this, function() {

  function loadImage(url) {
    return new Promise((resolve, reject) => {
      let img = new Image()

      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  class SwipeCard {
    constructor({
      insertDom,
      imgs
    } = {}) {
      this.insertDom = insertDom
      this.imgs = imgs

      this.cardList = null
      this.cards = null

      this.currentIndex = 0;

      this.pageX = null;
      this.pageY = null;

      this.fingerMove = null;

      this.durationTime = 0;

      this.init()
    }

    setTemplate() {
      let template = ''

      template += '<div class="card_list">' 

      this.imgs.forEach((img, index) => {
        template += 
        `<a href="${img.link}" id="${index + 1}" class="cards innity-apps-card-${index + 1} innity-apps-card-transition">
          <div class="img" style="background-image: url(${img.imgUrl})"></div>
        </a>
        `
      });

      template += '<div class="</div>">' 

      this.insertDom.insertAdjacentHTML('afterbegin', template)
    }

    init() {
      let pr = [];
      
      this.imgs.forEach(url => {
        let p = 
          loadImage(url)
          .then(img => this.images.push(img))
          .catch(err => console.log(err))

        pr.push(p);
      })

      Promise
        .all(pr)
        .then(() => {
          this.setTemplate();

          this.cardList = document.body.querySelector('.card_list')
          this.cards = this.cardList.querySelectorAll('.cards')

          // set animate event for 2
          this.cards[2].addEventListener("animationend", e => {
            this.cardList.classList.remove('active')

            this.bindEvents();
          }, false);

          this.cardList.classList.add('active')
        });
    }

    bindEvents() {
      'touchstart touchmove touchend'.split(' ').forEach(evn => {
        this.cardList.addEventListener(evn, this[evn].bind(this), false);
      });
    }

    touchstart(e) {
      if (e.target.classList.contains('btn')) return

      let touches = e.touches[0];

      this.pageX = touches.pageX;
      this.pageY = touches.pageY;

      this.durationTime = +new Date;

      this.cards[this.currentIndex].classList.remove('innity-apps-card-transition')
      this.cards[this.currentIndex].classList.add('finger-apps-card')
    };

    touchmove(e) {
      if (e.target.classList.contains('btn')) return

      const touches = e.touches[0];

      // END - START
      const X = touches.pageX - this.pageX;
      const Y = touches.pageY - this.pageY;

      this.fingerMove = X;

      this.setStyle(this.cards[this.currentIndex], X, 'px');
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

        this.cards[this.currentIndex].classList.remove('finger-apps-card')
        this.cards[this.currentIndex].classList.add('innity-apps-card-transition')

        return
      }

      this.fingerMove < minRange
      ? this.next() 
      : this.next()
    }

    next() {
      this.fingerMove = null;

      this.cards[this.currentIndex].classList.remove('finger-apps-card')
      this.cards[this.currentIndex].classList.add('innity-apps-card-transition')

      this.currentIndex += 1

      if (this.currentIndex > 2) {
        this.currentIndex = 0
      }

      this.setStyle(
        this.cards[this.currentIndex],
        this.gap
      )

      this.fingerMove = null;
      
      this.renewClasses()
    }

    renewClasses() {
      let cards = document.body.querySelectorAll('.card_wrapper .card_list .cards');

      cards[0].classList.remove('innity-apps-card-1')
      cards[0].classList.add('innity-apps-card-3')

      cards[1].classList.remove('innity-apps-card-2')
      cards[1].classList.add('innity-apps-card-1')

      cards[2].classList.remove('innity-apps-card-3')
      cards[2].classList.add('innity-apps-card-2')

      this.cardList.insertBefore(
        cards[0], 
        cards.lastChild
      )

      cards[0].style = ''
    }

    setStyle(el, x, unit) {
      el && (el.style.left = `${x}${(unit || 'px')}`);
    };

    destroyed() {
      this.cardList = null
      this.cards = null
      this.pageX = null
      this.pageY = null
      this.currentIndex = null
      this.fingerMove = null
    }
  }

  return SwipeCard;
}));