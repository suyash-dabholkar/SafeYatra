import networkx as nx

# ==========================================
# 1. VENUE GRAPH — Extended with Zone 3 Alternative Path
# ==========================================
venue_graph = nx.Graph()

# Real physical distances (meters)
venue_graph.add_edge("zone_1", "zone_2", distance_m=400) # Main path through Zone 2
venue_graph.add_edge("zone_2", "cp_1",   distance_m=150) 
venue_graph.add_edge("cp_1",   "exit_1", distance_m=100) 

# Alternative bypass route via Zone 3 (used when Zone 2 is blocked/terminated)
venue_graph.add_edge("zone_1", "zone_3", distance_m=300) 
venue_graph.add_edge("zone_3", "cp_1",   distance_m=350)

EXITS = ["exit_1"]
SAFE_REFUGE_ZONES = ["zone_1"] # Designated safe retreat points

# ==========================================
# 2. MOCK GPS MAP DATA (For Person 4's Frontend Dashboard)
# ==========================================
ZONE_COORDS = {
    "zone_1": {"lat": 28.6139, "lng": 77.2090},
    "zone_2": {"lat": 28.6145, "lng": 77.2105}, # The blocked zone
    "zone_3": {"lat": 28.6150, "lng": 77.2080}, # The safe alternative route
    "cp_1":   {"lat": 28.6155, "lng": 77.2120},
    "exit_1": {"lat": 28.6165, "lng": 77.2135}
}

def generate_mock_map_data(path):
    """
    Transforms the Dijkstra path array into GPS coordinates and a readable string 
    so the frontend dashboard can draw a live route line for the judges.
    """
    if not path or isinstance(path, str):
        return [], "No safe route available"
        
    coords = []
    for node in path:
        if node in ZONE_COORDS:
            coords.append({
                "zone": node,
                "coordinates": ZONE_COORDS[node]
            })
            
    route_string = " ➔ ".join(path)
    return coords, f"Escape Route: {route_string}"

# ==========================================
# 3. SAFETY FACTOR CALCULATIONS
# ==========================================
CCI_WARNING_THRESHOLD = 0.4
CCI_HIGH_RISK_THRESHOLD = 0.8

def classify_zone_status(risk_score: float) -> str:
    if risk_score >= CCI_HIGH_RISK_THRESHOLD:
        return "danger"
    elif risk_score >= CCI_WARNING_THRESHOLD:
        return "warning"
    return "safe"

def safety_factor(risk_score: float) -> float:
    status = classify_zone_status(risk_score)
    if status == "danger":
        return float('inf')          # Hard block (infinity)
    elif status == "warning":
        return 1 + ((risk_score - CCI_WARNING_THRESHOLD) / (CCI_HIGH_RISK_THRESHOLD - CCI_WARNING_THRESHOLD)) * 9
    return 1.0

# ==========================================
# 4. CORE PATHFINDING
# ==========================================
def find_safest_exit_with_cci(start_zone: str, zone_cci_scores: dict):
    if not venue_graph.has_node(start_zone):
        return None, "Start zone not found in graph!"

    safe_graph = venue_graph.copy()

    for u, v, data in safe_graph.edges(data=True):
        distance = data.get('distance_m', 1)
        cci_u = zone_cci_scores.get(u, 0.0)
        cci_v = zone_cci_scores.get(v, 0.0)
        max_cci = max(cci_u, cci_v)

        factor = safety_factor(max_cci)
        safe_graph[u][v]['weight'] = distance * factor if factor != float('inf') else float('inf')

    best_path = None
    min_cost = float('inf')

    # Try all exits
    for exit_node in EXITS:
        if not safe_graph.has_node(exit_node):
            continue
        try:
            cost = nx.shortest_path_length(safe_graph, source=start_zone, target=exit_node, weight='weight')
            if cost < min_cost:
                path = nx.shortest_path(safe_graph, source=start_zone, target=exit_node, weight='weight')
                min_cost = cost
                best_path = path
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            continue

    if best_path:
        next_step = best_path[1] if len(best_path) > 1 else best_path[0]
        return best_path, next_step

    # FALLBACK: If completely cut off, retreat to Zone 1
    for refuge in SAFE_REFUGE_ZONES:
        if refuge == start_zone or not safe_graph.has_node(refuge):
            continue
        try:
            cost = nx.shortest_path_length(safe_graph, source=start_zone, target=refuge, weight='weight')
            if cost != float('inf'):
                path = nx.shortest_path(safe_graph, source=start_zone, target=refuge, weight='weight')
                next_step = path[1] if len(path) > 1 else path[0]
                return path, f"⚠️ ZONE 2 TERMINATED! Fallback: retreat to {next_step}"
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            continue

    return None, "CRITICAL: Completely trapped. Hold position and await rescue team."