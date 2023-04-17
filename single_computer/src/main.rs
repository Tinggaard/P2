use itertools::Itertools;

fn main(){
    let weights: Vec<Vec<usize>>  = vec![
        vec![0, 2, 3, 4, 5],
        vec![4, 0, 2, 1, 3],
        vec![7, 3, 0, 3, 6],
        vec![8, 1, 100, 0, 7],
        vec![1, 9, 8, 5, 0],
      ];

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