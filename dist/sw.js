/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js");

importScripts(
  "./precache-manifest.249df985fd7f4f461c3055a97552a12a.js"
);

workbox.core.setCacheNameDetails({prefix: "cedar-plot"});

workbox.skipWaiting();
workbox.clientsClaim();

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "app/index.js",
    "revision": "6a9ae84b98f87e599214856e087a008d"
  },
  {
    "url": "app/public/favicons/android-chrome-128x128.png",
    "revision": "e888796cf19187c0370e0397fcda2f5b"
  },
  {
    "url": "app/public/favicons/android-chrome-144x144.png",
    "revision": "607dee8e0a8f134013f4aa987eb93a28"
  },
  {
    "url": "app/public/favicons/android-chrome-152x152.png",
    "revision": "4b043d7c5150eadaf6ee34efe8c03343"
  },
  {
    "url": "app/public/favicons/android-chrome-192x192.png",
    "revision": "458f7261582bce9ef3af8b60e84083fc"
  },
  {
    "url": "app/public/favicons/android-chrome-256x256.png",
    "revision": "efb2e2d00ab3ce86e558320eb923618e"
  },
  {
    "url": "app/public/favicons/android-chrome-36x36.png",
    "revision": "f9ec76522a1a1aa78c5b2a7c4c197291"
  },
  {
    "url": "app/public/favicons/android-chrome-384x384.png",
    "revision": "7075ebb26c8c499adf4d5a43eb735012"
  },
  {
    "url": "app/public/favicons/android-chrome-48x48.png",
    "revision": "30af9042d87da472bb4bd47af9e39eca"
  },
  {
    "url": "app/public/favicons/android-chrome-512x512.png",
    "revision": "d37ef76f78eab6999de689d56217611e"
  },
  {
    "url": "app/public/favicons/android-chrome-72x72.png",
    "revision": "fca141a05362b7065e3c35441c380ad3"
  },
  {
    "url": "app/public/favicons/android-chrome-96x96.png",
    "revision": "fbfb12f73d62df1bfcc08cd16e09bfa0"
  },
  {
    "url": "app/public/favicons/apple-touch-icon-114x114-precomposed.png",
    "revision": "fb7ef126f65245a03591908567a8481a"
  },
  {
    "url": "app/public/favicons/apple-touch-icon-114x114.png",
    "revision": "fb7ef126f65245a03591908567a8481a"
  },
  {
    "url": "app/public/favicons/apple-touch-icon-120x120-precomposed.png",
    "revision": "be023903e9219636e62a0a0ef8e680ca"
  },
  {
    "url": "app/public/favicons/apple-touch-icon-120x120.png",
    "revision": "be023903e9219636e62a0a0ef8e680ca"
  },
  {
    "url": "app/public/favicons/apple-touch-icon-144x144-precomposed.png",
    "revision": "607dee8e0a8f134013f4aa987eb93a28"
  },
  {
    "url": "app/public/favicons/apple-touch-icon-144x144.png",
    "revision": "607dee8e0a8f134013f4aa987eb93a28"
  },
  {
    "url": "app/public/favicons/apple-touch-icon-152x152-precomposed.png",
    "revision": "4b043d7c5150eadaf6ee34efe8c03343"
  },
  {
    "url": "app/public/favicons/apple-touch-icon-152x152.png",
    "revision": "4b043d7c5150eadaf6ee34efe8c03343"
  },
  {
    "url": "app/public/favicons/apple-touch-icon-180x180-precomposed.png",
    "revision": "7b936f6be6116671ea788272f39cef17"
  },
  {
    "url": "app/public/favicons/apple-touch-icon-180x180.png",
    "revision": "7b936f6be6116671ea788272f39cef17"
  },
  {
    "url": "app/public/favicons/apple-touch-icon-57x57-precomposed.png",
    "revision": "96bd1b631481caae40b781ee9da566b7"
  },
  {
    "url": "app/public/favicons/apple-touch-icon-57x57.png",
    "revision": "96bd1b631481caae40b781ee9da566b7"
  },
  {
    "url": "app/public/favicons/apple-touch-icon-60x60-precomposed.png",
    "revision": "347d336ebca3ae836597c8130f90121e"
  },
  {
    "url": "app/public/favicons/apple-touch-icon-60x60.png",
    "revision": "347d336ebca3ae836597c8130f90121e"
  },
  {
    "url": "app/public/favicons/apple-touch-icon-72x72-precomposed.png",
    "revision": "fca141a05362b7065e3c35441c380ad3"
  },
  {
    "url": "app/public/favicons/apple-touch-icon-72x72.png",
    "revision": "fca141a05362b7065e3c35441c380ad3"
  },
  {
    "url": "app/public/favicons/apple-touch-icon-76x76-precomposed.png",
    "revision": "d64e1892d67992658dc6cf5b51de0ca3"
  },
  {
    "url": "app/public/favicons/apple-touch-icon-76x76.png",
    "revision": "d64e1892d67992658dc6cf5b51de0ca3"
  },
  {
    "url": "app/public/favicons/apple-touch-icon-precomposed.png",
    "revision": "7b936f6be6116671ea788272f39cef17"
  },
  {
    "url": "app/public/favicons/apple-touch-icon.png",
    "revision": "7b936f6be6116671ea788272f39cef17"
  },
  {
    "url": "app/public/favicons/favicon.ico",
    "revision": "3cb29d4c6a159284dbb8536afa585b23"
  },
  {
    "url": "app/public/favicons/icon-128x128.png",
    "revision": "e888796cf19187c0370e0397fcda2f5b"
  },
  {
    "url": "app/public/favicons/icon-144x144.png",
    "revision": "607dee8e0a8f134013f4aa987eb93a28"
  },
  {
    "url": "app/public/favicons/icon-152x152.png",
    "revision": "4b043d7c5150eadaf6ee34efe8c03343"
  },
  {
    "url": "app/public/favicons/icon-160x160.png",
    "revision": "0c29b6a53b7ce806d6aced4a5fe2b0a9"
  },
  {
    "url": "app/public/favicons/icon-16x16.png",
    "revision": "a88d9094f2e42d3ea652deb6f73f0ff2"
  },
  {
    "url": "app/public/favicons/icon-192x192.png",
    "revision": "458f7261582bce9ef3af8b60e84083fc"
  },
  {
    "url": "app/public/favicons/icon-196x196.png",
    "revision": "cfb32e7225f619112eacb4dc73e0bf79"
  },
  {
    "url": "app/public/favicons/icon-24x24.png",
    "revision": "a27153dd761cc8b954e5e9fbc3b200ac"
  },
  {
    "url": "app/public/favicons/icon-256x256.png",
    "revision": "efb2e2d00ab3ce86e558320eb923618e"
  },
  {
    "url": "app/public/favicons/icon-32x32.png",
    "revision": "20d2b742541de9a478f4edcc8b88f7ab"
  },
  {
    "url": "app/public/favicons/icon-36x36.png",
    "revision": "f9ec76522a1a1aa78c5b2a7c4c197291"
  },
  {
    "url": "app/public/favicons/icon-384x384.png",
    "revision": "7075ebb26c8c499adf4d5a43eb735012"
  },
  {
    "url": "app/public/favicons/icon-48x48.png",
    "revision": "30af9042d87da472bb4bd47af9e39eca"
  },
  {
    "url": "app/public/favicons/icon-512x512.png",
    "revision": "d37ef76f78eab6999de689d56217611e"
  },
  {
    "url": "app/public/favicons/icon-72x72.png",
    "revision": "fca141a05362b7065e3c35441c380ad3"
  },
  {
    "url": "app/public/favicons/icon-96x96.png",
    "revision": "fbfb12f73d62df1bfcc08cd16e09bfa0"
  },
  {
    "url": "app/public/favicons/mstile-144x144.png",
    "revision": "607dee8e0a8f134013f4aa987eb93a28"
  },
  {
    "url": "app/public/favicons/mstile-150x150.png",
    "revision": "42bab0d50ab4efaea4c41bffe0d184db"
  },
  {
    "url": "app/public/favicons/mstile-310x150.png",
    "revision": "703b3c257f886667b86296565094a0ae"
  },
  {
    "url": "app/public/favicons/mstile-310x310.png",
    "revision": "800e8ec791f0a83efafaf363544528f5"
  },
  {
    "url": "app/public/favicons/mstile-70x70.png",
    "revision": "11d02f177f9af04d27c179ef8bb13527"
  },
  {
    "url": "app/public/index.html",
    "revision": "2620241014e7e33fba092e7baa809ca7"
  },
  {
    "url": "app/scripts/app.html",
    "revision": "c221b44afde92e8b2282cbe169617b9b"
  },
  {
    "url": "app/scripts/app.js",
    "revision": "34cd6e9c9f71822dececb185d00a68f4"
  },
  {
    "url": "app/scripts/colorPalettes.js",
    "revision": "2f87f0dff93ffeaf19517c3b50c8c78d"
  },
  {
    "url": "app/scripts/colorScales.js",
    "revision": "bd0399f10e3a8d2ee087f47b073423bf"
  },
  {
    "url": "app/scripts/download.js",
    "revision": "62c5e386774c760f73e623039a9a520f"
  },
  {
    "url": "app/scripts/element-ui.js",
    "revision": "ff647c235407f4d7b81de68d0d5bf5c7"
  },
  {
    "url": "app/scripts/getChunkFileData.js",
    "revision": "757b1ef6ffa9e978d78479dafa60e076"
  },
  {
    "url": "app/scripts/getFileData.js",
    "revision": "f28d255fd9ff5c13008fad9813ae7840"
  },
  {
    "url": "app/scripts/objectDiff.js",
    "revision": "4820ee80b74408f850bc01d87666242f"
  },
  {
    "url": "app/scripts/saveAnimService/ffmpegEncoder.js",
    "revision": "62d398c5de5d0acd3bd19568c49b2dea"
  },
  {
    "url": "app/scripts/saveAnimService/filetypes.js",
    "revision": "0c4f5e52abdbf4ba4eb34c64e901a0cf"
  },
  {
    "url": "app/scripts/saveAnimService/gifEncoder.js",
    "revision": "dc073ef9317f1a238d86df3bb6315434"
  },
  {
    "url": "app/scripts/saveAnimService/imageEncoder.js",
    "revision": "4f455e21ebc00575e3a42f0e715be056"
  },
  {
    "url": "app/scripts/saveAnimService/index.js",
    "revision": "ba4d836778e031545a187a9168fe7f34"
  },
  {
    "url": "app/scripts/saveAnimService/resizeCanvas.js",
    "revision": "58ee120a92c2721bf8664231a0715b45"
  },
  {
    "url": "app/scripts/saveAnimService/webmEncoder.js",
    "revision": "9ebb3bfbf9917ab76708c19e7ecae129"
  },
  {
    "url": "app/scripts/store.js",
    "revision": "5541a5bf2a540edb4309884140576dc2"
  },
  {
    "url": "app/styles/base.css",
    "revision": "7df4db6fc6e51d38c98f6785870e47ef"
  },
  {
    "url": "app/styles/fonts.css",
    "revision": "7b3485abd31e3b095767c9e7273db594"
  },
  {
    "url": "app/styles/fonts/icomoon.svg",
    "revision": "b748ba8da76ab7aca411e4fdc01d957f"
  },
  {
    "url": "webpack.config.js",
    "revision": "991e3c8ae4340b4bd9b42cdf4bbe775a"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.suppressWarnings();
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});
