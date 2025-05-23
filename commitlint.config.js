module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [2, 'always', 100],
    'subject-case': [0, 'never', ['upper-case', 'pascal-case', 'start-case']],
  },
};
