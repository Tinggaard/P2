# Project 2

[![ESLint](https://github.com/Tinggaard/P2/actions/workflows/eslint.yml/badge.svg)](https://github.com/Tinggaard/P2/actions/workflows/eslint.yml)
[![Node.js Unittest](https://github.com/Tinggaard/P2/actions/workflows/test.yml/badge.svg)](https://github.com/Tinggaard/P2/actions/workflows/test.yml)

## Installation

*Note:* if you are using Windows, symlinks may not work as intended out of the box.
Ensure that "developer mode" is enabled in Windows, which gives `mklink` permissions.
Afterwards, ensure that `core.symlinks` are enabled, once the repo is cloned. 

```bash
git clone -c core.symlinks=true https://github.com/Tinggaard/P2
```

```bash
npm install
```

---

Linting

```bash
npm run lint
```

### WebAssembly

Written in Rust, located in the [`tsp`](/tsp) directory.

Firstly, [install Rust](https://www.rust-lang.org/tools/install), and then install `wasm-pack`.

```bash
cargo install wasm-pack
```

Compiling into wasm:

```bash
cd tsp
wasm-pack build --target web
```

## Running

```bash
node src/server.js
```

### Single computer comparison

For comparing the result with a single computer, a brute force approach has been implemented in the [`single_computer`](/single_computer) directory.

The inputfile (`weights.json`) is statically linked, and thus this file must be run from `single_computer`, directory or the path changed.

```bash
cd single_computer
cargo run
```

### Server instance running the latest master build at 

Running the latest master build at [http://10.92.0.183:3000/](http://10.92.0.183:3000/)

Access via VPN or AAU network.
Jenkins runs on port 8080
