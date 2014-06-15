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
}(window.Sluice = window.Sluice || {}, $)