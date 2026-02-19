# Changelog

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
