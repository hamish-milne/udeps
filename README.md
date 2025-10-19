# udeps

A micro-dependency manager for TypeScript and JavaScript projects.

> [!WARNING] 
> This project a proof-of-concept in its early stages. Use at your own risk.

## Build & Run

```bash
yarn
yarn build
node . # Displays help message
```

## License

The CLI tool is licensed under the [MIT License](./LICENSE). The registry code is licensed under the [BSD Zero Clause License](./registry/LICENSE), allowing micro-dependencies to be used freely in any project without license attribution.

Registry micro-dependencies are straightforward expressions of obvious concepts that we consider fundamentally uncopyrightable. The 0BSD license is functionally equivalent to a public domain dedication while avoiding legal complications and organizational policies relating to public domain software.

You are responsible for complying with the license terms of third-party registries in your configuration. The CLI will warn you if it doesn't detect 'BSD Zero Clause License', '0BSD License', or 'public domain' in a registry file's first comment block, but it does not verify licenses comprehensively.
