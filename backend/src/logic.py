import networkx as nx

# 1. Build the Venue Graph (Undirected NetworkX Graph)
venue_graph = nx.Graph()

# Base walkable paths with default base weights (distance/time)
venue_graph.add_edge("zone_1", "zone_2", base_weight=1)
venue_graph.add_edge("zone_2", "cp_1", base_weight=1)
venue_graph.add_edge("cp_1", "exit_1", base_weight=1) 
venue_graph.add_edge("zone_1", "cp_1", base_weight=5) # Bypass path

# Define exits and safe refuge/muster zones for backward/fallback routing
EXITS = ["exit_1"]
SAFE_REFUGE_ZONES = ["zone_1"] # Designated safe back-tracking points

def find_safest_exit_with_cci(start_zone, zone_cci_scores):
    """
    Calculates the safest route using Dijkstra's algorithm by scaling 
    edge weights dynamically using CCI risk scores (0.0 to 1.0).
    If forward paths are blocked/high-risk, it reroutes via safer 
    alternative paths or fallback refuge zones.
    """
    safe_graph = venue_graph.copy()
    
    # 2. Dynamic Weight Assignment based on CCI Index
    # CCI risk score multiplies the base weight. If CCI is >= 0.8 (danger), 
    # the path weight explodes to infinity, forcing Dijkstra to look elsewhere.
    for u, v, data in safe_graph.edges(data=True):
        base = data.get('base_weight', 1)
        
        # Get CCI score for connected nodes (take the max risk of the two endpoints)
        cci_u = zone_cci_scores.get(u, 0.0)
        cci_v = zone_cci_scores.get(v, 0.0)
        max_cci = max(cci_u, cci_v)
        
        if max_cci >= 0.8:
            safe_graph[u][v]['weight'] = float('inf')
        else:
            # Scale weight exponentially with CCI risk
            safe_graph[u][v]['weight'] = base * (1 + (max_cci * 10))

    if not safe_graph.has_node(start_zone):
        return None, "Start zone not found in graph!"

    best_path = None
    min_cost = float('inf')

    # 3. Try finding a path to an official Exit first
    for exit_node in EXITS:
        if safe_graph.has_node(exit_node):
            try:
                path = nx.shortest_path(safe_graph, source=start_zone, target=exit_node, weight='weight')
                cost = nx.shortest_path_length(safe_graph, source=start_zone, target=exit_node, weight='weight')
                
                if cost < min_cost and cost != float('inf'):
                    min_cost = cost
                    best_path = path
            except (nx.NetworkXNoPath, nx.NodeNotFound):
                continue

    if best_path:
        next_step = best_path[1] if len(best_path) > 1 else best_path[0]
        return best_path, next_step

    # 4. FALLBACK FIX (When all forward routes are choked/unsafe):
    # Route backward or to a safe refuge zone instead of failing.
    for refuge in SAFE_REFUGE_ZONES:
        if refuge != start_zone and safe_graph.has_node(refuge):
            try:
                path = nx.shortest_path(safe_graph, source=start_zone, target=refuge, weight='weight')
                cost = nx.shortest_path_length(safe_graph, source=start_zone, target=refuge, weight='weight')
                if cost != float('inf'):
                    next_step = path[1] if len(path) > 1 else path[0]
                    return path, f"⚠️ FORWARD BLOCKED! Fallback: Retreat safely to {next_step}"
            except (nx.NetworkXNoPath, nx.NodeNotFound):
                continue

    return None, "CRITICAL: Completely trapped. Hold position and await rescue team."

# ==========================================
# TEST RUNNER
# ==========================================
if __name__ == '__main__':
    print("🚀 TESTING CCI-DRIVEN DIJKSTRA & BACKTRACK ROUTING...\n")
    
    # Test 1: All zones safe (CCI near 0)
    print("--- TEST 1: Normal Conditions ---")
    path, instruction = find_safest_exit_with_cci("zone_1", {"zone_1": 0.0, "zone_2": 0.1, "cp_1": 0.0})
    print(f"Path: {path} | Instruction: {instruction}")

    # Test 2: High CCI in zone_2 forces a detour via cp_1 bypass
    print("\n--- TEST 2: High CCI Crowd Crush Risk in zone_2 ---")
    path, instruction = find_safest_exit_with_cci("zone_1", {"zone_1": 0.0, "zone_2": 0.9, "cp_1": 0.1})
    print(f"Path: {path} | Instruction: {instruction}")

    # Test 3: Total gridlock ahead -> Triggers safe backward fallback
    print("\n--- TEST 3: All Forward Paths Impassable (High CCI everywhere ahead) ---")
    path, instruction = find_safest_exit_with_cci("zone_2", {"zone_1": 0.1, "zone_2": 0.95, "cp_1": 0.90})
    print(f"Path: {path} | Instruction: {instruction}")