// Smooth Scrolling
;!function(Sluice, $, undefined) {
  /**
   * Scroll to the given id with the given speed.
   *
   * @param {String} id   The id to scroll to
   * @param {Number} [ms] The time in milliseconds
   */
  Sluice.scrollToId = function (id, ms) {
    ms = ms || 1000;

    $('html,body').animate({
      scrollTop: $(id).offset().top
    }, ms);

    return false;
  };

  /**
   * Redirect the browser to the given end point.
   *
   * @param {String} url The url to redirect to
   */
  Sluice.redirect = function (url) {
    document.location.href = url;
  };

  /**
   * Redirect the browser to the given end point. Remove the 'are you sure'
   * dialog if it exists.
   *
   * @param {String} url The url to redirect to
   */
  Sluice.redirectNoAsk = function (url) {
    window.onbeforeunload = function (e) { return null; };
    document.location.href = url;
  };

  /**
   * Redirect with no ask after clicking on the confirm button.
   *
   * @param {String} url The url to redirect to
   */
  Sluice.confirm = function (url) {
    $('.btn-wrapper').removeClass('show').addClass('hide');
    $('.spinner-wrapper').removeClass('hide').addClass('show');
    Sluice.redirectNoAsk(url);
  }

  /**
   * Check if the user agent is a variant of iOS.
   *
   * @return {Boolean} True if the user agen is iOS; else false
   */
  Sluice.isUserMobile = function () {
    return /(iPad|iPhone|iPod)/ig.test(navigator.userAgent) || $(window).width < 481;
  }
}(window.Sluice = window.Sluice || {}, $)