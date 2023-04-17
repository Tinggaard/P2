use itertools::Itertools;
use std::fs::File;

fn main(){
    let file = File::open("../weights.json")
        .expect("json file error");
    let json: serde_json::Value = serde_json::from_reader(file)
        .expect("json parsing error");


    let json_weights = json["weights"].as_array().unwrap();

    let weights_result: Result<Vec<Vec<usize>>, _> = json_weights.into_iter()
    .map(|x| {
        x.as_array()
            .ok_or("Not an array")
            .and_then(|y| y.iter().map(|z| z.as_u64().ok_or("Not an usize").map(|w| w as usize)).collect())
    })
    .collect();

    let weights = weights_result.unwrap();
    
    println!("{:?}", get_all_perm(&weights, weights.len()));
    
}


fn calc_distance(weights: &[Vec<usize>], n: usize, perm: &[usize]) -> usize {
    let mut total_dist = weights[0][perm[0]] + weights[perm[n-1]][0];

    for i in 0..n-1 {
        total_dist += weights[perm[i]][perm[i+1]];
    }
    
    total_dist
}

fn get_all_perm(weights: &Vec<Vec<usize>>, n: usize) -> (Vec<usize>, usize) {
    
    let mut perms_array: Vec<usize> = Vec::new();

    for x in 1..n {
        perms_array.push(x);
    }

    let mut current_dist = usize::MAX;
    let mut ret_perm: Vec<usize> = Vec::new();

    let perm_length = perms_array.len();

    for perm in perms_array.iter().permutations(perms_array.len()).unique() {
        // perm overrides to x instead of pointer, then sums it.
        let perm: Vec<usize> = perm.into_iter().map(|&x| x).collect(); 
        let next = calc_distance(weights, perm_length, &perm);
        if current_dist > next {
            ret_perm = perm;
            current_dist = next;
        }
    }
    
    return (ret_perm, current_dist);
}