# Project 2

[![ESLint](https://github.com/Tinggaard/P2/actions/workflows/eslint.yml/badge.svg)](https://github.com/Tinggaard/P2/actions/workflows/eslint.yml)
[![Node.js Unittest](https://github.com/Tinggaard/P2/actions/workflows/test.yml/badge.svg)](https://github.com/Tinggaard/P2/actions/workflows/test.yml)

## Installation

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

### Server InstanceRunning the latest master build at 

Running the latest master build at [http://10.92.0.183:3000/](http://10.92.0.183:3000/)

Access via VPN or AAU network.
Jenkins runs on port 8080
