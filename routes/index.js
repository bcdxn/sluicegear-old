'use strict';

var Config = require('../config'),
    paypal = require('paypal-rest-sdk'),
    uuid   = require('node-uuid'),
    utils  = require('../utils'),
    email  = require('../email'),
    CONFIG = new Config(),
    couponCodes = {};

paypal.configure({
  'host': process.env.SLUICE_PP_HOST,
  'port': process.env.SLUICE_PP_PORT,
  'client_id': process.env.SLUICE_PP_CLIENT_ID,
  'client_secret': process.env.SLUICE_PP_CLIENT_SECRET
});

couponCodes.myFestivalFriends = {
  code: process.env.SLUICE_COUPON_CODE_MY_FEST_FRIENDS,
  discount: 0.3,
  msg: '30% discount plus custom embroidery'
}

exports.landing = function (req, res) {
  res.render('landing', {
    'title': 'Hammocks made in the USA',
    'canonical': 'http://www.sluicegear.com/',
    'urlRoot': process.env.SLUICE_HOST_ROOT
  });
};

exports.shop = function (req, res) {
  var query;

  if (req.path.substr(-1) == '/' && req.path.length > 1) {
    res.redirect(301, req.path.slice(0, -1) + query);
  }

  res.render('shop', {
    'title': 'Shop Hammocks',
    'canonical': 'http://www.sluicegear.com/shop',
    'urlRoot': process.env.SLUICE_HOST_ROOT
  });
};

exports.order = function (req, res) {
  var orderId = uuid.v4(),
      validation,
      cart,
      paypalPayment,
      shipping,
      tax = 0,
      subtotal,
      total,
      port = '';

  var str = req.query.cart;

  console.log('.')
  console.log('.')
  console.log('.')
  console.log('.')
  console.log(str);
  console.log('.')
  console.log('.')
  console.log('.')
  console.log('.')

  validation = utils.isValidShoppingCart(req.query.cart);

  if (process.env.NODE_ENV !== 'production') {
    port = ':' + (process.env.PORT ? process.env.PORT : CONFIG.PORT);
  }

  if (validation.isValid) {
    cart = validation.cart;
  } else {
    console.log('ERROR: ' + validation.msg);
    invalidOrder(res);
    return;
  }

  if (req.query.paymentMethod === 'paypal') {
    // PayPal request body
    paypalPayment = {
      'intent': 'sale',
      'payer': {
        'payment_method': 'paypal'
      },
      'redirect_urls': { },
      'transactions': [{
        'amount': {
          'details': {}
        }
      }]
    };

    subtotal = utils.calculateSubtotal(cart);
    shipping = utils.calculateShipping(subtotal);

    if (cart.couponCode) {
      // Calculate discount
      if (cart.couponCode === couponCodes.myFestivalFriends.code) {
        subtotal = subtotal - (subtotal * couponCodes.myFestivalFriends.discount);
      }
    }

    console.log('total before heading to paypal: ' + subtotal);

    total = subtotal + shipping;

    // Add pricing to request body
    paypalPayment.transactions[0].amount.total            = utils.priceToString(total);
    paypalPayment.transactions[0].amount.currency         = 'USD';
    paypalPayment.transactions[0].amount.details.subtotal = utils.priceToString(subtotal);
    paypalPayment.transactions[0].amount.details.tax      = utils.priceToString(tax);
    paypalPayment.transactions[0].amount.details.shipping = utils.priceToString(shipping);

    // Add approved callback url to the request body
    paypalPayment.redirect_urls.return_url = process.env.SLUICE_HOST_ROOT + 
      port + '/orderApprove?orderId=' +
      orderId;
    // Add canceled callback url to the request body
    paypalPayment.redirect_urls.cancel_url = process.env.SLUICE_HOST_ROOT + 
      port + '/';
    // Add description to the request body
    paypalPayment.transactions[0].description = 'SluiceGear.com Order -- $' +
      paypalPayment.transactions[0].amount.total;
    // Create payment with paypal API
    paypal.payment.create(paypalPayment, {}, function (err, resp) {
      var paymentId,
          links,
          i;

      if (err) {
        console.log('PayPal API /payments/payment failed. -- ' + orderId + '\n\n\n');
        console.log('.');
        console.log('.');
        console.log('.');
        console.log('.');
        console.log('ERROR FROM PAYPAL: ' + JSON.stringify(err, null, '\t'));
        invalidOrder(res);
        return;
      } else {
        paymentId = resp.id;
        links = resp.links;

        req.session[orderId] = paymentId;
        req.session.cart = req.query.cart;

        for (i = 0; i < links.length; i++) {
          if (links[i].rel === 'approval_url') {
            res.redirect(links[i].href);
          }
        }
      }
    });
  } else {
    console.log('ERROR: Invalid payment payment method');
    invalidOrder(res);
  }
};

exports.orderApprove = function (req, res) {
  var payer      = {},
      orderId,
      paymentId,
      subtotal,
      shipping,
      total,
      validation = utils.isValidShoppingCart(req.session.cart),
      cart;

  // Check that given payer id is valid
  if (utils.isString(req.query.PayerID) &&
      req.query.PayerID.length > 0) {
    payer.payer_id = req.query.PayerID;
  } else {
    console.log('ERROR: PayPal Payer ID');
    invalidOrder(res);
    return;
  }

  // Check that given order id is valid
  if (utils.isString(req.query.orderId) &&
      req.query.orderId.length > 0) {
    orderId = req.query.orderId;
  } else {
    console.log('ERROR: PayPal Order ID');
    invalidOrder(res);
    return;
  }

  paymentId = req.session[orderId];


  if (validation.isValid) {
    cart = validation.cart;
  } else {
    console.log('Error: ' + validation.msg);
    invalidOrder(res);
    return;
  }

  subtotal = utils.calculateSubtotal(cart);
  shipping = utils.calculateShipping(subtotal);
  total = subtotal + shipping;

  // Calculate discount
  if (cart.couponCode) {
    // Calculate discount
    if (cart.couponCode === couponCodes.myFestivalFriends.code) {
      total = subtotal - (subtotal * couponCodes.myFestivalFriends.discount) + shipping;
    }
  }

  // Render the confirmation page
  res.render('order-summary', {
    'cart': cart,
    'couponMsg': cart.couponMsg,
    'subtotal': utils.priceToString(subtotal),
    'shipping': utils.priceToString(shipping),
    'total': utils.priceToString(total),
    'title': 'Confirm your order',
    'confirmation': true,
    'approval_url': '/orderExecute?PayerID=' + payer.payer_id + '&orderId=' + orderId,
    'cancel_url': '/'
  });
};

exports.orderExecute = function (req, res) {
  var payer = {},
      orderId,
      paymentId,
      validation = utils.isValidShoppingCart(req.session.cart),
      cart;

  // Check that given payer id is valid
  if (utils.isString(req.query.PayerID) &&
      req.query.PayerID.length > 0) {
    payer.payer_id = req.query.PayerID;
  } else {
    console.log('ERROR: PayPal Payer ID');
    invalidOrder(res);
    return;
  }

  // Check that given order id is valid
  if (utils.isString(req.query.orderId) &&
      req.query.orderId.length > 0) {
    orderId = req.query.orderId;
  } else {
    console.log('ERROR: PayPal Order ID');
    invalidOrder(res);
    return;
  }

  paymentId = req.session[orderId];

  if (validation.isValid) {
    cart = validation.cart;
  } else {
    console.log('Error: ' + validation.msg + ' -- ' + paymentId);
    invalidOrder(res);
    return;
  }

  // Finalize Payment with paypal API
  paypal.payment.execute(paymentId, payer, {}, function (err, resp) {
    if (err) {
      // TODO
      console.log('Error: PapPal API could not finalize payment -- ' + paymentId);
      invalidOrder(res);
      return;
    } else {
      var emailParams = {
        'orderId':     orderId,
        'paymentId':   paymentId,
        'createdTime': resp.create_time,
        'state':       resp.state,
        'payer':       resp.payer,
        'transaction': resp.transactions[0].amount,
        'cart':        cart
      }

      email.sendOrderEmail(emailParams); 

      res.redirect('/thankyou?PayerID=' + payer.payer_id + '&orderId=' + orderId);
    }
  });
};

exports.thankyou = function (req, res) {
  var payer = {},
      orderId,
      paymentId,
      validation = utils.isValidShoppingCart(req.session.cart),
      cart,
      subtotal,
      shipping,
      total;

  // Check that given payer id is valid
  if (utils.isString(req.query.PayerID) &&
      req.query.PayerID.length > 0) {
    payer.payer_id = req.query.PayerID;
  } else {
    console.log('ERROR: PayPal Payer ID');
    invalidOrder(res);
    return;
  }

  // Check that given order id is valid
  if (utils.isString(req.query.orderId) &&
      req.query.orderId.length > 0) {
    orderId = req.query.orderId;
  } else {
    console.log('ERROR: PayPal Order ID');
    invalidOrder(res);
    return;
  }

  paymentId = req.session[orderId];

  if (validation.isValid) {
    cart = validation.cart;
  } else {
    console.log('Error: ' + validation.msg + ' -- ' + paymentId);
    invalidOrder(res);
    return;
  }

  subtotal = utils.calculateSubtotal(cart);
  shipping = utils.calculateShipping(subtotal);
  total = subtotal + shipping;

  // Calculate discount
  if (cart.couponCode) {
    // Calculate discount
    if (cart.couponCode === couponCodes.myFestivalFriends.code) {
      total = subtotal - (subtotal * couponCodes.myFestivalFriends.discount) + shipping;
    }
  }

  res.render('order-summary', {
    'cart': cart,
    'couponMsg': cart.couponMsg,
    'subtotal': utils.priceToString(subtotal),
    'shipping': utils.priceToString(shipping),
    'total': utils.priceToString(total),
    'title': 'Order successful. Thank you!',
    'confirmation': false,
    'approval_url': '',
    'cancel_url': ''
  });
};

exports.fourOhFour = function (req, res) {
  res.render('notice', {
    title: '404',
    msg: 'page not found',
    btnTxt: 'Go home'
  });
};

exports.coupon = function (req, res) {
  var couponCode = req.body.couponCode;

  if (couponCode === couponCodes.myFestivalFriends.code) {
    res.json(couponCodes.myFestivalFriends);
  } else {
    res.json({ 'error': 'Coupon code not found.' });
  }
};

function invalidOrder(res) {
  res.render('notice', {
    title: 'uh oh!',
    msg: 'Something went wrong with your order. Please try again.',
    btnTxt: 'Try again'
  });
}