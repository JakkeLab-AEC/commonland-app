import math
import numpy as np
from pykrige.ok import OrdinaryKriging

def calculate_topo_from_points(obb, input_pts, resolution):
    # Generate krigging model
    arr_points = []
    for point in input_pts:
        converted_point = [point['x'], point['y'], point['z']]
        arr_points.append(converted_point)


    # Run krigging
    data = np.array(arr_points)
    OK = OrdinaryKriging(
        x=data[:, 0],
        y=data[:, 1],
        z=data[:, 2],
        variogram_model="gaussian",
        verbose=False,
        enable_plotting=False,
    )

    points = obb['pts']
    
    # Axis points
    p0 = points['p0']
    p1 = points['p1']
    p3 = points['p3']

    # Set axis
    vec_p0 = (p0['x'], p0['y'])
    vec_p1 = (p1['x'], p1['y'])
    vec_p3 = (p3['x'], p3['y'])

    # Set axis vector
    v1 = np.array(vec_p1) - np.array(vec_p0)
    v2 = np.array(vec_p3) - np.array(vec_p0)

    len_v1 = np.linalg.norm(v1)
    len_v2 = np.linalg.norm(v2)

    u1 = v1 / len_v1
    u2 = v2 / len_v2

    n1 = int(len_v1 / resolution)
    n2 = int(len_v2 / resolution)

    grid_xy = []
    grid_ij = []
    for i in range(n1 + 1):
        for j in range(n2 + 1):
            pt = np.array(vec_p0) + u1 * i * resolution + u2 * j * resolution
            grid_xy.append(pt)
            grid_ij.append((i, j))

    grid_xy = np.array(grid_xy)
    grid_x = grid_xy[:, 0]
    grid_y = grid_xy[:, 1]

    # Run krigging
    z_pred, _ = OK.execute(style="points", xpoints=grid_x, ypoints=grid_y)

    points_pred = []
    for idx, (i, j) in enumerate(grid_ij):
        pt = {
            "x": float(grid_xy[idx][0]),
            "y": float(grid_xy[idx][1]),
            "z": float(z_pred[idx]),
            "i": i,
            "j": j
        }
        points_pred.append(pt)

    return points_pred
