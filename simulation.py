
import random
import statistics

# Constants
TARGET_BADGES = 180
BATCH_COST_FIRST = 89
BATCH_COST_SUBSEQUENT = 179
SINGLE_COST_FIRST = 9
SINGLE_COST_SUBSEQUENT = 19
SINGLE_THRESHOLD = 6  # Switch to single pulls when remaining < 6

# Variable Part Definitions
VAR_VALUES = [1, 2, 3, 5, 10]
VAR_WEIGHTS = [70, 15, 10, 4, 1]  # Percentages

def get_variable_part():
    """Generates 4 variable items based on weights."""
    return random.choices(VAR_VALUES, weights=VAR_WEIGHTS, k=4)

def is_valid_batch(variable_items):
    """
    Checks constraints:
    1. Count of 10 <= 2
    2. Count of 5 <= 2
    3. If Count(10) == 2 -> Count(5) <= 1
    4. Not [3, 3, 3, 3]
    """
    count_10 = variable_items.count(10)
    count_5 = variable_items.count(5)
    
    if count_10 > 2:
        return False
    if count_5 > 2:
        return False
    if count_10 == 2 and count_5 > 1:
        return False
    if variable_items == [3, 3, 3, 3]:
        return False
    
    return True

def simulate_batch():
    """Simulates one valid batch pull (10 items)."""
    # Fixed part: 5 badges (1 Badge x 5)
    total_badges = 5
    
    # Special Slot (6th Item)
    # VAR_WEIGHTS[0] is the probability for '1' (70% by default)
    p1 = VAR_WEIGHTS[0]
    special_prob_1 = 85
    if p1 >= 85:
        special_prob_1 = p1
        
    rand_val = random.uniform(0, 100)
    if rand_val < special_prob_1:
        total_badges += 1
    else:
        total_badges += 2

    # Variable part (4 items)
    while True:
        variable_items = get_variable_part()
        if is_valid_batch(variable_items):
            total_badges += sum(variable_items)
            break
            
    return total_badges

def simulate_single():
    """
    Simulates one single pull.
    60% -> 1 badge (fixed part equivalent)
    40% -> Variable part distribution
    """
    if random.random() < 0.6:
        return 1
    else:
        # Variable part logic for single: 1 item from the variable distribution
        # Note: Plan says "Theo phân phối biến động {1, 2, 3, 5, 10} (Không áp dụng ràng buộc batch)"
        return random.choices(VAR_VALUES, weights=VAR_WEIGHTS, k=1)[0]

def run_simulation():
    """Runs one full simulation to reach TARGET_BADGES."""
    current_badges = 0
    batch_pulls = 0
    single_pulls = 0
    
    # 1. Batch Pull Phase
    while current_badges < TARGET_BADGES:
        remaining = TARGET_BADGES - current_badges
        
        if remaining < SINGLE_THRESHOLD:
            # Switch to single pulls
            break
            
        badges_gained = simulate_batch()
        current_badges += badges_gained
        batch_pulls += 1
        
    # 2. Single Pull Phase
    while current_badges < TARGET_BADGES:
        badges_gained = simulate_single()
        current_badges += badges_gained
        single_pulls += 1
        
    # Calculate Cost
    total_cost = 0
    
    # Batch Cost
    if batch_pulls > 0:
        total_cost += BATCH_COST_FIRST + (batch_pulls - 1) * BATCH_COST_SUBSEQUENT
        
    # Single Cost
    # The logic "Lần đầu 9 KC, các lần sau 19 KC" applies to single pulls independently?
    # Usually in gacha games, the discount is per type.
    # Assuming independent counters for batch and single.
    if single_pulls > 0:
        total_cost += SINGLE_COST_FIRST + (single_pulls - 1) * SINGLE_COST_SUBSEQUENT
            
    return total_cost

def main():
    N = 100000
    print(f"Running {N} simulations...")
    
    costs = []
    for _ in range(N):
        costs.append(run_simulation())
        
    mean_cost = statistics.mean(costs)
    median_cost = statistics.median(costs)
    min_cost = min(costs)
    max_cost = max(costs)
    
    print("-" * 30)
    print(f"Goal: {TARGET_BADGES} Badges")
    print(f"Simulations: {N}")
    print("-" * 30)
    print(f"Min Cost:    {min_cost} KC")
    print(f"Max Cost:    {max_cost} KC")
    print(f"Mean Cost:   {mean_cost:.2f} KC")
    print(f"Median Cost: {median_cost} KC")
    print("-" * 30)
    
    # Percentiles
    percentiles = [10, 25, 50, 75, 90, 95, 99]
    quantiles = statistics.quantiles(costs, n=100)
    
    print("Percentiles:")
    for p in percentiles:
        # quantiles are 0-indexed, so 99th percentile is at index 98
        val = quantiles[p-1]
        print(f"P{p}: {val:.2f} KC")

if __name__ == "__main__":
    main()
