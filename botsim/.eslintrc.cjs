module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: null,
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
        },
    },
    plugins: ["@typescript-eslint"],
    extends: ["plugin:@typescript-eslint/recommended"],
    rules: {
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-unused-vars": [
            "error",
            { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        // Empty method bodies are intentional for interface implementations
        "@typescript-eslint/no-empty-function": "off",
        // Explicit types on initialised variables are allowed
        "@typescript-eslint/no-inferrable-types": "off",
        eqeqeq: ["error", "always"],
        // Console is the intended output channel for a browser simulator app
        "no-console": "off",
    },
    ignorePatterns: ["build/**", "node_modules/**"],
}
