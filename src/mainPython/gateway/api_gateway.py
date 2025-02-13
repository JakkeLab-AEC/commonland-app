from src.mainPython.gateway.api_names import APINames


class APIGateway:
    def __init__(self):
        self.gate = ""

    def handle_gateway(self, action: str, args: any) -> object:
        if action == APINames.CalculateTopo:


