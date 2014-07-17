;!function (Sluice, $, undefined) {
  var CART_ITEM_LIMIT       = 10,
      BACKSPACE_KEY         = 8,
      DELETE_KEY            = 46,
      MIN_FOR_FREE_SHIPPING = 4000,
      SHIPPING_PRICE        = 600,
      Template              = {};

  /**
   * Instantiate a new shopping cart.
   *
   * @param {Function} checkout The checkout behavior callback
   * @param {String}   selector The css selector for the cart container
   */
  Sluice.ShoppingCart = function (selector, getItemKey) {
    var prevState;

    this.$container = $(selector);
    this.$headerComponent = $('.mini-cart-wrapper');
    this.getItemKey = getItemKey || _getItemKey;
    this.getItemKey = _getItemKey;
    this.expandedContainerHeight = $(window).height();

    // Check for previous state saved in cookie
    $.cookie.json = true;
    // $.removeCookie('sluice_cart_cookie', null);
    try {
      prevState = $.cookie('sluice_cart_cookie')
      if (prevState !== undefined &&
          prevState !== null &&
          prevState !== '') {
        this.items      = prevState.items;
        this.keys       = prevState.keys;
        this.numItems   = prevState.numItems;
        this.nextUid    = prevState.nextUid;
      } else {
        this.empty();
      }
    } catch (e) { // Error in cookie, delete it
      $.removeCookie('sluice_cart_cookie', null);
      this.empty();
    }
    // this.empty();

    this.totalPrice = this.getTotalPrice();

    this._render();
    this._listen();
  };

  /**
   * Remove all items from the cart.
   */
  Sluice.ShoppingCart.prototype.empty = function () {
    this.items      = {};
    this.keys       = [];
    this.numItems   = 0;
    this.nextUid    = 0;
    this.totalPrice = 0;
  };

  Sluice.ShoppingCart.prototype.getShippingPrice = function () {
    if (this.getSubtotalPrice() >= MIN_FOR_FREE_SHIPPING) {
      return 0;
    } else {
      return SHIPPING_PRICE;
    }
  };

  Sluice.ShoppingCart.prototype.getSubtotalPrice = function () {
    var total = 0,
        key,
        i;

    for (i = 0; i < this.keys.length; i++) {
      key = this.keys[i];

      if (key !== undefined && key !== null) {
        if (this.items[key] !== undefined && this.items[key] !== null) {
          total += this.items[key].item.config.price * this.items[key].quantity;
        }
      }
    }

    return total;
  };

  /**
   * Get the total price of the contents of the cart.
   *
   * @param {Number} The total price formatted as an integer
   */
  Sluice.ShoppingCart.prototype.getTotalPrice = function () {
    return this.getShippingPrice() + this.getSubtotalPrice();
  };

  /**
   * Add the given quantity of the given item to the cart.
   *
   * @param {Object} item       The item to be added
   * @param {Number} [quantity] The quantity to be added; defaults to 1
   */
  Sluice.ShoppingCart.prototype.addItem = function (item, quantity) {
    var key = this.getItemKey(item);
    
    quantity = quantity || 1;
    
    if (this.items[key] !== undefined && this.items[key] !== null) {
      if (this.items[key].quantity + quantity > CART_ITEM_LIMIT) {
        quantity = CART_ITEM_LIMIT - this.items[key].quantity;
      }
      this.items[key].quantity += quantity;
    } else {
      this.items[key] = {
        'uid': this.nextUid,
        'item': item,
        'quantity': quantity
      };
      this.keys[this.nextUid] = key;
      this.nextUid++;
    }
    
    this.numItems += quantity;
    this.totalPrice = this.getTotalPrice();
    this._saveStateInCookie();
    this._render();
  };

  /**
   * Remove the given item from the cart if it exists.
   *
   * @param  {Object} item The item to be removed
   */
  Sluice.ShoppingCart.prototype.removeItem = function (item) {
    var key  = this.getItemKey(item);
    
    this.removeItemByKey(key);
  };
    
  /**
   * Remove the item corresponding to the given uid.
   *
   * @param {Number} uid The item uid
   */
  Sluice.ShoppingCart.prototype.removeItemByUid = function (uid) {
    var key = this.keys[uid];
    
    this.removeItemByKey(key);
  };
    
  /**
   * Remove the item corresponding to the given key.
   *
   * @param {String} key The item key
   */
  Sluice.ShoppingCart.prototype.removeItemByKey = function (key) {
    var item = this.items[key];
    
    if (item === undefined || item === null) {
      return null;    
    }
    
    this.keys[item.uid] = null;
    this.numItems -= item.quantity;
    
    delete this.items[key];

    this.totalPrice = this.getTotalPrice();
    this._saveStateInCookie();
    this._render();
  };

  /**
   * Update the quantity of the given item. If the given quantity is 0 remove the
   * item from the cart.
   *
   * @param {Object} item        The item to be updated
   * @param {Number} newQuantity The desired quantity
   */
  Sluice.ShoppingCart.prototype.updateQuantity = function (item, newQuantity) {
    var key = this.getItemKey(item);
    
    this.updateQuantityByKey(key, newQuantity);
  };
  
  /**
   * Update the quantity of the item with the corresponding uid.
   *
   * @param {Number} uid The uid of the item to be updated
   */
  Sluice.ShoppingCart.prototype.updateQuantityByUid = function (uid, newQuantity) {
    var key = this.keys[uid];
    
    this.updateQuantityByKey(key, newQuantity);
  };
    
  /**
   * Update the quantity of the item with the corresponding key.
   *
   * @param {String} key The key of the item to be updated
   */
  Sluice.ShoppingCart.prototype.updateQuantityByKey = function (key, newQuantity) {
    if (this.items[key] === undefined) {
      return;
    }

    if (isNaN(newQuantity)) {
      return;
    }

    if (newQuantity > 99) {
      return;
    }

    if (newQuantity === 0) {
      this.removeItemByKey(key);
      if (this.numItems === 0) {
        this.empty();
      }
    } else if (newQuantity < 0) {
      newQuantity = Math.abs(newQuantity);
    } else {
      this.numItems += newQuantity - this.items[key].quantity; 
      this.items[key].quantity = newQuantity;
    }

    this.totalPrice = this.getTotalPrice();
    this._saveStateInCookie();
    this._render();
  };

  /**
   * Convert given price to a string format with dollars and cents.
   *
   * @param  {Number} price The price to convert
   * @return {String}       The formatted price
   */
  Sluice.ShoppingCart.prototype.priceToString = function (price) {
    var priceStr = (Math.floor(price) / 100).toFixed(2);

    if (priceStr === '0.00') {
      priceStr = 'FREE';
    } else {
      priceStr = '$' + priceStr;
    }

    return priceStr;
  }

  /**
   * Save the state of the cart in a cookie.
   */
  Sluice.ShoppingCart.prototype._saveStateInCookie = function () {
    var cState = {};

    cState.items    = this.items;
    cState.keys     = this.keys;
    cState.numItems = this.numItems;
    cState.nextUid  = this.nextUid;

    $.cookie.json = true;
    $.removeCookie('sluice_cart_cookie');
    $.cookie('sluice_cart_cookie', cState, { expires: 14 });
  };

  /**
   * The default function used to get a unique key for the item. The key is
   * generated by concatenating the item's configuration properties.
   *
   * @param  {Object} item The item used to generate the key
   * @return {Sring}       The item-unique key
   */
  function _getItemKey(item) {
    var key = [item.type, ';'],
      prop;
    
    for (prop in item.config) {
      key.push(prop);
      key.push(':');
      key.push(item.config[prop]);
      key.push(';');
    }
    
    return key.join('');
  }

/* Shopping Cart View
------------------------------------------------------------------------------*/
  Template.CART = [
    '<div class="shopping-cart-inner">',
      '<div class="grid">{{CART_INNER}}</div>',
    '</div>'].join('');

  Template.ACTION_BTNS = [
    '<div class="row cart-row mtl">',
      '<div class="col l6 m6 s6 btn btn-grp btn-left blue-solid keep-shopping-btn">Keep shopping</div>',
      '<div id="checkoutBtn" class="col spinner-btn l6 m6 s6 btn btn-grp btn-right green-solid  {{EMPTY_CLASS}}">',
        '<div class="btn-wrapper show">',
          'Checkout with PayPal',
        '</div>',
        '<div class="spinner-wrapper hide">',
          '<div class="spinner">',
            '<div class="rect1"></div>',
            '<div class="rect2"></div>',
            '<div class="rect3"></div>',
            '<div class="rect4"></div>',
            '<div class="rect5"></div>',
          '</div>',
        '</div>',
      '</div>',
    '</div>'].join('');

  Template.TOTALS = [
    '<div class="totals-wrapper mtl mbl">',
      '<div class="row cart-row ptl">',
        '<div class="col shopping-cart-total-price l12">',
          '<span class="cart-total-price-lbl">Total</span>',
          '<span class="cart-total-price-wrapper">',
            '<span class="cart-total-price">{{TOTAL_PRICE}}</span>',
          '</span>',
        '</div>',
      '</div>',
      '<div class="row cart-row  pls prs mtl mbl">',
        '<div class="hb col l12"></div>',
      '</div>',
      '<div class="row cart-row mtm">',
        '<div class="col subtotal l12">',
          '<span class="total-count">{{TOTAL_ITEM_COUNT}}</span>',
          '<span class="total-count-lbl">{{TOTAL_ITEM_COUNT_LBL}}</span>',
          '<span class="cart-subtotal-wrapper">',
            '<span class="cart-subtotal">{{SUBTOTAL_PRICE}}</span>',
          '</span>',
        '</div>',
      '</div>',
      '<div class="row cart-row mtm pbl">',
        '<div class="col subtotal l12">',
          '<span class="shopping-lbl">Shipping</span>',
          '<span class="shipping-wrapper">',
            '<span>{{SHIPPING_PRICE}}</span>',
          '</span>',
        '</div>',
      '</div>',
    '</div>'].join('');

  Template.SHIPPING_MESSAGE = [
    '<div class="shipping-msg-wrapper mtl mbl">',
      '<div class="row cart-row pam">',
        'Free US shipping on orders over $40.00',
      '</div>',
    '</div>'].join('');

  Template.CART_ITEM = [
    '<div class="row cart-row pam">',
      '<div class="col l6 m6 s6">',
        '<div class="cart-preview-wrapper prm">',
          '<img src="{{PREVIEW_SRC}}", alt="preview" />',
        '</div>',
      '</div>',
      '<div class="col l5 m5 s5">',
        '<div class="cart-item-quantity">QTY ',
          '<span class="qty-val">{{ITEM_QTY}}</span>',
          '<input type="button" class="update-btn plus mlm" value="+" data-item-key="{{ITEM_KEY}}" />',
          '<input type="button" class="update-btn minus mlm" value="-" data-item-key="{{ITEM_KEY}}" />',
        '</div>',
        '<div class="cart-item-title ptm">{{MODEL}}</div>',
        '<div class="cart-item-price pbm">',
          '<span class="cart-item-price-val">{{ITEM_PRICE}}</span>',
        '</div>',
        '<div class="cart-item-desc">{{ITEM_DESC}}</div>',
      '</div>',
      '<div class="col l1 m1 s1">',
        '<div class="x-btn remove-item-btn" data-item-key="{{ITEM_KEY}}">X</div>',
      '</div>',
    '</div>'].join('');

    Template.LINE_BREAK = [
      '<div class="row cart-row  pls prs mtl">',
        '<div class="hb col l12"></div>',
      '</div>'].join('');

    Template.EMPTY_CART = [
      '<div class="row cart-row pls prs mtl">',
        '<div class="col l12 l-txt-center m-txt-center s-txt-center">',
          'Your cart is empty',
        '</div>',
      '</div>'].join('');

    Template.HEADER_COMPONENT = [
      '<div class="mini-cart">',
        '<div class="mini-cart-lbl">Cart</div>',
        '<div class="mini-cart-quantity">{{TOTAL_ITEM_COUNT}}</div>',
      '</div>'].join('');

    Sluice.ShoppingCart.prototype._render = function () {
      var headerMarkup = Template.HEADER_COMPONENT,
          markup = Template.CART,
          innerHtml = Template.ACTION_BTNS,
          cartItem,
          model = '',
          i;

      if (this.numItems < 1) {
        this.$container.addClass('empty');
        innerHtml = innerHtml.replace('{{EMPTY_CLASS}}', 'empty');
        innerHtml += Template.EMPTY_CART;
      } else {
        this.$container.removeClass('empty');
        innerHtml = innerHtml.replace('{{EMPTY_CLASS}}', '');
        innerHtml += Template.TOTALS
          .replace('{{TOTAL_PRICE}}', this.priceToString(this.totalPrice))
          .replace('{{TOTAL_ITEM_COUNT}}', this.numItems)
          .replace('{{TOTAL_ITEM_COUNT_LBL}}', (this.numItems > 1) ? ' Items' : ' Item')
          .replace('{{SUBTOTAL_PRICE}}', this.priceToString(this.getSubtotalPrice()))
          .replace('{{SHIPPING_PRICE}}', this.priceToString(this.getShippingPrice()));
        innerHtml += Template.SHIPPING_MESSAGE;
        innerHtml += Template.LINE_BREAK;
        for (i = 0; i < this.keys.length; i++) {
          cartItem = this.items[this.keys[i]];
          if (cartItem !== undefined && cartItem !== null) {
            model = '';
            if (cartItem.item.type === 'Hammock') {
              model = ' Hammock';
            }
            innerHtml += Template.CART_ITEM
              .replace('{{PREVIEW_SRC}}', cartItem.item.config.imgSrc)
              .replace('{{ITEM_QTY}}', cartItem.quantity)
              .replace('{{MODEL}}', cartItem.item.config.model + model)
              .replace(/\{\{ITEM_KEY\}\}/g, this.keys[i])
              .replace('{{ITEM_PRICE}}', this.priceToString(cartItem.item.config.price))
              .replace('{{ITEM_DESC}}', cartItem.item.config.desc);

            innerHtml += Template.LINE_BREAK;
          }
        }
      }

      markup = markup.replace('{{CART_INNER}}', innerHtml);

      this.$container.html(markup);
      this.setCartWidth();
      this.$headerComponent.html(headerMarkup.replace('{{TOTAL_ITEM_COUNT}}', this.numItems));
    };

    Sluice.ShoppingCart.prototype.hide = function () {
      this.$container.addClass('hidden');
      $('.container').removeClass('expanded-shopping-cart')
        .css('height', 'auto');
    };

    Sluice.ShoppingCart.prototype.expand = function () {
      this.$container.removeClass('hidden');
      $('.container').addClass('expanded-shopping-cart')
        .css('height', this.expandedContainerHeight + 'px');
    };

    Sluice.ShoppingCart.prototype.setCartWidth = function () {
      var width = $(window).width();

      if (width > 480) {
        width = 480;
      }

      $('.shopping-cart-inner').css('width', width + 'px');
    };

    Sluice.ShoppingCart.prototype._listen = function () {
      this._onKeepShoppingClick();
      this._onRemoveBtnClick();
      this._onPlusBtnClick();
      this._onMinusBtnClick();
      this._onQuantityLoseFocus();
      this._onCartBlur();
      this._onCartClickStopPropagation();
      this._onCartHeaderClick();
      this._onCheckoutBtnClick();
      this._onWindowResize();
    };

    Sluice.ShoppingCart.prototype._onKeepShoppingClick = function () {
      var self = this;

      this.$container.on('click', '.shopping-cart-inner .grid .row .keep-shopping-btn', function (evt) {
        self.hide();
      });
    };

    Sluice.ShoppingCart.prototype._onRemoveBtnClick = function () {
      var self = this;

      this.$container.on('click', '.shopping-cart-inner .grid .row .col .remove-item-btn', function (evt) {
        self.removeItemByKey($(this).attr('data-item-key'));
      });
    };

    Sluice.ShoppingCart.prototype._onPlusBtnClick = function () {
       var self = this,
          key;

      this.$container.on('click', '.shopping-cart-inner .grid .row .col .cart-item-quantity .plus', function (evt) {
        var qty;
        
        key = $(this).attr('data-item-key');
        if (self.items[key] !== undefined && self.items[key] !== null &&
            self.items[key].quantity < 10) {
          self.updateQuantityByKey(key, self.items[key].quantity + 1);
          self._render();
        }
      });
    };

    Sluice.ShoppingCart.prototype._onMinusBtnClick = function () {
       var self = this,
          key;

      this.$container.on('click', '.shopping-cart-inner .grid .row .col .cart-item-quantity .minus', function (evt) {
        var qty;
        
        key = $(this).attr('data-item-key');
        if (self.items[key] !== undefined && self.items[key] !== null) {
          // if (self.items[key].quantity > 1) {
            self.updateQuantityByKey(key, self.items[key].quantity - 1);
          // } else if (self.items[key].quantity === 1) {
          //   self.removeItemByKey(key);
          // }
          self._render();
        }
      });
    };

    Sluice.ShoppingCart.prototype._onQuantityLoseFocus = function () {
      var self = this;

      this.$container.on('blur', '.shopping-cart-inner .grid .row .col .cart-item-quantity .qty-input', function (evt) {
        var qty = $(this).val().trim();

        if (qty.length > 2 || qty.length < 1 ||
            isNaN(qty) || parseInt(qty) > CART_ITEM_LIMIT) {
          self._render();
        }
      });
    };

    Sluice.ShoppingCart.prototype._onCartBlur = function () {
      var self = this;

      $(document).on('click', function () {
        self.hide();
      });
    };

    Sluice.ShoppingCart.prototype._onCartClickStopPropagation = function () {
      this.$container.on('click', function (evt) {
        evt.stopPropagation();
      });
    };

    Sluice.ShoppingCart.prototype._onCartHeaderClick = function () {
      var self = this;

      this.$headerComponent.on('click', function (evt) {
        self.expand();
        evt.stopPropagation();
      });
    };

    Sluice.ShoppingCart.prototype._onCheckoutBtnClick = function () {
      var self = this,
          encodedJson,
          itemsArray = [];

      this.$container.on('click', '.shopping-cart-inner .grid .row #checkoutBtn', function (evt) {
        evt.stopPropagation();
        if (self.numItems > 0 && $('.btn-wrapper', $(this)).hasClass('show')) {
          $(document).add('*').off(); // Remove all event listeners
          $('.btn-wrapper', $(this)).removeClass('show').addClass('hide');
          $('.spinner-wrapper', $(this)).removeClass('hide').addClass('show');
          
          for (key in self.items) {
            itemsArray.push(self.items[key]);
          }

          encodedJson = encodeURIComponent(JSON.stringify(itemsArray));
          window.location.href = '/order?paymentMethod=paypal&cart=' + encodedJson;
        }
      });
    };

    Sluice.ShoppingCart.prototype._onWindowResize = function () {
      var self = this;

      $(window).on('resize', function () {
        self.setCartWidth();
        self.expandedContainerHeight = $(window).height();
        if (!self.$container.hasClass('hidden')) {
          $('.container').css('height', self.expandedContainerHeight + 'px');
        }
      });
    };

}(window.Sluice = window.Sluice || {}, jQuery)