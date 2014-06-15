!function ($, undefined) {
  Sluice.ShopGallery = function (id) {
    var self = this;

    this.gallery = $('#' + id);
    this.imgIndex = 0;  // Index into the photo array shown in main gallery
    this.setHammockThumbnailSrc('img/hammocks/red/red.jpg');
    this.setBagThumbnailSrc('img/bags/red.jpg');
    this.setStrapsThumbnailSrc('img/straps.jpg');
    this.hideStrapsThumbnail();
    this.setMainGalleryImg(0);

    $('.gallery-thumbnail.hammock').on('click', function () {
      self.setMainGalleryImg(0);
    });
    $('.gallery-thumbnail.bag').on('click', function () {
      self.setMainGalleryImg(1);
    });
    $('.gallery-thumbnail.straps').on('click', function () {
      self.setMainGalleryImg(2);
    });
  };

  /**
   * Set main gallery image to the selected thumbnail.
   *
   * @param {Number} index The path to the image to be displayed
   */
  Sluice.ShopGallery.prototype.setMainGalleryImg = function (index) {
    var src = $('.gallery-thumbnail').eq(index).css('background-image');

    $('.gallery-main').css('background-image', src);
    this.imgIndex = index;

    if (this.imgIndex === 0) {
      $('.gallery-main').removeClass('bag')
        .removeClass('straps')
        .addClass('hammock');
    } else if (this.imgIndex === 1) {
      $('.gallery-main').removeClass('hammock')
        .removeClass('straps')
        .addClass('bag');
    } else if (this.imgIndex === 2) {
      $('.gallery-main').removeClass('hammock')
        .removeClass('bag')
        .addClass('straps');
    }
  };

  /**
   * Set the hammock thumbnail to the given source.
   *
   * @param {Array} src The path to the image to be displayed
   */
  Sluice.ShopGallery.prototype.setHammockThumbnailSrc = function (src) {
    src = "url('" + src + "')"

    if (src !== $('.gallery-thumbnail.hammock').css('background-image')) {
      $('.gallery-thumbnail.hammock').css('background-image', src);

      if (this.imgIndex === 0) {
        this.setMainGalleryImg(0);
      }
    }
  };

  /**
   * Set the bag thumbnail to the given source.
   *
   * @param {String} src The path to the image to be displayed
   */
  Sluice.ShopGallery.prototype.setBagThumbnailSrc = function (src) {
    $('.gallery-thumbnail.bag').css('background-image',
      "url('" + src + "')");
  };

  /**
   * Set the straps thumbnail to the given source.
   *
   * @param {String} src The path to the image to be displayed
   */
  Sluice.ShopGallery.prototype.setStrapsThumbnailSrc = function (src) {
    $('.gallery-thumbnail.straps').css('background-image',
      "url('" + src + "')");
  };

  /**
   * Set the image sources; defaults to just the red hammock and bag.
   *
   * @param {String} src The path to the image to be displayed
   */
  Sluice.ShopGallery.prototype.showStrapsThumbnail = function () {
    $('.gallery-thumbnail-wrapper.straps').css('display', 'block');
  };

  /**
   * Set the image sources; defaults to just the red hammock and bag.
   *
   * @param {String} src The path to the image to be displayed
   */
  Sluice.ShopGallery.prototype.hideStrapsThumbnail = function () {
    $('.gallery-thumbnail-wrapper.straps').css('display', 'none');
  };
}(jQuery, window.Sluice = window.Sluice || {})