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

While the CLI tool is licensed under the [MIT License](./LICENSE), the registry code is licensed under the [BSD Zero Clause License](./registry/LICENSE). This means that micro-dependencies fetched from the registry can be used freely in any project, without including any license text, and indeed the CLI tool does not care about the licenses of the micro-dependencies it manages.

It is our intention that micro-dependencies in the registry, being straightforward expressions of obvious concepts, should be fundamentally 'uncopyrightable' in that they do not meet the minimum threshold of originality and creativity required for copyright protection. However, to avoid any doubt, we have chosen to license the registry code under the 0BSD license. This is effectively a public domain dedication, but avoids some legal issues around public domain in certain jurisdictions, as well as the policies of some organizations that prevent using or contributing to public domain software.

It is your responsibility to comply with the license terms of any third-party registries in your udeps configuration. The CLI will warn you if it does not detect 'BSD Zero Clause License', '0BSD', or 'public domain' in the first comment block of a registry file, but it does not attempt to fully analyze or verify the license of any micro-dependency or registry.
