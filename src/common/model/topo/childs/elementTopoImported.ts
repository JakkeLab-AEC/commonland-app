import { ElementModelDTO } from "@/common/dto/elementModelDto";
import { ElementCategory } from "../../elementModelCategory";
import { ElementTopo, ElementTopoOption, TopoType } from "../elementTopo";
import { ElementTopoDTO } from "@/common/dto/topo/elementTopoDto";

export interface ElementTopoImportedOption
	extends ElementTopoOption<TopoType.Imported> {
	sourceFile: string;
	format: string;
}

export class ElementTopoImported extends ElementTopo<TopoType.Imported> {
	constructor(option: ElementTopoImportedOption) {
		super(option);
		const { sourceFile, format } = option;

		this.sourceFile = sourceFile;
		this.format = format;
	}

	protected sourceFile: string;
	protected format: string;

	serialize(): ElementTopoDTO<TopoType.Imported> {
		return {
			vertices: this.vertices,
			faces: this.faces,
			category: ElementCategory.Topo,
			topoType: TopoType.Imported,
			colorIndex: this.colorIndex,
			name: this.name,
			elementId: this.elementId.getValue(),
		};
	}
}
