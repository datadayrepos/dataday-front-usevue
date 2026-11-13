# NPM Publication

`pnpm run pack:release` runs the existing clean workspace build and dependency normalization, then stages and verifies separate Shared/Core archives. Optional `--out <directory>` is local only. It does not change source dependency selections, versions or lockfiles.

Source package roots and generated dist roots have raw-publication guards. Runtime JS, declarations, JSON assets and required legal notices are retained; README, Markdown documentation, agents, tests and maps are excluded. `publish:ci` validates every package receipt before publishing any package and consumes the exact verified archives without rebuilding and retains existing public/beta settings. Tag-push CI builds/packs in a separate step before publishing credentials are supplied. Ordinary local publication requires main; the existing GitHub tag workflow permits its detached checkout only when HEAD is exactly the triggering tag. No branch switching is performed. No CI or release operation is authorized by this change.

This fork builds against Vue 3.5.13. Declaration normalization keeps imports on
the declared `vue` dependency rather than undeclared `vue-demi`.
Core's existing `./metadata` subpath bundles the upstream VueUse metadata
compatibility API, including declarations, without a consumer dependency on
`@vueuse/metadata`. This is the upstream catalog, not a discovered inventory of
the reduced fork's exports.
