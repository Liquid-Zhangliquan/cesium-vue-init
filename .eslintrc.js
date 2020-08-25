module.exports = {
  root: true,
  env: {
    node: true
  },
  globals: {
    Cesium: true,
    viewer: true,
    EZUIKit: true
  },
  extends: [],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': 'off',
    'space-before-function-paren': 0,
    quotes: [1, 'single']
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
