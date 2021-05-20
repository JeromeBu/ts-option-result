<p align="center">
    <img src="https://user-images.githubusercontent.com/6702424/80216211-00ef5280-863e-11ea-81de-59f3a3d4b8e4.png">  
</p>
<p align="center">
    <i></i>
    <br>
    <br>
    <img src="https://github.com/garronej/ts-option-result/workflows/ci/badge.svg?branch=main">
    <img src="https://img.shields.io/bundlephobia/minzip/ts-option-result">
    <img src="https://img.shields.io/npm/dw/ts-option-result">
    <img src="https://img.shields.io/npm/l/ts-option-result">
</p>
<p align="center">
  <a href="https://github.com/JeromeBu/ts-option-result">Home</a>
  -
  <a href="https://github.com/JeromeBu/ts-option-result">Documentation</a>
</p>

# Install / Import

```bash
$ npm install --save ts-option-result
```

```typescript
import { myFunction, myObject } from "ts-option-result";
```

Specific imports:

```typescript
import { myFunction } from "ts-option-result/myFunction";
import { myObject } from "ts-option-result/myObject";
```

## Import from HTML, with CDN

Import it via a bundle that creates a global ( wider browser support ):

```html
<script src="//unpkg.com/ts-option-result/bundle.min.js"></script>
<script>
    const { myFunction, myObject } = ts_option_result;
</script>
```

Or import it as an ES module:

```html
<script type="module">
    import { myFunction, myObject } from "//unpkg.com/ts-option-result/zz_esm/index.js";
</script>
```

_You can specify the version you wish to import:_ [unpkg.com](https://unpkg.com)

## Contribute

```bash
npm install
npm run build
npm test
```
