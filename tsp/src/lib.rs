extern crate console_error_panic_hook;
use std::panic;
use wasm_bindgen::prelude::*;

#[allow(non_snake_case)]
#[wasm_bindgen]
pub fn bruteForce(static_route: &[usize], weights: &[usize], n: usize) -> Vec<usize> {
    // print panics to the console in browser
    panic::set_hook(Box::new(console_error_panic_hook::hook));

    // create array of unvisited nodes
    let mut task = (1..n).collect::<Vec<usize>>();
    task.retain(|&x| !static_route.contains(&x));

    let mut shortest_length = usize::MAX; 
    let mut shortest_path = Vec::new(); 

    heaps(task.len(), &mut task, &mut shortest_length, &mut shortest_path, &weights, n, static_route[static_route.len() - 1]);

    shortest_path
}

/* Heaps algorithm used for generating permutations.
/  Instead of pushing each permutation to an array, the path length of
/  each permutation is calculated and compared to the shortest inside
/  of the function to save memory.
*/
fn heaps(k: usize, permutation: &mut Vec<usize>, shortest_length: &mut usize, shortest_path: &mut Vec<usize>, weights: &[usize], n: usize, starting_vertex: usize) {
    if k == 1 {
        let path_length = calc_route_length(permutation, weights, n, starting_vertex); // Calculate the length of the current permutation

        // The length and the permutation is saved if it is smaller than the currently shortest
        if path_length < *shortest_length {
            *shortest_length = path_length;
            *shortest_path = permutation.clone();
        }

        return;
    }
    
    heaps(k - 1, permutation, shortest_length, shortest_path, weights, n, starting_vertex);

    for i in 0..k - 1 {
        if k % 2 == 0 {
            permutation.swap(i, k-1);
        } else {
            permutation.swap(0, k-1);
        }
        heaps(k - 1, permutation, shortest_length, shortest_path, weights, n, starting_vertex);
    }
}

// Function calculates the length of a given route/permutation
fn calc_route_length(permutation: &mut [usize], weights: &[usize], n: usize, starting_vertex: usize) -> usize {
    let mut path_length = 0;
    let mut last_vertex = starting_vertex;

    // Iterate over the vertices in the permutation and add up the weights/distances
    for vertex in permutation.iter() {
        path_length += weights[last_vertex*n + *vertex];  // Add the distance from the last vertex to this one.
        last_vertex = *vertex; // Update the last vertex to the current one.

    }

    // Add the distance from the last vertex back to the starting vertex.
    path_length += weights[last_vertex*n];  
    
    return path_length;
}
