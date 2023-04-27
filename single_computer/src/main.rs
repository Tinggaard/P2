use itertools::Itertools;
use std::fs::File;
use std::time::Instant;

fn main(){
    // Starts timer
    let start_time = Instant::now();

    // Loading in the json file
    let file = File::open("../weights.json")
        .expect("json file error");
    // Reads the values of the json file
    let json: serde_json::Value = serde_json::from_reader(file)
        .expect("json parsing error");

    // Converts the "weights" array into a vector
    let json_weights = json["weights"].as_array().unwrap();

    // Reads the inner values as array's
    let weights_result: Result<Vec<Vec<usize>>, _> = json_weights.into_iter()
    .map(|x| {
        x.as_array()
            .ok_or("Not an array")
            .and_then(|y| y.iter().map(|z| z.as_u64().ok_or("Not an usize").map(|w| w as usize)).collect())
    })
    .collect();

    // Unwraps the weights_result into a vector
    let weights = weights_result.unwrap();
    
    // Console logging the result of the shortest path
    println!("{:?}", get_all_perm(&weights, weights.len()));

    // Ends timer and calcs elapsed time
    let end_time = Instant::now();
    let elapsed_time = end_time - start_time;

    // Prints time taken
    println!("Elapsed time {:?}", elapsed_time);
    
}

// Calculates the shortest distance for the given permutation
fn calc_distance(weights: &[Vec<usize>], n: usize, perm: &[usize]) -> usize {
    // Initializes the variable with the distance from the starting node to
    // the first node and also the distance from the last node to the starting
    // node.
    let mut total_dist = weights[0][perm[0]] + weights[perm[n-1]][0];

    // Calculates the distance of the permutations
    for i in 0..n-1 {
        total_dist += weights[perm[i]][perm[i+1]];
    }
    
    total_dist
}

// Function for creating all permutations and calculating the distance as well
fn get_all_perm(weights: &Vec<Vec<usize>>, n: usize) -> (Vec<usize>, usize) {
    
    // Initializes an empty array
    let mut perms_array: Vec<usize> = Vec::new();

    // Creates a vector with length equal to number of nodes - 1
    for x in 1..n {
        perms_array.push(x);
    }

    // Initialization of variables
    let mut current_dist = usize::MAX;
    let mut ret_perm: Vec<usize> = Vec::new();
    let perm_length = perms_array.len();

    // Creates all permutations of perms_array and calls the calc_distance function
    for perm in perms_array.iter().permutations(perms_array.len()).unique() {
        // perm overrides to x instead of pointer, then sums it.
        let perm: Vec<usize> = perm.into_iter().map(|&x| x).collect(); 
        let next = calc_distance(weights, perm_length, &perm);
        // Saving the shortest distance and the corresponding permutation
        if current_dist > next {
            ret_perm = perm;
            current_dist = next;
        }
    }
    
    // Returns the shortest distance and the corresponding permutation
    return (ret_perm, current_dist);
}
