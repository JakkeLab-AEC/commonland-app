import sys
import json
from gateway.api_gateway import APIGateway


def process_message(message: str) -> dict:
    """
    JSON 메시지를 받아서 처리하고 결과를 반환하는 함수
    """
    try:
        request = json.loads(message)
        gateway = APIGateway()

        job_result = gateway.handle_gateway(action=request['action'], args=request['args'])
        response = {
            "result": True,
            "message": "Received successfully",
            "data": request,
            "jobResult": job_result
        }

    except json.JSONDecodeError as e:
        response = {
            "result": False,
            "message": f"JSON Decode Error: {str(e)}"
        }

    return response


def message_loop():
    """
    표준 입력을 통해 메시지를 처리하는 루프
    """
    while True:
        line = sys.stdin.readline().strip()
        if not line:
            continue

        response = process_message(line)

        # Python에서 stdout으로 JSON 응답을 전송
        sys.stdout.write(json.dumps(response) + "\n")
        sys.stdout.flush()  # 즉시 출력 버퍼를 비움

        sys.exit(0)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # JSON 파일을 전달받은 경우 파일에서 데이터를 읽어서 처리
        json_filename = sys.argv[1]  # 예: testfile.json

        try:
            with open(json_filename, "r", encoding="utf-8") as file:
                test_message = json.load(file)  # JSON 데이터 로드

            # JSON 데이터를 문자열로 변환하여 process_message 실행
            response = process_message(json.dumps(test_message))

            print({
                "duration": response['jobResult']['duration'],
                "count": response['jobResult']['count']
            })
            # print(json.dumps(response, indent=2))

        except FileNotFoundError:
            print(f"Error: {json_filename} 파일을 찾을 수 없습니다.")
        except json.JSONDecodeError as e:
            print(f"Error: JSON 파일 파싱 오류 - {str(e)}")

    else:
        # 기본적으로 message_loop 실행
        message_loop()
