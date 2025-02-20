import math
import numpy as np
from pykrige.ok import OrdinaryKriging

def calculate_topo_from_points(obb, points, resolution):
    domain_x = obb['domainX']
    domain_y = obb['domainY']
    centroid = obb['centroid']
    vec_x_axis = obb['xAxis']

    # 📌 1️⃣ OBB 회전 각도 계산
    vec_dot = vec_x_axis['x'] * 1 + vec_x_axis['y'] * 0
    vec_multiply = math.sqrt(float(vec_x_axis['x'])**2 + float(vec_x_axis['y'])**2)
    theta = math.acos(vec_dot / vec_multiply)

    if vec_x_axis['y'] < 0:
        theta = -theta

    # 📌 2️⃣ 좌표 변환 (OBB 기준 좌표계로 이동)
    arr_points = []
    for point in points:
        point_vector_original = [point['x'], point['y'], point['z']]
        point_vector_moved = [
            point_vector_original[0] - centroid['x'],
            point_vector_original[1] - centroid['y'],
            point_vector_original[2],
        ]
        point_vector_rotated = [
            point_vector_moved[0] * math.cos(-theta) - point_vector_moved[1] * math.sin(-theta),
            point_vector_moved[0] * math.sin(-theta) + point_vector_moved[1] * math.cos(-theta),
            point_vector_moved[2]
        ]
        point_moved_after_rotation = [
            point_vector_rotated[0] + domain_x * 0.5,
            point_vector_rotated[1] + domain_y * 0.5,
            point_vector_rotated[2],
        ]
        arr_points.append(point_moved_after_rotation)

    # 📌 3️⃣ Kriging 수행
    data = np.array(arr_points)

    OK = OrdinaryKriging(
        x=data[:, 0],
        y=data[:, 1],
        z=data[:, 2],
        variogram_model="linear",  # 빠른 모델 적용
        verbose=False,
        enable_plotting=False,
    )

    # 📌 4️⃣ 예측할 Grid 생성
    target_x = np.arange(0, domain_x + resolution, resolution)
    target_y = np.arange(0, domain_y + resolution, resolution)

    # 2D Meshgrid 생성 후 1D로 변환 (이전 코드 수정)
    grid_x, grid_y = np.meshgrid(target_x, target_y)
    grid_x_flat = grid_x.flatten()
    grid_y_flat = grid_y.flatten()

    # 📌 5️⃣ "points" 스타일로 Kriging 수행 (1D로 변환하여 예측)
    z_pred, _ = OK.execute("points", grid_x_flat, grid_y_flat)

    # 📌 6️⃣ Kriging 결과를 다시 2D로 변환
    z_pred_reshaped = z_pred.reshape(grid_x.shape)

    # 📌 7️⃣ 예측된 결과를 원래 좌표계로 변환 후 저장
    points_pred = []
    for i in range(len(target_x)):
        for j in range(len(target_y)):
            z_value = float(z_pred_reshaped[j, i])  # `z_pred`를 올바른 위치로 매칭

            # 평행이동 복원
            x_moved_back = target_x[i] - domain_x * 0.5
            y_moved_back = target_y[j] - domain_y * 0.5

            # 원래 좌표계로 회전 복원
            x_original = x_moved_back * math.cos(theta) - y_moved_back * math.sin(theta) + centroid['x']
            y_original = x_moved_back * math.sin(theta) + y_moved_back * math.cos(theta) + centroid['y']

            # 결과 저장
            points_pred.append({
                "x": x_original,
                "y": y_original,
                "z": z_value
            })

    return points_pred
