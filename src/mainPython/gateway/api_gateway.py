import time

from gateway.api_names import APINames
from utils.kriging_utils import calculate_topo_from_points

class APIGateway:
    def __init__(self):
        self.gate = ""

    def handle_gateway(self, action: str, args: any) -> object:
        if action == APINames.TEST.value:
            return {
                "print": "Test"
            }
        elif action == APINames.CalculateTopo.value:
            start_time = time.time()
            calculated_points = calculate_topo_from_points(obb=args['obb'], points=args['points'], resolution=args['resolution'])
            end_time = time.time()

            return {
                "duration": round(end_time - start_time, 3),
                "count": len(calculated_points)
            }
