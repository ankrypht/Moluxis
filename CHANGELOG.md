# Changelog

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
