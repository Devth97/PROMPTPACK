# Product source audit

Reviewed 17 October 2026 (Asia/Kolkata). Repository revisions and immutable license links are recorded in `catalog/sources.json`.

The public pages at promptbase.shop describe courses and software kits for carousels, 3D websites, generated video, code animation, lyric edits and related workflows. The inspected sales pages did not establish that their exact paid source files or lesson text were publicly licensed. Their public daily page also links to separate tool guides. Public visibility of a project is not evidence that a separate storefront's course is included in its repository.

PromptPack's eleven editions are independently written guides and original examples for the same broad types of work. They are not represented as copies of those courses, or as the work of their authors. No competitor imagery, recordings, proprietary lesson text, customer results or paid archives are included.

| Workflow | Public source reviewed | Recorded license | Use in this edition |
| --- | --- | --- | --- |
| 3D page | [Three.js](https://github.com/mrdoob/three.js) | MIT | Documentation reference; the starter loads a pinned module separately |
| Code animation | [HyperFrames](https://github.com/heygen-com/hyperframes) | Apache-2.0 | Render framework; local examples include adapted registry material with notices |
| Video shot planning | [Diffusers](https://github.com/huggingface/diffusers) | Apache-2.0 | Reference for model-specific generation; no weights or generated footage bundled |
| Transcription | [Whisper](https://github.com/openai/whisper) | MIT | Optional transcription reference; no model weights or automatic lyric-accuracy claim |
| Browser checks | [Playwright](https://github.com/microsoft/playwright) | Apache-2.0 | Testing/export documentation reference |
| Image rendering | [Pillow](https://github.com/python-pillow/Pillow) | MIT-CMU, as stated in its LICENSE | Dependency for original local examples; not bundled in buyer ZIPs |
| Pixel editing | [LibreSprite](https://github.com/LibreSprite/LibreSprite) | GPL-2.0 | Optional editor reference; no editor code or binary included |
| Upload integration | [Google API Node client](https://github.com/googleapis/google-api-nodejs-client) | Apache-2.0 | Optional integration reference; local utility never uploads |
| Social writing | [Instagram agent skill](https://github.com/Jakeschincariol/instagram-agent-skill) | MIT | Public alternative and workflow reference; not repackaged |
| Social publishing | [Instagram MCP](https://github.com/postoncehq/instagram-mcp) | MIT | Optional service integration reference; hosted account and fees remain separate |

GitHub's license API returned `NOASSERTION` for Pillow. Its actual LICENSE explicitly states MIT-CMU; the source register preserves both facts. Software licenses do not establish permissions for separate model weights, reference photographs, voices, recordings or hosted services. Each guide states its own requirements and boundaries.

## Deliverables and verification

`product-build/editions/` contains buyer archives and a combined bundle. It is excluded from Git and deployment. Original guide content and starter sources are in `private/catalog/`; the original older draft generator is retained but is superseded by `scripts/build-product-editions.py` for edition 1.1.

Public pages show actual guide interiors, original example images, per-edition contents and source links. The eleven new checkout products are not configured. Existing Website and Finance checkout paths are retained.

Local checks cover PDF text and bounds, archive integrity and hashes, sample utility behavior, generated images, public asset links and existing payment handlers. A local example does not validate paid model generation, a live platform account or buyer delivery through a not-yet-configured checkout.
