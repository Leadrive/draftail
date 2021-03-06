import {
    BLOCK_TYPE,
    ENTITY_TYPE,
    INLINE_STYLE,
    FONT_FAMILY_MONOSPACE,
    CUSTOM_STYLE_MAP,
    BR_TYPE,
    UNDO_TYPE,
    REDO_TYPE,
    KEY_CODES,
    INPUT_BLOCK_MAP,
    INPUT_ENTITY_MAP,
    LABELS,
    DESCRIPTIONS,
    KEYBOARD_SHORTCUTS,
    HANDLED,
    NOT_HANDLED,
    DRAFT_MAX_DEPTH,
    MAX_SUPPORTED_LIST_NESTING,
} from '../api/constants';

describe('constants', () => {
    it('#BLOCK_TYPE', () => expect(BLOCK_TYPE).toBeDefined());
    it('#ENTITY_TYPE', () => expect(ENTITY_TYPE).toBeDefined());
    it('#INLINE_STYLE', () => expect(INLINE_STYLE).toBeDefined());
    it('#FONT_FAMILY_MONOSPACE', () =>
        expect(FONT_FAMILY_MONOSPACE).toBeDefined());
    it('#CUSTOM_STYLE_MAP', () => expect(CUSTOM_STYLE_MAP).toBeDefined());
    it('#BR_TYPE', () => expect(BR_TYPE).toBeDefined());
    it('#UNDO_TYPE', () => expect(UNDO_TYPE).toBeDefined());
    it('#REDO_TYPE', () => expect(REDO_TYPE).toBeDefined());
    it('#KEY_CODES', () => expect(KEY_CODES).toBeDefined());
    it('#INPUT_BLOCK_MAP', () => expect(INPUT_BLOCK_MAP).toBeDefined());
    it('#INPUT_ENTITY_MAP', () => expect(INPUT_ENTITY_MAP).toBeDefined());
    it('#LABELS', () => expect(LABELS).toBeDefined());
    it('#DESCRIPTIONS', () => expect(DESCRIPTIONS).toBeDefined());
    it('#KEYBOARD_SHORTCUTS', () => expect(KEYBOARD_SHORTCUTS).toBeDefined());
    it('#HANDLED', () => expect(HANDLED).toBeDefined());
    it('#NOT_HANDLED', () => expect(NOT_HANDLED).toBeDefined());
    it('#DRAFT_MAX_DEPTH', () => expect(DRAFT_MAX_DEPTH).toBeDefined());
    it('#MAX_SUPPORTED_LIST_NESTING', () =>
        expect(MAX_SUPPORTED_LIST_NESTING).toBeDefined());
});
