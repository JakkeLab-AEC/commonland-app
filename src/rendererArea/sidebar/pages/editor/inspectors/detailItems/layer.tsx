import React, { useRef } from "react"
import { HamburgerIcon } from "../../../../../assets/icons/hamburterIcon";
import { ButtonDelete } from "../../../../../components/buttons/buttonDelete";

export interface LayerProps {
    layerId: string;
    layerName?: string;
    thickness?: number;
    onDelete: (id: string) => void;
    onChangeValueListener: (id: string, name: string, thickness: number) => void;
}

export const LayerComponent: React.FC<LayerProps> = ({ layerId, layerName, thickness=0.01, onDelete, onChangeValueListener }) => {
  const tbLayerNameRef = useRef<HTMLInputElement>(null);
  const tbThicknessRef = useRef<HTMLInputElement>(null);

  const onChangeValue = () => {
    onChangeValueListener(layerId, tbLayerNameRef.current.value, parseFloat(tbThicknessRef.current.value));
  }

  const onDeleteWrapper = (id: string | number) => {
    onDelete(id.toString())
  }

  return (
    <div className="flex flex-row space-x-2 h-[32px] items-center">
      <div className="flex w-[32px]">
        <HamburgerIcon />
      </div>
      <div className="flex w-[120px]">
        <input
          className="border w-full"
          defaultValue={layerName}
          ref={tbLayerNameRef}
          onChange={onChangeValue}
        />
      </div>
      <div className="flex-grow">
        <input
          className="border w-full"
          type='number'
          defaultValue={thickness}
          step={0.01}
          ref={tbThicknessRef}
          onChange={onChangeValue}
        />
      </div>
      <div>
          <ButtonDelete id={layerId} onDeleteHandler={onDeleteWrapper}/>
      </div>
    </div>
  );
  };