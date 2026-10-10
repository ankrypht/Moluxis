# Changelog

## [2.1.0](https://github.com/ankrypht/Moluxis/compare/v2.0.4...v2.1.0) (2026-10-10)


### Features

* add compound export and share functionality with 3D snapshots ([32239ee](https://github.com/ankrypht/Moluxis/commit/32239ee263c28739a104c55668eaa1a2f58e826d))
* implement multi-tier caching, PubChem rate limiting, and circuit breaker resilience ([df039b0](https://github.com/ankrypht/Moluxis/commit/df039b035fda3498950f939a289ccb3f42d61c57))
* implement recent search history, offline bookmarks, and jump back in carousel ([e42e27c](https://github.com/ankrypht/Moluxis/commit/e42e27c6815565d1459b02e83d14d6f92d1c38f7))
* implement themed custom alert popup replacing native Alert ([783acfd](https://github.com/ankrypht/Moluxis/commit/783acfd8cfaa6a7cf6032d432d1ea7f501ef083f))
* integrate expo-haptics for tactile feedback across viewer and search interactions ([cf90080](https://github.com/ankrypht/Moluxis/commit/cf90080da7973dca6de60002f91a85f35d049dff))
* introduce curated featured molecules showcase on launch ([5440bec](https://github.com/ankrypht/Moluxis/commit/5440bec9650c0a4b58d59dce95c528a1a4f63f39))
* **showcase:** add category pill tabs with persistent category selection ([fc0ce3b](https://github.com/ankrypht/Moluxis/commit/fc0ce3bfc0e1696c51d15022e030c48c39ab7636))
* **ui:** refine visual design accents, enhance control accessibility, and add test coverage ([9885abb](https://github.com/ankrypht/Moluxis/commit/9885abb8a27d77cab6b4e9cc4981d0ccf1b42ec7))


### Bug Fixes

* **cache:** resolve search race conditions, fix loading state on hits, and add LRU bounds ([52a4a37](https://github.com/ankrypht/Moluxis/commit/52a4a372925ee4b4e363b678d0a7441b64a48fe2))
* configure expo-splash-screen plugin and manage splash lifecycle ([8ad7c16](https://github.com/ankrypht/Moluxis/commit/8ad7c1685cae3429b85c47fc407d58ffc67c0119))
* enhance robustness, component memoization, device layouts, and key uniqueness ([3d58474](https://github.com/ankrypht/Moluxis/commit/3d5847490c7052fb197e4f479561c527a46331c9))
* remove redundant useMemo to satisfy React Compiler memoization inference ([19e8971](https://github.com/ankrypht/Moluxis/commit/19e8971e9058fa31e5a07b07bb515d7ba559a911))
* replace 3Dmol spin loop with throttled rAF and pause WebGL on input to eliminate ANRs ([21ea944](https://github.com/ankrypht/Moluxis/commit/21ea9440fc0ef783538a336778cbdaff172d76d2))
* reset molecule rotation animation state when switching molecules or performing new searches ([76d42f2](https://github.com/ankrypht/Moluxis/commit/76d42f247ef7f104d9d0e3f08889e6c1c141ed12))
* resolve blank viewer race condition on cold install and improve readiness handshake ([f0eff92](https://github.com/ankrypht/Moluxis/commit/f0eff9210737b16c1e32f8f5a519126bc11d88ad))
* resolve snapshot lifecycle issues, file path normalization, and bookmark merging bugs ([55a83ed](https://github.com/ankrypht/Moluxis/commit/55a83ede3be40bb9b5c2c92580025da99ae17677))
* **review:** optimize store review check and add play store URL fallback ([393c08c](https://github.com/ankrypht/Moluxis/commit/393c08cb17f5bfcf06aa191a1919e072dc32abf9))


### Performance Improvements

* optimize component memoization, cache bounds, responsive styles, and navigation bar persistence ([ff37960](https://github.com/ankrypht/Moluxis/commit/ff379607308b55f1ccf957f891a5258eb6ce6623))

## [2.0.4](https://github.com/ankrypht/Moluxis/compare/v2.0.3...v2.0.4) (2026-10-07)


### Bug Fixes

* eliminate WebView hardware layer deadlocks and RenderThread ANRs ([5f514da](https://github.com/ankrypht/Moluxis/commit/5f514da2b69d11fe9ceff3db1dac5a9d5412386c))

## [2.0.3](https://github.com/ankrypht/Moluxis/compare/v2.0.2...v2.0.3) (2026-09-28)


### Bug Fixes

* resolve WebView WebGL deadlocks and input dispatching ANRs ([e7f8857](https://github.com/ankrypht/Moluxis/commit/e7f8857c8562a0ba110127471713c1e6111e5eaa))

## [2.0.2](https://github.com/ankrypht/Moluxis/compare/v2.0.1...v2.0.2) (2026-09-03)


### Bug Fixes

* cancel in-flight autocomplete requests to prevent race conditions ([80787a8](https://github.com/ankrypht/Moluxis/commit/80787a87721add5a7d5231046a3df23e9a335135))


### Performance Improvements

* enable R8 code shrinking, Metro inline requires, and update dependencies ([a69066f](https://github.com/ankrypht/Moluxis/commit/a69066fb0a1a6f371b0ec414217e856cc53cca9b))
* memoize responsive style calculations and statically allocate viewer template ([370a5c7](https://github.com/ankrypht/Moluxis/commit/370a5c755358c7ec87520d7bea16546a7a315b70))

## [2.0.1](https://github.com/ankrypht/Moluxis/compare/v2.0.0...v2.0.1) (2026-08-15)


### Performance Improvements

* upgrade Expo SDK to version 57, React Native to 0.86.2, and update project dependencies ([6cad695](https://github.com/ankrypht/Moluxis/commit/6cad695a95304f9e3e0a1450ecf5753bd7c721db))

## [2.0.0](https://github.com/ankrypht/Moluxis/compare/v1.6.0...v2.0.0) (2026-06-07)


### ⚠ BREAKING CHANGES

* redesign UI landscape layout and introduce zen mode

### Features

* implement PubChem search integration with autocomplete and cache, add UI components, and upgrade project dependencies ([0a10df6](https://github.com/ankrypht/Moluxis/commit/0a10df65730700bb18dc580a3d845c747d8b7b3e))
* redesign UI landscape layout and introduce zen mode ([fc43877](https://github.com/ankrypht/Moluxis/commit/fc43877df029daa18b8374fb7670458d73963b4c))

## [1.6.0](https://github.com/ankrypht/Moluxis/compare/v1.5.0...v1.6.0) (2026-05-01)


### Features

* implement responsive UI scaling and enable system font scaling ([ddc3639](https://github.com/ankrypht/Moluxis/commit/ddc36397e6fff2ca752a3ef4833ec98e0fc1251a))


### Bug Fixes

* center align compound name ([85306d7](https://github.com/ankrypht/Moluxis/commit/85306d7bd171a7e62acecdcd2ab74a0dcb7a836f))

## [1.5.0](https://github.com/ankrypht/Moluxis/compare/v1.4.0...v1.5.0) (2026-04-23)


### Features

* add in-app review request functionality ([ba64f10](https://github.com/ankrypht/Moluxis/commit/ba64f10406adfa02293b6040f9a155fb121599f1))


### Performance Improvements

* optimize ChemicalFormula to reduce React nodes ([#71](https://github.com/ankrypht/Moluxis/issues/71)) ([e19ea13](https://github.com/ankrypht/Moluxis/commit/e19ea134ddb5aff78b2e31be66b964e9f3c353b0))
* optimize recursive findCodId by avoiding Object.keys ([#70](https://github.com/ankrypht/Moluxis/issues/70)) ([38c54d4](https://github.com/ankrypht/Moluxis/commit/38c54d4a7d42bfc56392f4306a07d8fd22b213ab))

## [1.4.0](https://github.com/ankrypht/Moluxis/compare/v1.3.0...v1.4.0) (2026-04-20)


### Features

* **viewer:** add animate toggle ([b77fd7f](https://github.com/ankrypht/Moluxis/commit/b77fd7fffd5db4eb91d0b5f95cb245cdb3e191ad))


### Bug Fixes

* **viewer:** refine 3D molecular visualization & labeling styles ([4adb7ad](https://github.com/ankrypht/Moluxis/commit/4adb7ade4fbf0323bd50aed05d585321a653ab5d))

## [1.3.0](https://github.com/ankrypht/Moluxis/compare/v1.2.0...v1.3.0) (2026-04-18)


### Features

* implement responsive landscape layout ([7a4b65d](https://github.com/ankrypht/Moluxis/commit/7a4b65dbf410a73093775eacac20f4d6cd45f06f))


### Bug Fixes

* preserve visualization style on orientation change ([2d46fd3](https://github.com/ankrypht/Moluxis/commit/2d46fd32a259cdb510243d151ea3dd588419afc1))

## [1.2.0](https://github.com/ankrypht/Moluxis/compare/v1.1.0...v1.2.0) (2026-04-17)


### Features

* implement 2D/3D structure switching and optimize data fetching ([70b3f2b](https://github.com/ankrypht/Moluxis/commit/70b3f2b493c0510192549cf81f35a1654bcdb78d))


### Bug Fixes

* **security:** restrict WebView originWhitelist and set baseUrl ([#57](https://github.com/ankrypht/Moluxis/issues/57)) ([4dcbb2d](https://github.com/ankrypht/Moluxis/commit/4dcbb2df9778850831586be412be54386125f084))
* **security:** Validate PubChem and COD IDs before opening external links ([#55](https://github.com/ankrypht/Moluxis/issues/55)) ([87c49b4](https://github.com/ankrypht/Moluxis/commit/87c49b4de9d30982a27b9131d63a91c1391ba06c))
* **security:** validate WebView message structure ([#50](https://github.com/ankrypht/Moluxis/issues/50)) ([fabffb2](https://github.com/ankrypht/Moluxis/commit/fabffb203482bccb98f49d1bcdba6991b3b7d61a))


### Performance Improvements

* optimize autocomplete deduplication ([#51](https://github.com/ankrypht/Moluxis/issues/51)) ([5b7c45f](https://github.com/ankrypht/Moluxis/commit/5b7c45f2df982140a5210b28c30e5b8f352e43db))
* optimize ChemicalFormula rendering with memoization and single-pass loop ([#53](https://github.com/ankrypht/Moluxis/issues/53)) ([2dc8585](https://github.com/ankrypht/Moluxis/commit/2dc858594d595600b2d37e256356491c7dfea3b9))

## [1.1.0](https://github.com/ankrypht/Moluxis/compare/v1.0.1...v1.1.0) (2026-04-04)


### Features

* support more compounds including inorganic ([fc6cf70](https://github.com/ankrypht/Moluxis/commit/fc6cf70cc229466b62a06b5ab35f37634b78f9a9))


### Bug Fixes

* 🔒 validate external compound ID to prevent path traversal ([#42](https://github.com/ankrypht/Moluxis/issues/42)) ([198cc05](https://github.com/ankrypht/Moluxis/commit/198cc0520eb90549354f2e9a78fd31cf2fa35a92))
* sanitize error logs in useMoleculeSearch hook ([#46](https://github.com/ankrypht/Moluxis/issues/46)) ([72edaca](https://github.com/ankrypht/Moluxis/commit/72edacaf95e96e58960081f9ade3cc503137a86e))


### Performance Improvements

* extract inline array allocation to constant in App.tsx ([#40](https://github.com/ankrypht/Moluxis/issues/40)) ([2e808e6](https://github.com/ankrypht/Moluxis/commit/2e808e64bf5dee38d4652712bf3bd4416323adc6))
* hoist regex literal out of ChemicalFormula render loop ([#38](https://github.com/ankrypht/Moluxis/issues/38)) ([7a52dc4](https://github.com/ankrypht/Moluxis/commit/7a52dc4ee6af696f6460c1192f9553b7b5d52b20))
* implement caching for autocomplete API calls ([#33](https://github.com/ankrypht/Moluxis/issues/33)) ([98332ba](https://github.com/ankrypht/Moluxis/commit/98332baca267a6eaf38430e83cd8d2b1ed03c32d))
* implement caching for molecule search data ([#47](https://github.com/ankrypht/Moluxis/issues/47)) ([409cd4d](https://github.com/ankrypht/Moluxis/commit/409cd4d3d89f68290f3315bda2b5ca2280097807))
* optimize inline mappings in App.tsx using useMemo ([#35](https://github.com/ankrypht/Moluxis/issues/35)) ([912eb36](https://github.com/ankrypht/Moluxis/commit/912eb36f3a7763e10fb9024ae167796eef41d1ec))

## [1.0.1](https://github.com/ankrypht/Moluxis/compare/v1.0.0...v1.0.1) (2026-02-19)


### Bug Fixes

* restrict WebView origin whitelist to about:blank ([#3](https://github.com/ankrypht/Moluxis/issues/3)) ([c292632](https://github.com/ankrypht/Moluxis/commit/c2926324712bd55e1c1cabf358b7030c519c7fb8))
* sanitize user input in useMoleculeSearch hook ([#9](https://github.com/ankrypht/Moluxis/issues/9)) ([6837450](https://github.com/ankrypht/Moluxis/commit/6837450933c08e6a899582671ccef057eb9c36d9))
* **security:** add Content Security Policy to viewer HTML ([#14](https://github.com/ankrypht/Moluxis/issues/14)) ([7e3355f](https://github.com/ankrypht/Moluxis/commit/7e3355f93f6434711e326db9a9ae5509499a2e59))


### Performance Improvements

* debounce molecule search input by 300ms ([#17](https://github.com/ankrypht/Moluxis/issues/17)) ([5d32326](https://github.com/ankrypht/Moluxis/commit/5d323261e2443b2568c17216462eed4e503dc1ea))
* Optimize chemical property extraction ([ec10af9](https://github.com/ankrypht/Moluxis/commit/ec10af98a75c67e5eb4c5614a47d9698437764cf))
* optimize FlatList key extractor and deduplicate suggestions ([#11](https://github.com/ankrypht/Moluxis/issues/11)) ([32382cb](https://github.com/ankrypht/Moluxis/commit/32382cb0a421d9e66cf66e8524afa9780521d7b3))
* optimize molecule search with parallel requests ([#10](https://github.com/ankrypht/Moluxis/issues/10)) ([d5d1605](https://github.com/ankrypht/Moluxis/commit/d5d1605b086cdc90e8fa37ebd7e0b0d72a7f4bb6))
* optimize renderSuggestionItem re-creation ([#21](https://github.com/ankrypht/Moluxis/issues/21)) ([cfa315c](https://github.com/ankrypht/Moluxis/commit/cfa315c0eb05819c014012d892167b792cc03687))
* optimize SuggestionItem rendering performance ([#20](https://github.com/ankrypht/Moluxis/issues/20)) ([1ef8cf2](https://github.com/ankrypht/Moluxis/commit/1ef8cf28986e3573838625d9067591078de9aac3))
