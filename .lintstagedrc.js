module.exports = {
  '**/*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '**/*.{json,md,yaml,yml}': ['prettier --write'],
  '**/*.{css,scss}': ['prettier --write'],
};
