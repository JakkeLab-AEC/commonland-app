import time
import uuid
import json

from pathlib import Path

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
            calculated_points = calculate_topo_from_points(obb=args['obb'], input_pts=args['points'], resolution=args['resolution'])
            end_time = time.time()
            response_id = str(uuid.uuid4())

            folder_path = Path(args['runtimePath']) / "responses" / response_id
            folder_path.mkdir(parents=True, exist_ok=True)
            file_name = f"{uuid.uuid4()}.json"
            json_file_path = folder_path / file_name
            
            with open(json_file_path, "w", encoding="utf-8") as f:
                json.dump(calculated_points, f, indent=4, ensure_ascii=False)

            return {
                "duration": round(end_time - start_time, 3),
                "count": len(calculated_points['points']),
                "pointFilePath": str(json_file_path)
            }
