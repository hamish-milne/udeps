# udeps

A micro-dependency manager for TypeScript and JavaScript projects.

## Motivation

The modern JavaScript ecosystem has experienced a proliferation of 'micro-dependencies': very small npm packages that export single functions, often only a few lines of code. This situation has led to bloated dependency trees, increased security vulnerabilities, and maintenance challenges.

`udeps` provides an alternative: a registry of vetted micro-dependencies that can be inlined directly into your project, reducing reliance on external packages while offering a convenient repository of useful utility functions. These functions are deliberately kept simple and free of external dependencies, making them easy to audit and maintain. This approach has several benefits:

- **Improved Developer Experience**: A smaller dependency tree means faster installs, fewer version conflicts, and a more manageable codebase.
- **Improved Security**: Fewer external dependencies mean a smaller attack surface and reduced risk of supply chain attacks.
- **Easier Maintenance**: Instead of being hidden in the dependency tree, the code is directly accessible within the project, making it easier to understand and modify.
- **Performance Gains**: Traditional micro-dependencies tend to [grow in size and complexity over time](https://43081j.com/2025/09/bloat-of-edge-case-libraries). By focusing on essential functionality and avoiding the defensive coding of API boundaries, `udeps` functions can be significantly more lean and efficient.
- **Auditing Native Replacements**: When adding a function, the `udeps` CLI lets you know if the functionality can be achieved using native web or Node.js APIs depending on your project's target platform.

## Getting started

`udeps` works out of the box with zero configuration.

```bash
npx udeps # Displays help message
npx udeps search objectFilter # Search for micro-dependencies
npx udeps add objectFilter # Add micro-dependency to your project
```

## Configuration

The CLI looks for a `udeps.json` file in your project's root directory. You can customize the registry URL, target platform, and other settings in this file. For example:

```jsonc
{
  "project": ".", // Path to your project root. By default, searches for the nearest package.json
  "outputFile": "udeps.ts", // File to output micro-dependencies to. Can be .ts or .js.
  "lib": [
    // The set of supported platform libraries, matching TypeScript's `lib` option, plus 'node' for Node.js built-ins.
    // Include "[inherit]" to use the libs specified in your tsconfig.json.
    "[inherit]"
  ],
  "registry": [
    // The set of registry files to use. Can be .ts or .js files in the ESM format. HTTP URLs and local paths are supported.
    // Where multiple supported functions with the same name exist, earlier registries take precedence.
    "https://raw.githubusercontent.com/hamish-milne/udeps/refs/heads/master/registry/main.ts",
    "https://raw.githubusercontent.com/hamish-milne/udeps/refs/heads/master/registry/compat.ts"
  ]
}
```

## License

The CLI tool is licensed under the **MIT License**. The registry code is licensed under the **BSD Zero Clause License**, allowing micro-dependencies to be used freely in any project without license attribution.

Registry micro-dependencies are straightforward expressions of obvious concepts that we consider fundamentally uncopyrightable. The 0BSD license is functionally equivalent to a public domain dedication while avoiding legal complications and organizational policies relating to public domain software.

You are responsible for complying with the license terms of third-party registries in your configuration. The CLI will warn you if it doesn't detect 'BSD Zero Clause License', '0BSD', or 'public domain' in a registry file's `@license` tag, but it does not verify licenses comprehensively.
