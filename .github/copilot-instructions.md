# GitHub Copilot Custom Coding Instructions

## Architectural Preferences
- **Class Objects:** Use class objects where possible.
- **React Components:** Use ES6 class based components for React. Avoid Function Components.

## Naming Conventions
- **Variables, Methods, and Parameters:** Use **snake_case** — e.g. get_orbit_pos, time_vector
- **Class Names:** Use **Pascal_Snake_Case** — e.g. Orbit_Data_Store
- **Enums:** Use **MOSTLY_Caps** (first letter capitalized per word) — e.g. DATA_Format
- **Constants:** Use **ALL_CAPS** — e.g. DEFAULT_MAX_POINTS

## Code Style & Formatting
- **Brace Style:** Use **Allman brace style** throughout — all opening braces { appear on a new line, indented to match the block they open (applies to classes, methods, control flow, object literals, and switch cases).
- **Semicolons:** Use no semicolons on single-line statements; semicolons used intentionally only on multiline return expressions (closing };). Do not add semi-colons at the end of statements (rely on Prettier automatic formatting).
- **Call and Declaration Spacing:** Put spaces before parentheses in function calls and declarations — e.g. registry.get (id), Math.floor (index), constructor ().
- **If Statement Spacing:** Use two spaces before the condition in an if — if (condition) — creating visual separation between the keyword and the test expression.
- **Vertical Whitespace:** Use generous vertical whitespace — blank lines between logical steps within methods, and between methods.
- **Variable Declarations:** Always use `const` by default; use `let` only when re-assignment is explicitly required. Never use `var`.
- **Intermediate Variables:** Give each local variable a single responsibility — intermediate results are assigned to a named variable before use, even when a one-liner would work (e.g. const length = ...; return length).

## Comments & Documentation
- **JSDoc Placement:** Write JSDoc block comments inside the method body, placed after the opening brace rather than above the signature.
- **Inline Comments:** Write inline comments as narrative — comments explain intent and reasoning step-by-step, written in full sentences.

## Error Handling & Robustness
- **Try/Catch Usage:** Never use try/catch blocks except when absolutely necessary, and always handle errors explicitly rather than silently ignoring them.
- **Error Logging:** Never swallow errors; always log the exact error to the console using `console.error()`.
- **Function Return Values:** Functions should generally return null on error.
- **Exceptions:** Avoid throwing exceptions for control flow; use return values to indicate failure instead.

## Testing Expectations
- **Test File Creation:** Every time you create a new logic file, you must create a corresponding `.test.js` file in the same directory.
- **Edge Case Coverage:** Ensure test coverage handles edge cases (e.g., empty arrays, null values, timeout errors).
