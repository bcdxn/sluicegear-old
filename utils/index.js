// Valid values
var HAMMOCK_TYPE             = 'Hammock',
    STANDARD_MODEL           = 'Standard',
    HAMMIE_MODEL             = 'Hammie',
    STANDARD_TYPE            = 'Standard Hammock',
    HAMMIE_TYPE              = 'Hammie Hammock',
    EXTRA_STRAPS_TYPE        = 'Straps',
    CARABINER_TYPE           = 'Carabiner',
    STANDARD_PRICE           = 5000,
    HAMMIE_PRICE             = 4000,
    ACCENT_PRICE             = 2000,
    STRAPS_PRICE             = 2000,
    CARABINER_PRICE          = 550,
    MIN_FOR_FREE_SHIPPING    = 4000,
    SHIPPING_PRICE           = 600;


/**
 * Check if the given string is a valid shopping cart.
 *
 * @param  {String} str The cart as an encoded string
 * @return {Object}     An object wrapping the isValid boolean along with an
 *                      error message or the cart object if it's invalid/valid
 *                      respectively
 */
exports.isValidShoppingCart = function (str) {
  var ret = {
        isValid: true
      },
      decodedStr,
      cart,
      i;

  // Check cart string
  if (!isDefined(str) || !isString(str) || str.length <= 0) {
    ret.isValid = false;
    ret.msg = 'Cart -- undefined.'
    return ret;
  }

  // Check URI encoding
  // try {
  //   decodedStr = decodeURIComponent(str);
  // } catch (err) {
  //   console.log(err);
  //   console.log(str)
  //   ret.isValid = false;
  //   ret.msg = 'Cart -- invalid URI encoding.'
  //   ret.err = err;
  //   return ret;
  // }

  decodedStr = str;

  // Check json
  try {
    cart = JSON.parse(decodedStr);
  } catch (err) {
    ret.isValid = false;
    ret.msg = 'Cart -- invalid JSON';
    ret.err = err;
    return ret;
  }

  // Check cart structure
  if (typeof cart !== 'object') {
    ret.isValid = false;
    ret.msg = 'Cart -- Invalid structure -- not an object';
    return ret;
  }

  if (cart.items === undefined || cart.items === null) {
    ret.isValid = false;
    ret.msg = 'Cart -- Invalid structure -- no items';
    return ret;
  }

  // Check items structure
  if (!Array.isArray(cart.items)) {
    ret.isValid = false;
    ret.msg = 'Items -- Invalid structure -- not an array';
    return ret;
  }

  // Check coupon code
  if (cart.couponCode !== undefined && cart.couponCode !== null &&
      typeof cart.couponCode !== 'string') {
    ret.isValid = false;
    ret.msg = 'CouponCode -- Invalid structure -- not a string';
    return ret;
  }

  // Check coupon message
  if (cart.couponMsg !== undefined && cart.couponMsg !== null &&
      typeof cart.couponMsg !== 'string') {
    ret.isValid = false;
    ret.msg = 'CouponMsg -- Invalid structure -- not a string';
    return ret;
  }

  for (i = 0; i < cart.items.length; i++) {
    // Check cart properties
    if (!isDefined(cart.items[i].item) ||
        !isString(cart.items[i].item.type) ||
        !isDefined(cart.items[i].item.config) ||
        !isInt(cart.items[i].quantity) ||
        cart.items[i].quantity <= 0) {
      ret.isValid = false;
      ret.msg = 'Items -- Invalid structure -- internal property';
      return ret;
    }
    // Check hammock config
    switch(cart.items[i].item.type) {
      case HAMMOCK_TYPE:
        if (!isValidHammock(cart.items[i].item.config)) {
          ret.isValid = false;
          ret.msg = 'Items -- Invalid structure -- Hammock -- config';
          return ret;
        }
        break;
      case EXTRA_STRAPS_TYPE:
        if (!isValidExtraStraps(cart.items[i].item.config)) {
          ret.isValid = false;
          ret.msg = 'Items -- Invalid structure -- Straps -- config';
          return ret;
        }
        break;
      case CARABINER_TYPE:
        break;
      default:
        ret.isValid = false;
        console.log(cart.items[i].item.type)
        ret.msg = 'Items -- Invalid structure -- config -- invalid type';
        return ret;
    }
  }

  ret.isValid = true;
  ret.cart = cart;
  return ret;
};

/**
 * Get the subtotal price of the items in the cart.
 *
 * @param  {Object} cart     A properly formed cart
 * @return {Number}          The subtotal price formatted as a whole number
 */
exports.calculateSubtotal = function (cart) {
  var subtotal = 0,
      itemPrice,
      i;

  for (i = 0; i < cart.items.length; i++) {
    switch (cart.items[i].item.type) {
      case HAMMOCK_TYPE:
        console.log('MODEL: ' + cart.items[i].item.config.model);
        if (cart.items[i].item.config.model === STANDARD_MODEL) {
          itemPrice = STANDARD_PRICE;
        } else if (cart.items[i].item.config.model === HAMMIE_MODEL) {
          itemPrice = HAMMIE_PRICE;
        }
        if (cart.items[i].item.config.accentColor !== null) {
          itemPrice += ACCENT_PRICE;
        }
        if (cart.items[i].item.config.straps === true) {
          itemPrice += STRAPS_PRICE;
        }
        subtotal += (itemPrice * cart.items[i].quantity);
        break;
      case EXTRA_STRAPS_TYPE:
        subtotal += (STRAPS_PRICE * cart.items[i].quantity);
        break;
      case CARABINER_TYPE:
        subtotal += (CARABINER_PRICE * cart.items[i].quantity);
      default:
        break;
    }
  }

  console.log('AMOUNT: ' + subtotal)

  return subtotal;
};

/**
 * Get the cost of shipping based on the subtotal.
 *
 * @param  {Number} subtotal The cart subtotal
 * @return {Number}          The price of shipping
 */
exports.calculateShipping = function (subtotal) {
  if (subtotal >= MIN_FOR_FREE_SHIPPING) {
    return 0;
  } else {
    return SHIPPING_PRICE;
  }
};

/**
 * Convert the whole number price to a string with dollars and cents.
 *
 * @param  {Number} price The whole number price (multiplied by 100)
 * @return {String}       The price formated as a string like 0.00
 */
exports.priceToString = function (price) {
  return (price / 100).toFixed(2);
};

function isDefined(o) {
  return typeof o !== 'undefined' && o !== null;
}
exports.isDefined = isDefined;

/**
 * Check that the given object is a string.
 *
 * @param  {Object}  o The object to be investigated
 * @return {Boolean}   True if the object is a string; else false
 */
function isString(o) {
  return isDefined(o) && typeof(o) === 'string' || o instanceof String;
}
exports.isString = isString;

/**
 * Check that the given object is an integer.
 *
 * @param  {Object}  o The object to investigate
 * @return {Boolean}   True if the object is an integer; else false
 */
function isInt(o) {
  return o === +o && o === (o|0);
}
exports.isInt = isInt;

/**
 * Check that the given object is a boolean.
 *
 * @param  {Object}  o The object to investigate
 * @return {Boolean}   True if the object is a boolean; else false
 */
function isBoolean(o) {
  return isDefined(o) && typeof o === 'boolean';
}
exports.isBoolean = isBoolean;

/**
 * Determine if the given hammock object is valid.
 *
 * @param  {Object} hammockConfig The object to be tested
 * @return {Boolean}        True if the hammock item is valid
 */
function isValidHammock(hammockConfig) {
  if (hammockConfig.hasOwnProperty('bodyColor') &&
      isString(hammockConfig.bodyColor) &&
      hammockConfig.bodyColor.length > 0 &&
      hammockConfig.hasOwnProperty('accentColor') &&
      (isString(hammockConfig.accentColor) ||
        hammockConfig.accentColor === null) &&
      isBoolean(hammockConfig.straps)) {
    return true;
  } else {
    return false;
  }
}

/**
 * Determine if the given straps object is valid.
 *
 * @param  {Object} strapsConfig The object to be tested
 * @return {Boolean}             True if the straps config is valid
 */
function isValidExtraStraps(strapsConfig) {
  if (strapsConfig.hasOwnProperty('bagColor') &&
      isString(strapsConfig.bagColor) &&
      strapsConfig.bagColor.length > 0) {
    return true;
  } else {
    return false;
  }
}