!function ($, __shopping_cart_dependency__, undefined) {
  var ShoppingCart = __shopping_cart_dependency__,
      cart = new ShoppingCart('#shoppingCartContainer');



  // Hero Gallery Init
  $('#HeroWrapper').herogallery({
    imgStyles: ['pnl0', 'pnl1', 'pnl2', 'pnl3'],
    interval: 7000
  });

  $('#learnMoreBtn').on('click', function () {
    Sluice.scrollToId('#specs', 500);
  });

  // Toggle Full Specs Init
  $('#showAllSpecsBtn').on('click', function () {
    var $fullSpecContainer = $('#fullSpecContainer');

    if ($fullSpecContainer.hasClass('hide')) {
      $(this).html('Less specs');
      $fullSpecContainer.removeClass('hide').addClass('show');
    } else {
       $(this).html('More specs');
      $fullSpecContainer.removeClass('show').addClass('hide');
    }
  });

  // Intro Section Parallax
  $(window).on('scroll', function (evt) {
    var windowHeight     = $(this).height(),
        sectionOffset    = $('#introSection').offset().top,
        start            = 0,
        startLeftPercent = -30,
        leftPercent      = startLeftPercent,
        percentDelta     = Math.abs(startLeftPercent),
        scrollDelta      = 600;

    if (sectionOffset > windowHeight) {
      start = sectionOffset - windowHeight;
    }

    if ($(this).scrollTop() > start) {
      leftPercent = startLeftPercent +
        (percentDelta * (($(this).scrollTop() - start) / scrollDelta));
    }

    if (leftPercent > 0) {
      leftPercent = 0;
    }

    $('#introSectionParallaxBg').css('left', leftPercent + '%');
  });

  // Init Infographic
  animateInfographic($(window));


  /* Private Helper Functions
  ----------------------------------------------------------------------------*/
  /**
   * Add scroll animation to the infographic.
   */
  function animateInfographic($scroller) {
    $scroller.on('scroll', function() {
      if (isElementInViewport($('#infographicBottom').get(0), 0) &&
          !($('#infographicThread').hasClass('animated'))) {

        setTimeout(function () {
          $('#infographicThread').addClass('animated bounceIn');
          setTimeout(function () {
            $('#infographicClip').addClass('animated bounceIn');
            setTimeout(function() {
              $('#infographicStash').addClass('animated bounceIn');
              setTimeout(function () {
                $('#infographicSnap').addClass('animated bounceIn');
              }, 800);
            }, 800);
          }, 800);
        }, 100);
      } else if (!isElementInViewport($('#infographicTop').get(0), 0)) {
        $('#infographicThread').removeClass('animated bounceIn');
        $('#infographicClip').removeClass('animated bounceIn');
        $('#infographicStash').removeClass('animated bounceIn');
        $('#infographicSnap').removeClass('animated bounceIn');
      }
    });
  }

  /**
   * Check if the given element is in the viewport.
   *
   * @param  {Element} el HTML element
   * @return {Boolean}    True if the given element is in viewport
   */
  function isElementInViewport (el, offset) {
    var rect = el.getBoundingClientRect();

    return (rect.top - window.innerHeight + offset) < 0;
  }
}(jQuery, Sluice.ShoppingCart)