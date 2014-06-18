// Valid values
var HAMMOCK_TYPE             = 'Hammock',
    STANDARD_MODEL           = 'Standard',
    HAMMIE_MODEL             = 'Hammie',
    STANDARD_TYPE            = 'Standard Hammock',
    HAMMIE_TYPE              = 'Hammie Hammock',
    EXTRA_STRAPS_TYPE        = 'Extra Straps',
    STANDARD_PRICE           = 5000,
    HAMMIE_PRICE             = 4000,
    ACCENT_PRICE             = 2000,
    STRAPS_PRICE             = 2000,
    STAND_ALONE_STRAPS_PRICE = 2500;


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
  try {
    decodedStr = decodeURIComponent(str);
  } catch (err) {
    ret.isValid = false;
    ret.msg = 'Cart -- invalid URI encoding.'
    ret.err = err;
    return ret;
  }

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
  if (!Array.isArray(cart)) {
    ret.isValid = false;
    ret.msg = 'Cart -- Invalid structure -- not array';
    return ret;
  }

  for (i = 0; i < cart.length; i++) {
    // Check cart properties
    if (!isDefined(cart[i].item) ||
        !isString(cart[i].item.type) ||
        !isDefined(cart[i].item.config) ||
        !isInt(cart[i].quantity) ||
        cart[i].quantity <= 0) {
      ret.isValid = false;
      ret.msg = 'Cart -- Invalid structure -- internal property';
      return ret;
    }
    // Check hammock config
    switch(cart[i].item.type) {
      case HAMMOCK_TYPE:
        if (!isValidHammock(cart[i].item.config)) {
          ret.isValid = false;
          ret.msg = 'Cart -- Invalid structure -- config';
          return ret;
        }
        break;
      case EXTRA_STRAPS_TYPE:
        break;
      default:
        ret.isValid = false;
        ret.msg = 'Cart -- Invalid structure -- config -- invalid type';
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
 * @return {String}          The amount in dollars in cents as a string
 */
exports.calculateSubtotal = function (cart) {
  var total = 0,
      subTotal,
      i;

  for (i = 0; i < cart.length; i++) {
    switch (cart[i].item.type) {
      case HAMMOCK_TYPE:
        if (cart[i].item.config.model === STANDARD_MODEL) {
          subTotal = STANDARD_PRICE;
        } else if (cart[i].item.config.model === HAMMIE_MODEL) {
          subTotal = STANDARD_PRICE;
        }
        if (cart[i].item.config.accentColor !== null) {
          subTotal += ACCENT_PRICE;
        }
        if (cart[i].item.config.straps === true) {
          subTotal += STRAPS_PRICE;
        }
        total += Math.floor(subTotal * cart[i].quantity);
        break;
      case EXTRA_STRAPS_TYPE:
        subTotal = STAND_ALONE_STRAPS_PRICE;
        total += Math.floor(subTotal * cart[i].quantity);
        break;
      default:
        break;
    }
  }

  return total;
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
      hammockConfig.hasOwnProperty('accentColor') &&
      (isString(hammockConfig.accentColor) ||
        hammockConfig.accentColor === null) &&
      isBoolean(hammockConfig.straps)) {
    return true;
  } else {
    return false;
  }
}