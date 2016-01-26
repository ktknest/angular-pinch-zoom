angular.module('ngPinchZoom', [])
  /**
   * @ngdoc directive
   * @name ngPinchZoom
   * @restrict A
   * @scope false
   **/
  .directive('ngPinchZoom', function () {

    var _directive = {
      restrict: 'A',
      scope: false,
      link: _link
    };

    function _link(scope, element, attrs) {
      var elWidth, elHeight;

      // mode : 'pinch' or 'swipe'
      var mode = '';

      // distance between two touche points (mode : 'pinch')
      var distance = 0;
      var initialDistance = 0;

      // image scaling
      var scale = 1;
      var relativeScale = 1;
      var initialScale = 1;
      var maxScale = parseInt(attrs.maxScale, 10);
      if (isNaN(maxScale) || maxScale <= 1) {
        maxScale = 3;
      }

      // position of the upper left corner of the element
      var positionX = 0;
      var positionY = 0;

      var initialPositionX = 0;
      var initialPositionY = 0;

      // central origin (mode : 'pinch')
      var originX = 0;
      var originY = 0;

      // start coordinate and amount of movement (mode : 'swipe')
      var startX = 0;
      var startY = 0;
      var moveX = 0;
      var moveY = 0;

      var pointers = !('ontouchstart' in document.documentElement) && ('onpointerdown' in document.documentElement) ? [] : null;
      var pointersMap = {};

      var image = new Image();
      image.onload = function () {
        elWidth = element[0].clientWidth;
        elHeight = element[0].clientHeight;

        element.css({
          '-webkit-transform-origin': '0 0',
          'transform-origin': '0 0'
        });

        if (pointers !== null) {
          element.on('pointerdown', pointerDownHandler);
          element.on('pointermove', pointerMoveHandler);
          element.on('pointerup', pointerUpHandler);
          return;
        }

        element.on('touchstart', touchstartHandler);
        element.on('touchmove', touchmoveHandler);
        element.on('touchend', touchendHandler);
      };

      if (attrs.ngSrc) {
        image.src = attrs.ngSrc;
      } else {
        image.src = attrs.src;
      }

      /**
       * @param {object} evt
       */
      function pointerDownHandler(evt) {

        var event = evt.originalEvent || evt;

        var touch = {
          clientX: event.clientX,
          clientY: event.clientY
        };


        pointers.push(touch);
        pointersMap[event.pointerId] = touch;

        event.touches = pointers;

        touchstartHandler(evt);

      }

      /**
       * @param {object} evt
       */
      function pointerMoveHandler(evt) {

        var event = evt.originalEvent || evt;

        if (!pointersMap[event.pointerId]) {
          pointerDownHandler(evt);
        }

        pointersMap[event.pointerId].clientX = event.clientX;
        pointersMap[event.pointerId].clientY = event.clientY;

        event.touches = pointers;

        touchmoveHandler(evt);

      }

      /**
       * @param {object} evt
       */
      function pointerUpHandler(evt) {

        var event = evt.originalEvent || evt;

        if (pointersMap[event.pointerId]) {
          var index = pointers.indexOf(pointersMap[event.pointerId]);
          if (index > -1) {
            pointers.splice(index, 1);
          }
          delete pointersMap[event.pointerId];
        }

        event.touches = pointers;

        touchendHandler(evt);

      }

      /**
       * @param {object} evt
       */
      function touchstartHandler(evt) {
        var touches = evt.originalEvent ? evt.originalEvent.touches : evt.touches;

        startX = touches[0].clientX;
        startY = touches[0].clientY;
        initialPositionX = positionX;
        initialPositionY = positionY;
        moveX = 0;
        moveY = 0;
      }

      /**
       * @param {object} evt
       */
      function touchmoveHandler(evt) {
        var touches = evt.originalEvent ? evt.originalEvent.touches : evt.touches;

        if (mode === '') {
          if (touches.length === 1 && scale > 1) {

            mode = 'swipe';

          } else if (touches.length === 2) {

            mode = 'pinch';

            initialScale = scale;
            initialDistance = getDistance(touches);
            originX = touches[0].clientX -
              parseInt((touches[0].clientX - touches[1].clientX) / 2, 10) -
              element[0].offsetLeft - initialPositionX;
            originY = touches[0].clientY -
              parseInt((touches[0].clientY - touches[1].clientY) / 2, 10) -
              element[0].offsetTop - initialPositionY;

          }
        }

        if (mode === 'swipe') {
          evt.preventDefault();

          moveX = touches[0].clientX - startX;
          moveY = touches[0].clientY - startY;

          positionX = initialPositionX + moveX;
          positionY = initialPositionY + moveY;

          transformElement();

        } else if (mode === 'pinch') {
          evt.preventDefault();

          distance = getDistance(touches);
          relativeScale = distance / initialDistance;
          scale = relativeScale * initialScale;

          positionX = originX * (1 - relativeScale) + initialPositionX + moveX;
          positionY = originY * (1 - relativeScale) + initialPositionY + moveY;

          transformElement();

        }
      }

      /**
       * @param {object} evt
       */
      function touchendHandler(evt) {
        var touches = evt.originalEvent ? evt.originalEvent.touches : evt.touches;

        if (mode === '' || touches.length > 0) {
          return;
        }

        if (scale < 1) {

          scale = 1;
          positionX = 0;
          positionY = 0;

        } else if (scale > maxScale) {

          scale = maxScale;
          relativeScale = scale / initialScale;
          positionX = originX * (1 - relativeScale) + initialPositionX + moveX;
          positionY = originY * (1 - relativeScale) + initialPositionY + moveY;

        } else {

          if (positionX > 0) {
            positionX = 0;
          } else if (positionX < elWidth * (1 - scale)) {
            positionX = elWidth * (1 - scale);
          }
          if (positionY > 0) {
            positionY = 0;
          } else if (positionY < elHeight * (1 - scale)) {
            positionY = elHeight * (1 - scale);
          }

        }

        transformElement(0.1);
        mode = '';
      }

      var d = 0;

      /**
       * @param {Array} touches
       * @return {number}
       */
      function getDistance(touches) {
        if (touches.length > 1) {
          d = Math.sqrt(Math.pow(touches[0].clientX - touches[1].clientX, 2) +
            Math.pow(touches[0].clientY - touches[1].clientY, 2));
        }

        return parseInt(d, 10);
      }

      /**
       * @param {number} [duration]
       */
      function transformElement(duration) {
        var transition = duration ? 'all cubic-bezier(0,0,.5,1) ' + duration + 's' : '';
        var matrixArray = [scale, 0, 0, scale, positionX, positionY];
        var matrix = 'matrix(' + matrixArray.join(',') + ')';

        element.css({
          '-webkit-transition': transition,
          transition: transition,
          '-webkit-transform': matrix + ' translate3d(0,0,0)',
          transform: matrix
        });
      }
    }

    return _directive;
  });
