/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Type must be one of the following
    "type-enum": [
      2,
      "always",
      [
        "feat", // A new feature
        "fix", // A bug fix
        "docs", // Documentation only changes
        "style", // Changes that do not affect the meaning of the code (formatting, etc.)
        "refactor", // A code change that neither fixes a bug nor adds a feature
        "perf", // A code change that improves performance
        "test", // Adding missing tests or correcting existing tests
        "build", // Changes that affect the build system or external dependencies
        "ci", // Changes to CI configuration files and scripts
        "chore", // Other changes that don't modify src or test files
        "revert", // Reverts a previous commit
      ],
    ],
    // Scope is optional but must be lowercase if provided
    "scope-case": [2, "always", "lower-case"],
    // Subject must not be empty
    "subject-empty": [2, "never"],
    // Subject must not end with a period
    "subject-full-stop": [2, "never", "."],
    // Subject must be in lowercase
    "subject-case": [2, "always", "lower-case"],
    // Header (type + scope + subject) max 100 chars
    "header-max-length": [2, "always", 100],
    // Body must have a blank line before it
    "body-leading-blank": [1, "always"],
    // Footer must have a blank line before it
    "footer-leading-blank": [1, "always"],
  },
};

module.exports = config;
