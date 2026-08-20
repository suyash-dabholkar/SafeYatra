def calculate_cci(density, movement):

    # ---- Density Risk ----
    # Safe density < 0.5 person/m²
    # Dangerous density ≥ 3 person/m²

    density_score = min(density / 3.0, 1.0) * 60


    # ---- Movement Risk ----
    # Low movement → crowd compression → higher risk

    movement = min(movement, 15)   # cap extreme movement values
    movement_score = (1 - movement / 15) * 40
    
    cci = density_score + movement_score
    return round(cci, 2)
