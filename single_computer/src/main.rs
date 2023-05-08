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

    let mut permutation = (1..weights.len()).collect::<Vec<usize>>();
    let mut shortest_length = usize::MAX; 
    let mut shortest_path = Vec::new(); 

    // heaps() finds the shortest path and the length of the path
    heaps(permutation.len(), &mut permutation, &mut shortest_length, &mut shortest_path, &weights);

    println!("{:?}", shortest_length);
    println!("{:?}", shortest_path);

    // Ends timer and calcs elapsed time
    let end_time = Instant::now();
    let elapsed_time = end_time - start_time;

    // Prints time taken
    println!("Elapsed time {:?}", elapsed_time);
}

/* Heaps algorithm used for generating permutations.
/  Instead of pushing each permutation to an array, the path length of
/  each permutation is calculated and compared to the shortest inside
/  of the function to save memory.
*/
fn heaps(k: usize, permutation: &mut Vec<usize>, shortest_length: &mut usize, shortest_path: &mut Vec<usize>, weights: &Vec<Vec<usize>>) {
    if k == 1 {
        let path_length = calc_route_length(permutation, weights); // Calculate the length of the current permutation

        // The length and the permutation is saved if it is smaller than the currently shortest
        if path_length < *shortest_length {
            *shortest_length = path_length;
            *shortest_path = permutation.clone();
        }

        return;
    }
    
    heaps(k - 1, permutation, shortest_length, shortest_path, weights);

    for i in 0..k - 1 {
        if k % 2 == 0 {
            permutation.swap(i, k-1);
        } else {
            permutation.swap(0, k-1);
        }
        heaps(k - 1, permutation, shortest_length, shortest_path, weights);
    }
}

// Function calculates the length of a given route/permutation
fn calc_route_length(permutation: &mut [usize], weights: &Vec<Vec<usize>>) -> usize {
    let mut path_length = 0;
    let mut last_vertex = 0;

    // Iterate over the vertices in the permutation and add up the weights/distances
    for vertex in permutation.iter() {
        path_length += weights[last_vertex][*vertex];  // Add the distance from the last vertex to this one.
        last_vertex = *vertex; // Update the last vertex to the current one.

    }

    // Add the distance from the last vertex back to the starting vertex.
    path_length += weights[last_vertex][0];  
    
    return path_length;
}