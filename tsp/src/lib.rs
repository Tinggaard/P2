extern crate console_error_panic_hook;
use std::panic; 
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn add(static_route: &[usize], weights: &[i32], n: usize) -> usize {
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    let mut static_len = 0;
    let mut current_index = 0;

    // iterate the static route from current_index to node
    for node in static_route.iter() {
        static_len += weights[current_index*n + node];
        current_index = *node;
    }

    // heaps alg to get all combinations
    let mut result = Vec::new();
    let mut arr: [usize; 3] = [1, 2, 3]; // change this

    heaps(arr.len(), &mut arr, &mut result);

    let mut shortest = i32::MAX;
    let mut current;
    let mut shortest_index = 0;


    // find shortest of all combinations
    for (i, res) in result.iter().enumerate() {
        current = 0;

        for node in res.iter() {
            current += weights[current_index*n + node];
            current_index = *node;
        }

        // add back to start node
        current += weights[current_index*n];

        // save index and length if shortest
        if current < shortest {
            shortest = current;
            shortest_index = i;
        }
    }
    log_usize(shortest_index);

    shortest_index
}

fn heaps(k: usize, arr: &mut [usize], result: &mut Vec<Vec<usize>>) {
    if k == 1 {
        log_arr(arr);
        result.push(arr.to_vec());
        return;
    }
    
    heaps(k - 1, arr, result);

    for i in 0..k - 1 {
        if k % 2 == 0 {
            arr.swap(i, k-1);
        } else {
            arr.swap(0, k-1);
        }
        heaps(k - 1, arr, result);
    }
}

#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_i32(a: i32);

    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_usize(a: usize);

    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_arr(a: &[usize]);
}
