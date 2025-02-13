import sys, json

from src.mainPython.gateway.api_gateway import APIGateway


def process_message(message: str) -> dict:
    try:
        request = json.loads(message)
        gateway = APIGateway()

        gateway.handle_gateway(action=message['action'], args=message['args'])
        response = {
            "result": True,
            "message": "Received successfully",
            "data": request
        }

    except json.JSONDecodeError as e:
        response = {
            "result": False,
            "message": f"JSON Decode Error: {str(e)}"
        }

    return response

def message_loop():
    while True:
        line = sys.stdin.readline().strip()
        if not line:
            continue
        
        response = process_message(line)
        
        # Python에서 stdout으로 JSON 응답을 전송
        sys.stdout.write(json.dumps(response) + "\n")
        sys.stdout.flush()  # 버퍼를 비워서 즉시 Node.js에서 받을 수 있도록 함

        sys.exit(0)

message_loop()
