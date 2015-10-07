# angular-pinch-zoom
__angular-pinch-zoom__ can easily zoom image by pinch gesture for AngularJS.

[Demo](http://codepen.io/ktknest/full/LDljw/)

## Usage

### Module Name
- `ngPinchZoom`

### Directive
- `ng-pinch-zoom`

### Example
- Static Image:

```html
<img src=“image.jpg” width=“320” height=“320” alt=“” ng-pinch-zoom max-scale=“4”>
```

- Angular Supplied Image `$scope.image`

```html
<img ng-src=“{{image}}” width=“320” height=“320” alt=“” ng-pinch-zoom max-scale=“4”>
```


`max-scale` is optional. (default: `3`)

## Support
### AngularJS
- 1.2.x +

### Devices
- Android 4.x +
- iOS 5.x +

## License
The MIT License (MIT)

