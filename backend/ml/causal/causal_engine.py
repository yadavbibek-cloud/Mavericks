"""
Granger Causal Attribution and Root Cause Isolator for Power Grids.
"""

from typing import Dict, List, Any, Optional
import networkx as nx

class GrangerCausalAttributor:
    """Isolates primary initiating faults from downstream cascading symptoms."""

    def __init__(self, graph: nx.Graph):
        self.graph = graph

    def rank_root_causes(self,
                          node_risks: Dict[str, float],
                          time_series: Optional[List[Dict[str, Any]]],
                          grid_state: Dict[str, Any],
                          initiating_candidate: Optional[str] = None) -> List[Dict[str, Any]]:
        root_cause_list = []
        high_risk_nodes = [nid for nid, r in node_risks.items() if r >= 0.20]
        if initiating_candidate and initiating_candidate in node_risks and initiating_candidate not in high_risk_nodes:
            high_risk_nodes.append(initiating_candidate)
        if not high_risk_nodes:
            sorted_nodes = sorted(node_risks.keys(), key=lambda k: node_risks[k], reverse=True)
            high_risk_nodes = sorted_nodes[:3]

        high_risk_nodes.sort(key=lambda nid: node_risks.get(nid, 0.0), reverse=True)

        onset_steps: Dict[str, int] = {}
        if time_series:
            for step_data in time_series:
                step_idx = step_data["step"]
                loadings = step_data["loadings"]
                temperatures = step_data["temperatures"]
                for nid in node_risks.keys():
                    if nid not in onset_steps:
                        load = loadings.get(nid, 0)
                        temp = temperatures.get(nid, 25)
                        if load > 90.0 or temp > 72.0:
                            onset_steps[nid] = step_idx

        for nid in high_risk_nodes:
            risk = node_risks.get(nid, 0.0)
            onset = onset_steps.get(nid, 99)

            explained_by = None
            for other_nid in high_risk_nodes:
                if other_nid == nid:
                    continue
                other_onset = onset_steps.get(other_nid, 99)
                if other_onset < onset:
                    try:
                        dist = nx.shortest_path_length(self.graph, source=other_nid, target=nid)
                        if dist <= 4:
                            explained_by = other_nid
                            break
                    except Exception:
                        pass

            if initiating_candidate and nid == initiating_candidate:
                explained_by = None

            is_explained = (explained_by is not None)
            if not is_explained:
                rc_score = min(0.96, max(0.75, 0.4 * risk + 0.6 * (1.0 / (onset + 1))))
            else:
                rc_score = round(max(0.08, risk * 0.35), 2)

            root_cause_list.append({
                "node": nid,
                "root_cause_score": round(rc_score, 2),
                "explained_by_upstream": is_explained,
                "explained_by": explained_by,
                "onset_step": onset if onset != 99 else None,
                "risk_probability": risk
            })

        root_cause_list.sort(key=lambda x: (x["explained_by_upstream"], -x["root_cause_score"]))
        return root_cause_list
