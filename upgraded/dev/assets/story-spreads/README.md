# Painted book spreads - 25 September 2026

The 17 JPEG files are genuine expanded scene illustrations, edited with the built-in `image_gen` tool. Original square illustrations remain in `../story-edition` for games, the cover, and source history.

`provenance.json` records the final prompt, generated source path, output filename, and the additional cleanup edit where applicable. The generated PNGs were converted to JPEG at quality 94 with no chroma subsampling; no painting or outpainting was synthesized in code.

The website places selectable Hebrew text directly on the quiet painted areas. Two adjoining image crops form each desktop/printed spread. Selected scenes have opening sentences above the action. Phone and enlarged-reading layouts keep all prose together on a quieter crop with room to grow vertically. The transparent black logo is added by the existing branding renderer, once per physical page.

Validation: `verify-painted-book.cjs`, `verify-painted-large.cjs`, `verify-b-variants.cjs`, and `verify-b-edition-offline.cjs`. The PDF checks cover full A4 pages and right-bound folded A4 booklets. Phone sizes are browser simulations; physical phones and printers were not used.
