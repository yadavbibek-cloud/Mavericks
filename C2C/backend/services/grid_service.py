"""
Grid Service:
Manages network topology, coordinates, and live power flow state.
"""

from typing import Dict, Any, List
from simulation.grid_loader import GridLoader
from simulation.scenarios import get_scenario_list, get_scenario

class GridService:
    def __init__(self, loader: GridLoader = None):
        self.loader = loader or GridLoader()

    def get_grid(self, grid_id: str = "ieee24") -> Dict[str, Any]:
        net = self.loader.get_net(grid_id)
        return self.loader.to_graph_data(net, grid_id)

    def get_scenarios(self) -> List[Dict[str, Any]]:
        return get_scenario_list()

    def get_scenario_by_id(self, scenario_id: str) -> Dict[str, Any]:
        return get_scenario(scenario_id)

    def get_verified_substations(self) -> List[Dict[str, Any]]:
        import csv
        from pathlib import Path

        coords = {
            "Bamnauli": (28.5615, 76.9936),
            "Bawana": (28.7997, 77.0326),
            "Mundka": (28.6816, 77.0298),
            "Harsh Vihar": (28.7180, 77.3060),
            "Patparganj": (28.6276, 77.3031),
            "Peeragarhi": (28.6789, 77.0911),
            "Pragati (IP Extension)": (28.6186, 77.2489),
            "Preet Vihar": (28.6415, 77.2974),
            "Tughlakabad": (28.5135, 77.2658),
            "33 kV Substation Perunad": (9.3510, 76.8830),
        }

        csv_path = Path(__file__).resolve().parent.parent.parent / "dataset" / "india_real_substations_VERIFIED.csv"
        results = []
        if csv_path.exists():
            with open(csv_path, mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    name = row.get("substation_name", "").strip()
                    lat, lon = coords.get(name, (28.6139, 77.2090))
                    results.append({
                        "name": name,
                        "city": row.get("city", "").strip(),
                        "state": row.get("state", "").strip(),
                        "voltage_level_kv": row.get("voltage_level_kv", "").strip(),
                        "transformer_config": row.get("transformer_config", "").strip(),
                        "capacity_mva": row.get("total_transformer_capacity_mva", "").strip(),
                        "notes": row.get("notes", "").strip(),
                        "source": row.get("source", "").strip(),
                        "lat": lat,
                        "lon": lon,
                        "is_real_verified": True
                    })
        return results
