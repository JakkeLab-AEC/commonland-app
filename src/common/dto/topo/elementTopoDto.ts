import { ElementCategory } from "@/common/model/elementModelCategory";
import {
	IndexedVertex,
	TopoType,
	TypedFace,
} from "@/common/model/topo/elementTopo";
import { ElementModelDTO } from "../elementModelDto";
import {
	KriggingType,
	VariogramModel,
	VariogramParameters,
	ValidationFlag,
} from "@/common/model/topo/childs/elementTopoKrigged";

export interface ElementTopoMetadataDTO<TTopoType extends TopoType>
	extends ElementModelDTO<ElementCategory.Topo> {
	category: ElementCategory.Topo;
	topoType: TTopoType;
	colorIndex: number;
	name: string;
}

export interface ElementTopoDTO<TTopoType extends TopoType>
	extends ElementTopoMetadataDTO<TTopoType> {
	vertices: IndexedVertex[];
	faces: TypedFace[];
}

export interface ElementTopoImportedDTO
	extends ElementTopoDTO<TopoType.Imported> {
	sourceFile?: string;
	format?: "OBJ" | "DXF" | "STL";
}

export interface ElementTopoKriggedDTO
	extends ElementTopoDTO<TopoType.Krigged> {
	kriggingType: KriggingType;
	variogramModel: VariogramModel;
	variogramParameters: Partial<VariogramParameters>;
	validationFlag: ValidationFlag;
}

export type AnyTopoDTO = ElementTopoImportedDTO | ElementTopoKriggedDTO;
