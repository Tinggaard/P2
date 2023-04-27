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
    //println!("{:?}", get_all_perm(&weights, weights.len()));

    let mut task = (1..weights.len()).collect::<Vec<usize>>();

    let mut all_combs = Vec::new();
    heaps(task.len(), &mut task, &mut all_combs);

    let mut current; // current route
    let mut shortest_index = 0; // index of shortest route
    let mut shortest = usize::MAX; // shortest route

    for (i, perm) in all_combs.iter().enumerate() {
        let mut current_index = 0; 
        current = 0;

        // get the distance
        for node in perm.iter() {
            current += weights[current_index][*node];
            current_index = *node;
        }

        // add back to start node
        current += weights[current_index][0];

        // save index and length if shortest
        if current < shortest {
            shortest = current;
            shortest_index = i;
        }
    }

    println!("{:?}", all_combs[shortest_index]);
    println!("{:?}", shortest);

    // Ends timer and calcs elapsed time
    let end_time = Instant::now();
    let elapsed_time = end_time - start_time;

    // Prints time taken
    println!("Elapsed time {:?}", elapsed_time);
    
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
