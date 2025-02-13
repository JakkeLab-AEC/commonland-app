from pykrige.ok import OrdinaryKriging
import numpy as np

def calculate_topo_from_points(obb, points):


data = np.array(
    [
        [0.3, 1.2, 0.47],
        [1.9, 0.6, 0.56],
        [1.1, 3.2, 0.74],
        [3.3, 4.4, 1.47],
        [4.7, 3.8, 1.74],
    ]
)

OK = OrdinaryKriging(
    x=data[:, 0],
    y=data[:, 1],
    z=data[:, 2],
    variogram_model="exponential",
    verbose = False,
    enable_plotting=False,
)

target_x = np.arange(0, 5 + 0.1, 0.1)
target_y = np.arange(0, 5 + 0.1, 0.1)

z_pred, ss_pred = OK.execute(style="points", xpoints=target_x, ypoints=target_y)

print(f"Predicted z-value : {z_pred}")
print(f"Predicted variance : {ss_pred}")