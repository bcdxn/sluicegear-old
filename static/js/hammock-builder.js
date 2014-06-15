!function ($, Sluice, __shop_gallery_dependency__, undefined) {

  /* Model
  ----------------------------------------------------------------------------*/
  var ShopGallery    = __shop_gallery_dependency__,
      shopGallery    = new ShopGallery(),
      MODEL_STANDARD = 'Standard',
      MODEL_HAMMIE   = 'Hammie',
      PRICE_STANDARD = 5000,
      PRICE_HAMMIE   = 4000,
      PRICE_ACCENT   = 2000,
      PRICE_STRAPS   = 2000,
      COLOR = {
        RED: 'red',
        BLUE: 'blue',
        TAN: 'tan',
        BURGUNDY: 'burgundy',
        TURQUOISE: 'turquoise'
      },
      Template = {};
  
  Sluice.HammockBuilder = function () {
    this.$container = $('.builder-body');
    this.reset();
    this.render();
    this.listen();
  };

  /**
   * Set the hammock builder properties to their intial states.
   */
  Sluice.HammockBuilder.prototype.reset = function () {
    this.model       = MODEL_STANDARD;
    this.bodyColor   = COLOR.RED;
    this.accentColor = null;
    this.straps      = false;
    this.price       = PRICE_STANDARD;
  };

  /**
   * Update the price based on the value of the hammock properties.
   */
  Sluice.HammockBuilder.prototype.updatePrice = function () {
    var price = 0;

    if (this.model === MODEL_STANDARD) {
      price += PRICE_STANDARD;
    } else {
      price += PRICE_HAMMIE;
    }

    if (this.accentColor !== null) {
      price += PRICE_ACCENT;
    }

    if (this.straps === true) {
      price += PRICE_STRAPS;
    }

    this.price = price;
  };

  /**
   * Select the standard model.
   */
  Sluice.HammockBuilder.prototype.setModelStandard = function () {
    this.model = MODEL_STANDARD;
  };

  /**
   * Select the kid's hammie model.
   */
  Sluice.HammockBuilder.prototype.setModelHammie = function () {
    this.model = MODEL_HAMMIE;
  };

  /**
   * Set the builder's selected color to the given color. If no color is
   * given. If the given color is the same as the current accent color, the
   * accent color is defaulted to red, unless the given color is red in which
   * case the accent color will default to blue.
   *
   * @param {String} [color] The selected color
   */
  Sluice.HammockBuilder.prototype.setBodyColor = function (color) {
    color = color || COLOR.RED;

    if (color === this.accentColor) {
      this.accentColor = (color !== COLOR.RED) ? COLOR.RED : COLOR.BLUE;
    }

    this.bodyColor = color;
  };

  /**
   * Set the builder's selected accent color to the given color. If no color is
   * given, the accent color will default to red (unless the main color is red
   * in which case the accent color will default to blue).
   *
   * @param {String} [color] The selected color
   */
  Sluice.HammockBuilder.prototype.setAccentColor = function (color) {
    color = color || COLOR.RED;

    if (this.bodyColor === color) {
      color = (this.bodyColor !== COLOR.RED) ? COLOR.RED : COLOR.BLUE;
    }

    this.accentColor = color;
  };

  /**
   * Clear the selected accent color.
   */
  Sluice.HammockBuilder.prototype.clearAccentColor = function () {
    this.accentColor = null;
  };

  /**
   * Set straps to true or false indicating if straps are desired by the user.
   *
   * @param {Boolean} strapsWanted Whether or not the straps are desired
   */
  Sluice.HammockBuilder.prototype.setStraps = function (strapsWanted) {
    this.straps = strapsWanted;
  };

  /**
   * Get a simple description of the configured hammock.
   *
   * @return {String} The description
   */
  Sluice.HammockBuilder.prototype.getDescription = function () {
    var desc = this.bodyColor;

    if (this.accentColor !== undefined && this.accentColor !== null) {
      desc += ' with ' + this.accentColor + ' accent';
    }

    if (this.straps === true) {
      desc += ', straps included';
    } else {
      desc += ', straps not included';
    }

    return desc;
  }

  /**
   * Get the hamock image source for the configured hammock.
   */
  Sluice.HammockBuilder.prototype.getHammockImgSrc = function () {
    var src = 'img/hammocks/' + this.bodyColor +
      '/' + this.bodyColor;

    if (this.accentColor !== null && this.accentColor !== undefined) {
      src += '-' + this.accentColor;
    }

    src += '.jpg';

    return src;
  };

  /**
   * Get the hamock image source for the configured hammock.
   */
  Sluice.HammockBuilder.prototype.getBagImgSrc = function () {
    return 'img/bags/' + this.bodyColor + '.jpg';
  };

  /**
   * Get the current hammock builder configuration.
   *
   * @return {Object} The current configuration
   */
  Sluice.HammockBuilder.prototype.getCurrentConfig = function () {
    var config = {
      model: this.model,
      bodyColor: this.bodyColor,
      accentColor: this.accentColor,
      straps: this.straps,
      price: this.price,
      imgSrc: this.getHammockImgSrc(),
      desc: this.getDescription()
    }

    return config;
  }


  /* View
  ----------------------------------------------------------------------------*/
  Template.MODEL_SECTION = [
    '<div class="row pls mtl mbm prs">',
      '<div class="gear-builder-text col l12 m12">',
        'Choose my hammock model',
      '</div>',
    '</div>',
    '<div class="row pls model-selection prs">',
      '<div class="col l6 m6 s6 btn gray btn-grp btn-left active model-btn standard">Standard</div>',
      '<div class="col l6 m6 s6 btn gray btn-grp btn-right model-btn hammie">Kid\'s Hammie</div>',
    '</div>'].join('');

  Template.HORIZONTAL_BREAK = [
    '<div class="row pls prs mtl">',
      '<div class="hb col l12 m12"></div>',
    '</div>'].join('');
    
  Template.BODY_COLOR_SECTION = [
    '<div class="row pls mtl mbs prs">',
      '<div class="gear-builder-text col l12 m12">',
        'Choose my hammock\'s color',
      '</div>',
    '</div>',
    '<div id="bodyColors" class="row">',
      '<div class="col s20p m20p l20p color-choice active" data-color="red">',
        '<img src="img/fabric-colors/red-fabric.png" />',
      '</div>',
      '<div class="col l20p m20p s20p color-choice" data-color="blue">',
        '<img src="img/fabric-colors/blue-fabric.png" />',
      '</div>',
      '<div class="col l20p m20p s20p color-choice" data-color="tan">',
        '<img src="img/fabric-colors/tan-fabric.png" />',
      '</div>',
      '<div class="col l20p m20p s20p color-choice" data-color="burgundy">',
        '<img src="img/fabric-colors/burgundy-fabric.png" />',
      '</div>',
      '<div class="col l20p m20p s20p color-choice" data-color="turquoise">',
        '<img src="img/fabric-colors/turquoise-fabric.png" />',
      '</div>',
    '</div>'].join('');

  Template.ACCENT_COLOR_SECTION = [
    '<div class="row pls mtl mbs prs">',
      '<div class="gear-builder-text col l9 m9 s9">',
        'Choose my hammock\'s accent color',
      '</div>',
      '<div class="col l3 m3 s3">',
        '<div id="accentColorToggler" class="toggler-wrapper"></div>',
        '</div>',
    '</div>',
    '<div id="accentColors" class="row color-choices optional hidden">',
      '<div class="col s20p m20p l20p color-choice active" data-color="red">',
        '<img src="img/fabric-colors/red-fabric.png" />',
      '</div>',
      '<div class="col l20p m20p s20p color-choice" data-color="blue">',
        '<img src="img/fabric-colors/blue-fabric.png" />',
      '</div>',
      '<div class="col l20p m20p s20p color-choice" data-color="tan">',
        '<img src="img/fabric-colors/tan-fabric.png" />',
      '</div>',
      '<div class="col l20p m20p s20p color-choice" data-color="burgundy">',
        '<img src="img/fabric-colors/burgundy-fabric.png" />',
      '</div>',
      '<div class="col l20p m20p s20p color-choice" data-color="turquoise">',
        '<img src="img/fabric-colors/turquoise-fabric.png" />',
      '</div>',
    '</div>'].join('');

  Template.STRAPS_SECTION = [
    '<div class="row pls mtl mbs prs">',
      '<div class="gear-builder-text col l9 m9 s9">',
        'I need straps',
      '</div>',
      '<div class="col l3 m3 s3">',
        '<div id="strapsToggler" class="toggler-wrapper"></div>',
      '</div>',
    '</div>'].join('');

  Template.PRICE_SECTION = [
    '<div class="row pls prs mtl">',
      '<div class="col l12 m12 total-hammock-price">$<span id="hammockPrice">50.00</span></div>',
    '</div>'].join('');

  Template.ADD_TO_CART_SECTION = [
    '<div class="row">',
      '<div class="col l12 m12">',
        '<div class="cart-btn-wrapper">',
          '<div id="addHammockToCartBtn" class="btn cart-btn shadow">Add to cart</div>',
        '</div>',
      '</div>',
    '</div>'].join('');


  /**
   * Render the template.
   */
  Sluice.HammockBuilder.prototype.render = function () {
    var markup = Template.MODEL_SECTION +
      Template.BODY_COLOR_SECTION +
      Template.HORIZONTAL_BREAK +
      Template.ACCENT_COLOR_SECTION +
      Template.HORIZONTAL_BREAK +
      Template.STRAPS_SECTION +
      Template.HORIZONTAL_BREAK +
      Template.PRICE_SECTION +
      Template.ADD_TO_CART_SECTION;

    this.$container.html(markup);
    $('.toggler-wrapper').toggler({
      initState: 'off',
      size: 'large',
      lblOn: 'yes',
      lblOff: 'no'
    });
  };

  /**
   * Update the model buttons in the UI.
   */
  Sluice.HammockBuilder.prototype.renderModelBtnGroup = function () {
    $('.btn-grp').removeClass('active');

    if (this.model === MODEL_STANDARD) {
      $('.btn-grp.standard').addClass('active');
    } else {
      $('.btn-grp.hammie').addClass('active');
    }
  };

  /**
   * Update the body color in the UI.
   */
  Sluice.HammockBuilder.prototype.renderBodyColor = function () {
    $('#bodyColors .color-choice').removeClass('active');
    $('#bodyColors .color-choice[data-color="' + this.bodyColor +'"]')
      .addClass('active');
  };

  /**
   * Update the accent color in the UI.
   */
  Sluice.HammockBuilder.prototype.renderAccentColor = function () {
    $('#accentColors .color-choice').removeClass('active');
    $('#accentColors .color-choice').removeClass('disabled');
    if (this.accentColor !== null) {
      $('#accentColors .color-choice[data-color="' + this.accentColor +'"]')
        .addClass('active');
    }
    $('#accentColors .color-choice[data-color="' + this.bodyColor +'"]')
        .addClass('disabled');
  };

  /**
   * Update the price in the UI.
   */
  Sluice.HammockBuilder.prototype.renderPrice = function () {
    $('#hammockPrice').html((Math.floor(this.price) / 100).toFixed(2));
  };

  /* Controller
  ----------------------------------------------------------------------------*/
  Sluice.HammockBuilder.prototype.listen = function () {
    this.onModelClick();
    this.onBodyColorClick();
    this.onAccentColorToggle();
    this.onAccentColorClick();
    this.onStrapsToggle();
    this.onAddToCartClick();
  };

  Sluice.HammockBuilder.prototype.onModelClick = function() {
    var self = this;

    $('.btn-grp.model-btn').on('click', function () {
      if ($(this).hasClass('standard')) {
        self.model = MODEL_STANDARD;
      } else {
        self.model = MODEL_HAMMIE;
      }

      self.updatePrice();
      self.renderModelBtnGroup();
      self.renderPrice();
    });
  };

  Sluice.HammockBuilder.prototype.onBodyColorClick = function() {
    var self = this;

    $('#bodyColors .color-choice').on('click', function () {
      var color = $(this).attr('data-color');

      self.setBodyColor(color);
      self.renderBodyColor();
      self.renderAccentColor();
      // Let others know of changes
      self.$container.trigger('change');
    });
  };

  Sluice.HammockBuilder.prototype.onAccentColorToggle = function() {
    var self = this;

    $('#accentColorToggler').on('switchon', function () {
      $('#accentColors').removeClass('hidden');
      self.setAccentColor();
      self.renderAccentColor();
      self.updatePrice();
      self.renderPrice();
      // Let others know of changes
      self.$container.trigger('change');
    }).on('switchoff', function () {
      $('#accentColors').addClass('hidden');
      self.clearAccentColor();
      self.renderAccentColor();
      self.updatePrice();
      self.renderPrice();
      // Let others know of changes
      self.$container.trigger('change');
    });
  };

  Sluice.HammockBuilder.prototype.onAccentColorClick = function() {
    var self = this;

    $('#accentColors .color-choice').on('click', function () {
      var color = $(this).attr('data-color');

      self.setAccentColor(color);
      self.renderAccentColor();
      // Let others know of changes
      self.$container.trigger('change');
    });
  };

  Sluice.HammockBuilder.prototype.onStrapsToggle = function () {
    var self = this;

    $('#strapsToggler').on('switchon', function () {
      self.setStraps(true);
      self.updatePrice();
      self.renderPrice();
      // Let others know of changes
      self.$container.trigger('change');
    }).on('switchoff', function () {
      self.setStraps(false);
      self.updatePrice();
      self.renderPrice();
      // Let others know of changes
      self.$container.trigger('change');
    });
  };

  Sluice.HammockBuilder.prototype.onAddToCartClick = function () {
    var self = this;

    $('#addHammockToCartBtn').on('click', function (evt) {
      evt.stopPropagation();
      self.$container.trigger('addtocart');
    });
  };
}(jQuery, window.Sluice = window.Sluice || {}, Sluice.ShopGallery);