"""
Causal Service:
Executes temporal root cause ranking and upstream symptom resolution.
"""

from typing import Dict, Any, List
from ml.causal.root_cause import RootCauseAnalyzer

class CausalService:
    def __init__(self, analyzer: RootCauseAnalyzer = None):
        self.analyzer = analyzer or RootCauseAnalyzer()

    def analyze_root_causes(
        self,
        grid_state: Dict[str, Any],
        node_risks: Dict[str, float],
        cascade_timeline: List[Dict[str, Any]],
        initiating_hint: str = None
    ) -> List[Dict[str, Any]]:
        return self.analyzer.rank_root_causes(
            grid_state=grid_state,
            node_risks=node_risks,
            cascade_timeline=cascade_timeline,
            initiating_hint=initiating_hint
        )
