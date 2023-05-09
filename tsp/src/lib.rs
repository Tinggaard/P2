extern crate console_error_panic_hook;
use std::panic;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn bruteForce(static_route: &[usize], weights: &[usize], n: usize) -> Vec<usize> {
    // print panics to the console in browser
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    // create array of unvisited nodes
    let mut task = (1..n).collect::<Vec<usize>>();
    task.retain(|&x| !static_route.contains(&x));

    // heaps alg to get all combinations
    let mut all_perms = Vec::new();
    heaps(task.len(), &mut task, &mut all_perms);

    let mut current_index = static_route[static_route.len() - 1]; // start node
    let mut shortest = usize::MAX; // shortest route
    let mut current; // current route
    let mut shortest_index = 0; // index of shortest route


    // find shortest of all permutations
    for (i, perm) in all_perms.iter().enumerate() {
        current = 0;
        current_index = 0;

        // get the distance
        for node in perm.iter() {
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

    // get combination that is shortest
    let result = all_perms.remove(shortest_index);

    // return it
    result
}

fn heaps(k: usize, arr: &mut [usize], result: &mut Vec<Vec<usize>>) {
    if k == 1 {
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
