#!/bin/bash

cd ~/projects/sluicegear2.1/static

# _layout.jade
#-------------------------------------------------------------------------------

# CSS
cat css/reset.css css/common.css \
    css/bcd-grid.css css/bcd-margins-paddings.css \
    css/bcd-toggler.css css/header.css css/footer.css | \
    cleancss -o bin/layout.min.css

# landing.jade
#-------------------------------------------------------------------------------

# Javascript
cat js/jquery.cookie.js \
    js/common.js \
    js/hero-gallery.jquery.js \
    js/shopping-cart.js \
    js/main.js | \
    minify -js > bin/landing.min.js

# CSS
cat css/hero-gallery.css \
    css/landing.css \
    css/shopping-cart.css | \
    cleancss -o bin/landing.min.css

# shop.jade
#-------------------------------------------------------------------------------

# Javascript
cat js/jquery.cookie.js js/common.js \
    js/bcd-toggler.jquery.js js/shop-gallery.js \
    js/hammock-builder.js js/shopping-cart.js \
    js/shop.js | \
    minify -js > bin/shop.min.js

# CSS
cat css/shop.css \
    css/shopping-cart.css | \
    cleancss -o bin/shop.min.css

