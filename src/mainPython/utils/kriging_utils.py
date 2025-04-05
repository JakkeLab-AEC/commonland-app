import math
import numpy as np
from pykrige.ok import OrdinaryKriging

def calculate_topo_from_points(obb, points, resolution):
    points = obb['pts']
    
    # Axis points
    p0 = points['p0']
    p1 = points['p1']
    p3 = points['p3']
    
    # Given datas
    arr_points = []
    for point in points:
        converted_point = [point['x'], point['y'], point['z']]
        arr_points.append(converted_point)

    # Set axis
    vec_p0 = (p0['x'], p0['y'])
    vec_p1 = (p1['x'], p1['y'])
    vec_p3 = (p3['x'], p3['y'])

    v1 = np.array(vec_p1) - np.array(vec_p0)
    v2 = np.array(vec_p3) - np.array(vec_p0)

    len_v1 = np.linalg.norm(v1)
    len_v2 = np.linalg.norm(v2)

    u1 = v1 / len_v1
    u2 = v2 / len_v2

    n1 = int(len_v1 / resolution)
    n2 = int(len_v2 / resolution)

    grid_points = []
    for i in range(n1 + 1):
        for j in range(n2 + 1):
            pt = np.array(p0) + u1 * i * resolution + u2 * j * resolution
            grid_points.append(pt)

    grid_points = np.array(grid_points)

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
