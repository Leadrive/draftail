import {
    DefaultDraftBlockRenderMap,
    getDefaultKeyBinding,
    KeyBindingUtil,
} from 'draft-js';
import { filterEditorState } from 'draftjs-filters';

import {
    ENTITY_TYPE,
    BLOCK_TYPE,
    INLINE_STYLE,
    KEY_CODES,
    KEYBOARD_SHORTCUTS,
    CUSTOM_STYLE_MAP,
    INPUT_BLOCK_MAP,
    INPUT_ENTITY_MAP,
    DRAFT_MAX_DEPTH,
    MAX_SUPPORTED_LIST_NESTING,
} from '../api/constants';

const { hasCommandModifier, isOptionKeyCommand } = KeyBindingUtil;

// Hack relying on the internals of Draft.js.
// See https://github.com/facebook/draft-js/pull/869
const IS_MAC_OS = isOptionKeyCommand({ altKey: 'test' }) === 'test';

/**
 * Methods defining the behavior of the editor, depending on its configuration.
 */
export default {
    /**
     * Configure block render map from block types list.
     */
    getBlockRenderMap(blockTypes) {
        let renderMap = DefaultDraftBlockRenderMap;

        // Override default element for code block.
        // Fix https://github.com/facebook/draft-js/issues/406.
        if (blockTypes.some(block => block.type === BLOCK_TYPE.CODE)) {
            renderMap = renderMap.set(BLOCK_TYPE.CODE, {
                element: 'code',
                wrapper: DefaultDraftBlockRenderMap.get(BLOCK_TYPE.CODE)
                    .wrapper,
            });
        }

        blockTypes.filter(block => block.element).forEach(block => {
            renderMap = renderMap.set(block.type, {
                element: block.element,
            });
        });

        return renderMap;
    },

    /**
     * Configure block style function from block types list.
     */
    getBlockStyleFn(blockTypes) {
        const blockClassNames = {
            // Make it easy to style unstyled blocks, which are not configurable like other types.
            unstyled: 'Draftail-unstyled',
        };

        blockTypes.filter(block => block.className).forEach(block => {
            blockClassNames[block.type] = block.className;
        });

        const blockStyleFn = block => {
            const type = block.getType();
            const depth = block.getDepth();
            // Add depth classes that Draft.js doesn't provide.
            // See https://github.com/facebook/draft-js/blob/232791a4e92d94a52c869f853f9869367bdabdac/src/component/contents/DraftEditorContents-core.react.js#L58-L62.
            const depthClass =
                depth > 4
                    ? `Draftail-depth${depth} public-DraftStyleDefault-depth${
                          depth
                      }`
                    : '';
            let className = blockClassNames[type] || '';

            if (depthClass) {
                className = `${className} ${depthClass}`;
            }

            return className;
        };

        return blockStyleFn;
    },

    /**
     * Configure key binding function from enabled blocks, styles, entities.
     */
    getKeyBindingFn(blockTypes, inlineStyles, entityTypes) {
        const getEnabledTypes = (activeTypes, allTypes) => {
            // Go through all the possible types, and check which are enabled.
            return Object.keys(allTypes).reduce((enabled, key) => {
                enabled[key] = activeTypes.some(
                    item => item.type === allTypes[key],
                );

                return enabled;
            }, {});
        };

        const isEnabledBlock = getEnabledTypes(blockTypes, BLOCK_TYPE);
        const isEnabledInline = getEnabledTypes(inlineStyles, INLINE_STYLE);
        const isEnabledEntity = getEnabledTypes(entityTypes, ENTITY_TYPE);

        // Emits key commands to use in `handleKeyCommand` in `Editor`.
        const keyBindingFn = e => {
            // Safeguard that we only trigger shortcuts with exact matches.
            // eg. cmd + shift + b should not trigger bold.
            if (e.shiftKey) {
                // Key bindings supported by Draft.js must be explicitely discarded.
                // See https://github.com/facebook/draft-js/issues/941.
                switch (e.keyCode) {
                    case KEY_CODES.B:
                        return null;
                    case KEY_CODES.I:
                        return null;
                    case KEY_CODES.J:
                        return null;
                    case KEY_CODES.U:
                        return null;
                    case KEY_CODES.X:
                        return isEnabledInline.STRIKETHROUGH &&
                            hasCommandModifier(e)
                            ? INLINE_STYLE.STRIKETHROUGH
                            : null;
                    case KEY_CODES[7]:
                        return isEnabledBlock.ORDERED_LIST_ITEM &&
                            hasCommandModifier(e)
                            ? BLOCK_TYPE.ORDERED_LIST_ITEM
                            : null;
                    case KEY_CODES[8]:
                        return isEnabledBlock.UNORDERED_LIST_ITEM &&
                            hasCommandModifier(e)
                            ? BLOCK_TYPE.UNORDERED_LIST_ITEM
                            : null;
                    default:
                }
            } else {
                switch (e.keyCode) {
                    case KEY_CODES.K:
                        return isEnabledEntity.LINK && hasCommandModifier(e)
                            ? ENTITY_TYPE.LINK
                            : null;
                    case KEY_CODES.B:
                        return isEnabledInline.BOLD && hasCommandModifier(e)
                            ? INLINE_STYLE.BOLD
                            : null;
                    case KEY_CODES.I:
                        return isEnabledInline.ITALIC && hasCommandModifier(e)
                            ? INLINE_STYLE.ITALIC
                            : null;
                    case KEY_CODES.J:
                        return isEnabledInline.CODE && hasCommandModifier(e)
                            ? INLINE_STYLE.CODE
                            : null;
                    case KEY_CODES.U:
                        return isEnabledInline.UNDERLINE &&
                            hasCommandModifier(e)
                            ? INLINE_STYLE.UNDERLINE
                            : null;
                    case KEY_CODES['.']:
                        return isEnabledInline.SUPERSCRIPT &&
                            hasCommandModifier(e)
                            ? INLINE_STYLE.SUPERSCRIPT
                            : null;
                    case KEY_CODES[',']:
                        return isEnabledInline.SUBSCRIPT &&
                            hasCommandModifier(e)
                            ? INLINE_STYLE.SUBSCRIPT
                            : null;
                    case KEY_CODES[0]:
                        // Reverting to unstyled block is always available.
                        return (e.ctrlKey || e.metaKey) && e.altKey
                            ? BLOCK_TYPE.UNSTYLED
                            : null;
                    case KEY_CODES[1]:
                        return isEnabledBlock.HEADER_ONE &&
                            (e.ctrlKey || e.metaKey) &&
                            e.altKey
                            ? BLOCK_TYPE.HEADER_ONE
                            : null;
                    case KEY_CODES[2]:
                        return isEnabledBlock.HEADER_TWO &&
                            (e.ctrlKey || e.metaKey) &&
                            e.altKey
                            ? BLOCK_TYPE.HEADER_TWO
                            : null;
                    case KEY_CODES[3]:
                        return isEnabledBlock.HEADER_THREE &&
                            (e.ctrlKey || e.metaKey) &&
                            e.altKey
                            ? BLOCK_TYPE.HEADER_THREE
                            : null;
                    case KEY_CODES[4]:
                        return isEnabledBlock.HEADER_FOUR &&
                            (e.ctrlKey || e.metaKey) &&
                            e.altKey
                            ? BLOCK_TYPE.HEADER_FOUR
                            : null;
                    case KEY_CODES[5]:
                        return isEnabledBlock.HEADER_FIVE &&
                            (e.ctrlKey || e.metaKey) &&
                            e.altKey
                            ? BLOCK_TYPE.HEADER_FIVE
                            : null;
                    case KEY_CODES[6]:
                        return isEnabledBlock.HEADER_SIX &&
                            (e.ctrlKey || e.metaKey) &&
                            e.altKey
                            ? BLOCK_TYPE.HEADER_SIX
                            : null;
                    default:
                }
            }

            return getDefaultKeyBinding(e);
        };

        return keyBindingFn;
    },

    hasKeyboardShortcut(type) {
        return !!KEYBOARD_SHORTCUTS[type];
    },

    getKeyboardShortcut(type, isMacOS = IS_MAC_OS) {
        const shortcut = KEYBOARD_SHORTCUTS[type];
        const system = isMacOS ? 'macOS' : 'other';

        return (shortcut && shortcut[system]) || shortcut;
    },

    /**
     * Defines whether a block should be altered to a new type when
     * the user types a given mark.
     * This powers the "autolist" feature.
     *
     * Returns the new block type, or false if no replacement should occur.
     */
    handleBeforeInputBlockType(mark, blockTypes) {
        return blockTypes.find(b => b.type === INPUT_BLOCK_MAP[mark])
            ? INPUT_BLOCK_MAP[mark]
            : false;
    },

    handleBeforeInputHR(mark, block) {
        return (
            mark === INPUT_ENTITY_MAP[ENTITY_TYPE.HORIZONTAL_RULE] &&
            block.getType() !== BLOCK_TYPE.CODE
        );
    },

    getCustomStyleMap(inlineStyles) {
        const customStyleMap = {};

        inlineStyles.forEach(style => {
            if (style.style) {
                customStyleMap[style.type] = style.style;
            } else if (CUSTOM_STYLE_MAP[style.type]) {
                customStyleMap[style.type] = CUSTOM_STYLE_MAP[style.type];
            } else {
                customStyleMap[style.type] = {};
            }
        });

        return customStyleMap;
    },

    /**
     * Applies whitelist and blacklist operations to the editor content,
     * so the resulting editor state is shaped according to Draftail
     * expectations and configuration.
     */
    filterPaste(
        {
            maxListNesting,
            enableHorizontalRule,
            enableLineBreak,
            blockTypes,
            inlineStyles,
            entityTypes,
        },
        editorState,
    ) {
        const enabledEntityTypes = entityTypes.slice();
        const whitespacedCharacters = ['\t', '📷'];

        if (enableHorizontalRule) {
            enabledEntityTypes.push({
                type: ENTITY_TYPE.HORIZONTAL_RULE,
            });
        }

        if (!enableLineBreak) {
            whitespacedCharacters.push('\n');
        }

        return filterEditorState(
            {
                blocks: blockTypes.map(b => b.type),
                styles: inlineStyles.map(s => s.type),
                entities: enabledEntityTypes,
                maxNesting: maxListNesting,
                whitespacedCharacters,
            },
            editorState,
        );
    },

    /**
     * Generates CSS styles for list items
     */
    generateListNestingStyles(maxListNesting) {
        const minDepth = DRAFT_MAX_DEPTH + 1;
        const maxDepth = Math.min(maxListNesting, MAX_SUPPORTED_LIST_NESTING);
        let styles = '';

        for (let depth = minDepth; depth <= maxDepth; depth++) {
            const selector = `.Draftail-depth${depth}`;
            const counter = `ol${depth}`;
            const margin = 1.5 * (depth + 1);

            styles += `
            ${selector}.public-DraftStyleDefault-listLTR {
                margin-left: ${margin}em;
            }

            ${selector}.public-DraftStyleDefault-listRTL {
                margin-right: ${margin}em;
            }

            ${selector}.public-DraftStyleDefault-orderedListItem::before {
                content: counter(${counter}) '. ';
                counter-increment: ${counter};
            }

            ${selector}.public-DraftStyleDefault-reset {
                counter-reset: ${counter};
            }
            `.replace(/\s/g, '');
        }

        return styles || null;
    },
};
