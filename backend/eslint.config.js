const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
    { ignores: ["node_modules"] },
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: globals.node,
        },
        ...js.configs.recommended,
    },
];
