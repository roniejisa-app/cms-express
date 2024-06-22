const FIELD_TYPE_SELECT_ASSOC = 'selectAssoc'
const FIELD_TYPE_INTEGER = 'integer'
const FIELD_TYPE_PERMISSION = 'permissions'
const FIELD_TYPE_SLUG = 'slug'
const ARRAY_TYPE_HAS_MULTIPLE = ['selectMultiAssoc', 'chooseBeLongToMany']
const ARRAY_TYPE_HAS_DATA = [
    'selectAssoc',
    'selectMultiAssoc',
    'selectParentAssoc',
    'chooseBeLongToMany',
]
const IS_NOT_ADD = false

const ARRAY_LIST_MODULE_ROOT = [
    'roles',
    'users',
    'permissions',
    'modules',
    'medias',
    'settings',
    'manager_modules',
]

module.exports = {
    FIELD_TYPE_SELECT_ASSOC,
    FIELD_TYPE_INTEGER,
    FIELD_TYPE_PERMISSION,
    FIELD_TYPE_SLUG,
    ARRAY_TYPE_HAS_DATA,
    ARRAY_TYPE_HAS_MULTIPLE,
    IS_NOT_ADD,
    ARRAY_LIST_MODULE_ROOT,
}
