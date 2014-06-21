/*
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014 Benjamin Dixon
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
;!function ($, undefined) {
  var Template = {
    wrapper: [
    '<div class="hero-gallery-wrapper">',
      '<div class="hero-gallery">',
        '{{HERO_PANELS}}',
      '</div>',
    '</div>'].join(''),
    panel: ['<div class="hero-panel {{ACTIVE}} {{BG_STYLE}} {{FADE}}"></div>'].join(''),
    controls: [
    '<div class="hero-gallery-ctrls-wrapper {{CTRLS_OVER_GALLERY}}">',
      '<div class="hero-gallery-ctrls" style="width: {{CTRLS_WIDTH}}px">',
        '{{BUTTONS}}',
      '</div>',
    '</div>'].join(''),
    button: ['<div class="hero-gallery-ctrls-btn"></div>'].join('')
  },
  ACTIVE_CLASS = 'active',
  FADE_CLASS = 'fade-animate',
  EMPTY_STRING = '',
  BUTTON_WIDTH = 24;

  window.nextHeroGalleryId = 0;

  $.fn.herogallery = function (config) {
    var interval         = config.interval || 5000,
        fade             = ((config.fade === false) ? false : true),
        ctrlsOverGallery = ((config.ctrlsOverGallery === false) ? false : true),
        imgStyles        = config.imgStyles || [],
        $ctrlsParent     = $(config.ctrlsParent),
        panelsHtml       = EMPTY_STRING,
        btnsHtml         = EMPTY_STRING,
        panel,
        ctrlsHtml,
        heroHtml,
        i;

    for (i = 0; i < imgStyles.length; i++) {
      panel = Template.panel.replace('{{BG_STYLE}}', imgStyles[i]);
      
      if (i === 0) {
        panel = panel.replace('{{ACTIVE}}', ACTIVE_CLASS);
      } else {
        panel = panel.replace('{{ACTIVE}}', EMPTY_STRING);
      }

      if (fade) {
        panel = panel.replace('{{FADE}}', FADE_CLASS);
      } else {
        panel = panel.replace('{{FADE}}', EMPTY_STRING);
      }

      panelsHtml += panel
      btnsHtml += Template.button;
    }

    heroHtml = Template.wrapper.replace('{{HERO_PANELS}}', panelsHtml);
    ctrlsHtml = Template.controls
      .replace('{{CTRLS_OVER_GALLERY}}', 'over-gallery')
      .replace('{{BUTTONS}}', btnsHtml)
      .replace('{{CTRLS_WIDTH}}', imgStyles.length * BUTTON_WIDTH);

    $(this).html(heroHtml);
    if ($ctrlsParent.length < 1) {
      $ctrlsParent = $('.hero-gallery', $(this));
    }
    $ctrlsParent.append(ctrlsHtml);

    $('.hero-gallery-ctrls-btn', $ctrlsParent).eq(0).addClass('active');

    $ctrlsParent.on('click', '.hero-gallery-ctrls-wrapper ' +
      '.hero-gallery-ctrls .hero-gallery-ctrls-btn',
      function () {
        _onClick($(this), interval, $ctrlsParent);
      });

    $(this).each(function (index, elem) {
      _play($(elem), interval, $ctrlsParent, 1);
    });

    $(this).attr('hero-gallery-id', nextHeroGalleryId);
    nextHeroGalleryId++;


    return $(this);
  };

  /**
   * Start an endless loop through the images in the gallery.
   *
   * @param {Object} $gallery     The jquery object that contains the gallery
   * @param {Number} interval     The length of time to pause between transitions
   * @param {Number} [startIndex] The index into the images to start at
   */
  function _play($gallery, interval, $ctrlsParent, startIndex) {
    var $panels  = $('.hero-panel', $gallery),
        activeIndex,
        id;

    id = setInterval(function () {
      var $buttons = $('.hero-gallery-ctrls-btn', $ctrlsParent);

      if (startIndex === undefined || startIndex === null) {
        activeIndex = $('.hero-panel.active', $gallery).index() + 1;
      } else {
        activeIndex = startIndex;
        startIndex = null;
      }
      
      if (activeIndex < 0 || activeIndex >= $panels.length) {
        activeIndex = 0;
      }

      $panels.removeClass('active');
      $buttons.removeClass('active');
      $panels.eq(activeIndex).addClass('active');
      $buttons.eq(activeIndex).addClass('active');

    }, interval);

    $gallery.attr('hero-interval-id', id);
  }

  /**
   * Pause the endless transition loop.
   *
   * @param {Object} $gallery The jquery object that contains gallery
   */
  function _pause($gallery) {
    var existingId = $gallery.attr('hero-interval-id');

    if (existingId !== undefined && existingId !== null) {
      window.clearInterval(parseInt(existingId));
    }
  }

  /**
   * Click handler for the gallery control buttons.
   *
   * @param {Object} $elem    The jquery objec that contains the clicked element
   * @param {Number} interval The transtion interval
   */
  function _onClick($elem, interval, $ctrlsParent) {
    var activeIndex = $elem.index(),
        $gallery,
        $panels;

    if (!$elem.hasClass('active')) {
      // button clicked -> ctrls -> ctrls-wrapper -> gallery -> gallery-wrapper
      $gallery = $elem.parent().parent().parent().parent().parent();
      $panels = $('.hero-panel', $gallery);
      $buttons = $('.hero-gallery-ctrls-btn', $gallery);

      $panels.removeClass('active');
      $panels.eq(activeIndex).addClass('active');
      $buttons.removeClass('active');
      $buttons.eq(activeIndex).addClass('active');
      _pause($gallery);

      _play($gallery, interval, $ctrlsParent);
    }
  }
}(jQuery)