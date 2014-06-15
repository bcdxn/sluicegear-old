!function ($, __builder_dependency__,
    __shop_gallery_dependency__,
    __shopping_cart_dependency__,
    undefined) {

  var HammockBuilder = __builder_dependency__,
      ShopGallery    = __shop_gallery_dependency__,
      ShoppingCart   = __shopping_cart_dependency__,
      builder        = new HammockBuilder(),
      shopGallery    = new ShopGallery(),
      cart           = new ShoppingCart('#shoppingCartContainer');

  builder.$container.on('change', function () {
    var hammockImgSrc = builder.getHammockImgSrc(),
        bagImgSrc     = builder.getBagImgSrc();

    shopGallery.setHammockThumbnailSrc(hammockImgSrc);
    shopGallery.setBagThumbnailSrc(bagImgSrc);

    if (builder.straps === true) {
      shopGallery.showStrapsThumbnail();
    } else {
      shopGallery.hideStrapsThumbnail();
    }
  }).on('addtocart', function () {
    cart.addItem({
      type: 'Hammock',
      config: builder.getCurrentConfig()
    });
    cart.expand();
  })

  // Listen for cart checkout event
  cart.$container.on('checkout', function () {
    console.log('checkout!');
  });

  // Adding Straps to Cart Btn
  $('#addStrapsToCartBtn').on('click', function (evt) {
    cart.addItem({
      type: 'Straps',
      config: {
        model: 'Straps',
        desc: 'Extra straps',
        price: 2000,
        imgSrc: 'img/straps.jpg'
      }
    });
    cart.expand();
    evt.stopPropagation();
  });
  // Adding Carabiners to Cart Btn
  $('#addCarabinerToCartBtn').on('click', function (evt) {
    cart.addItem({
      type: 'Carabiner',
      config: {
        model: 'Black Diamond Neutrino',
        desc: 'Climbing rated carabiner',
        price: 550,
        imgSrc: 'img/bd-neutrino.jpg'
      }
    });
    cart.expand();
    evt.stopPropagation();
  });
}(jQuery, Sluice.HammockBuilder, Sluice.ShopGallery, Sluice.ShoppingCart)