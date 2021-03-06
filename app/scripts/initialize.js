import {PostsService, POST_TYPE_PROJECT, POST_TYPE_INSTAGRAM, POST_TYPE_PRESS} from './posts';
import {BubblesService} from './bubbles';
import {BubbleNodesService} from './bubbleNodes';
import {LightboxService} from './lightbox';


let screenHeight = 0;

let lightboxSrv;

let postSrv;
let bubbleSrv;
let bubbleNodesSrv;

let bubblesParent;


function debounce(func, threshold, execAsap) {
  let timeout;

  return function debounced () {
    let obj = this, args = arguments;
    let delayed = () => {
      if (!execAsap)
        func.apply(obj, args);
      timeout = null;
    };

    if (timeout)
      clearTimeout(timeout);
    else if (execAsap)
      func.apply(obj, args);

    timeout = setTimeout(delayed, threshold || 100);
  };
}

function setMouseListeners() {
  let navShow = () => {
    $('.nav').addClass('nav-active');
    $('.nav-toggle').addClass('toggle-active');
  };
  $('.nav-toggle').click(navShow);

  let navHide = () => {
    $('.nav').removeClass('nav-active');
    $('.nav-toggle').removeClass('toggle-active');
  };

  $('.nav-close').click(navHide);
  $('html, body').click(navHide);

  $('.nav, .nav-toggle').click(event => event.stopPropagation());

  let filterPostsClick = type => {
    navHide();
    onFilterPosts(type);
  };

  $('.nav .home-link')    .click(() => filterPostsClick());
  $('.nav .projects-link').click(() => filterPostsClick(POST_TYPE_PROJECT));
  $('.nav .press-link')   .click(() => filterPostsClick(POST_TYPE_PRESS));
  $('.nav .gallery-link') .click(() => filterPostsClick(POST_TYPE_INSTAGRAM));
}

function setBioLightbox() {
  let bioLightboxShow = () => {
    $('.nav').removeClass('nav-active');
    $('.nav-toggle').removeClass('toggle-active');
    $('.bio-lightbox').addClass('lightbox-active')
  };

  let bioLightboxHide = () => {
    $('.bio-lightbox').removeClass('lightbox-active');
  };

  $('.nav .bio-link').click(bioLightboxShow);
  $('.bio-lightbox .close-button').click(bioLightboxHide);
}

function scrollMagicInit() {
  let controller = new ScrollMagic.Controller({container: ".bubbles"});

  let timeline = new TimelineLite();
  let tweens = [
    TweenLite.to('.art-1',  1, {xPercent: -220, yPercent: 100,  ease: Power1.easeIn }),
    TweenLite.to('.art-2',  1, {xPercent: -150, yPercent: 52,   ease: Power1.easeIn }),
    TweenLite.to('.art-3',  1, {xPercent: -208, yPercent: -56,  ease: Power1.easeIn }),
    TweenLite.to('.art-4',  1, {xPercent: -218, yPercent: -80,  ease: Power1.easeIn }),
    TweenLite.to('.art-5a', 1, {xPercent: -100, yPercent: -250, ease: Power1.easeIn }),
    TweenLite.to('.art-5b', 1, {xPercent: 200,  yPercent: -250, ease: Power1.easeIn }),
    TweenLite.to('.art-6',  1, {xPercent: -420, yPercent: -395, ease: Power1.easeIn }),
    TweenLite.to('.art-7',  1, {xPercent: 109,  yPercent: 2,    ease: Power1.easeIn }),
    TweenLite.to('.art-8',  1, {xPercent: 350,  yPercent: 150,  ease: Power1.easeIn }),
    TweenLite.to('.art-9',  1, {xPercent: 146,  yPercent: -84,  ease: Power1.easeIn }),
    TweenLite.to('.art-10', 1, {xPercent: 245,  yPercent: 210,  ease: Power1.easeIn }),
    TweenLite.to('.art-11', 1, {xPercent: 250,  yPercent: -250, ease: Power1.easeIn }),
    TweenLite.to('.art-12', 1, {xPercent: 150,  yPercent: 129,  ease: Power1.easeIn }),
    TweenLite.to('.art-13', 1, {xPercent: 336,  yPercent: 160,  ease: Power1.easeIn })

  ];
  timeline
    .add(tweens);

  new ScrollMagic.Scene({
    triggerElement: ".trigger",
    triggerHook: 0,
    duration: '70%'
  })
    .setTween(timeline)
    .addIndicators({name: "1"})
    .addTo(controller);

  $('body .footer').nextAll().css({'visibility': 'hidden'});

  $('.bubbles .invis + div').css({'visibility': 'hidden'});



  let bubbles = document.querySelectorAll('.bubble_type_xl');
  for (let bubble of bubbles) {
    new ScrollMagic.Scene({
      triggerElement: bubble,
      triggerHook: 'onEnter',
      duration: '120%'
    })
      .setTween(bubble, {y: '200', z: '0.01'})
      .addTo(controller);
  }

  bubbles = document.querySelectorAll('.bubble_type_m');
  for (let bubble of bubbles) {
    new ScrollMagic.Scene({
      triggerElement: bubble,
      triggerHook: 'onEnter',
      duration: '120%'
    })
      .setTween(bubble, {y: '-100', z: '0.01'})
      .addTo(controller);
  }

  bubbles = document.querySelectorAll('.bubble_type_s');
  for (let bubble of bubbles) {
    new ScrollMagic.Scene({
      triggerElement: bubble,
      triggerHook: 'onEnter',
      duration: '120%'
    })
      .setTween(bubble, {y: '-200', z: '0.01'})
      .addTo(controller);
  }
}

function onFilterPosts(type) {
  let posts = postSrv.getFilteredPosts(type);
  let bubbles = bubbleSrv.process(posts);
  bubbleNodesSrv.process(bubbles);
}

$(document).ready(() => {
  screenHeight = $(window).height();

  setMouseListeners();
  setBioLightbox();

  bubblesParent = $('.bubbles');

  lightboxSrv = new LightboxService();

  postSrv = new PostsService();
  let posts = postSrv.process();

  bubbleSrv = new BubblesService(screenHeight, bubblesParent.width());
  let bubbles = bubbleSrv.process(posts);

  let bubbleClick = post => {
    lightboxSrv.callLightbox(post);
  };

  bubbleNodesSrv = new BubbleNodesService(bubblesParent.get(0), bubbleClick, screenHeight);
  bubbleNodesSrv.process(bubbles);

  scrollMagicInit();

  $('.art').css({
    width: $(window).width() + 'px',
    height: $(window).height() + 'px'
  });

  $(window).on('resize', debounce(() => {
    $('.art').css({
      width: $(window).width() + 'px',
      height: $(window).height() + 'px'
    })

  }, 600, false));

});
