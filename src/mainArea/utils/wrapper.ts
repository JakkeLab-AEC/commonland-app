import { getConvexHull } from "./geometrics/convexHullUtils";
import { getOBB } from "./geometrics/obbUtils";
import { runPykrige } from "./pythonUtils/topoPythonUtils";
import { showFileOpenDialog } from "./systemUtils/fileDialog";
import { showError } from "./systemUtils/showError";

/**
 * [Main Process]
 * This util is including OS level utils (Native message box, file import, and so on).
 * Please call via ipcHandler.
 */
export const SystemUtils = {
    Modal: {
        showError,
        showFileOpenDialog
    },
}

/**
 * [Common]
 * This util is including computation utils for geometrical calculations.
 */
export const GeometricUtils = {
    ConvexHull: {
        getConvexHull
    },
    BoundingBox: {
        getOBB
    }
}

/**
 * [Main, Common]
 * This util is including generating raw source for creating topo mesh.
 * Some actions are worked on only Main process. So please check the comment of each actions.
 */
export const TopoUtils = {
    createTopoDataSet: {
        /**
         * [Main]
         * Call Python API wrapping PyKrige.
         */
        runPykrige
    }
}