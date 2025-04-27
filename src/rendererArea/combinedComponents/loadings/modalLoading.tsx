import { IconLoading } from '@/rendererArea/components/forms/icons/loading';
import './modalLoadingStyle.css';
import React from "react"

interface ModalLoadingProps {
    message?: string;
    width?: number;
    height?: number;
}

export const ModalLoading: React.FC<ModalLoadingProps> = ({
    message = "Loading",
    width,
    height,
}) => {
    return (
        <div
            className="flex flex-col items-center justify-center border rounded-md gap-2 p-4 bg-white"
            style={{ width, height, minWidth: 120 }}
        >
            <div className="text-sm text-gray-600">{message}</div>
            <div className="spinner-animation">
                <IconLoading />
            </div>
        </div>
    );
};