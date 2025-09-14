import { ElementCategory } from "../../elementModelCategory";
import { ElementTopo, ElementTopoOption, TopoType } from "../elementTopo";
import { ElementTopoDTO } from "@/common/dto/topo/elementTopoDto";

export enum KriggingType {
	OrdinaryKrigging = "OrdinaryKrigging",
	UniversialKrigging = "UniversialKrigging",
}

export enum VariogramModel {
	Gaussian = "Gaussian",
	Exponential = "Exponential",
	Spherical = "Spherical",
	Linear = "Linear",
	Power = "Power",
	HoleEffect = "HoleEffect",
}

export type VariogramParameters = {
	dist: number;
	partialSill: number;
	range: number;
	nugget: number;
	scaling: number;
	slope: number;
	exponent: number;
};

const RequiredParamsByModel: Record<
	VariogramModel,
	Partial<Record<keyof VariogramParameters, true>>
> = {
	[VariogramModel.Gaussian]: {
		partialSill: true,
		dist: true,
		range: true,
		nugget: true,
	},
	[VariogramModel.Exponential]: {
		partialSill: true,
		dist: true,
		range: true,
		nugget: true,
	},
	[VariogramModel.Spherical]: {
		partialSill: true,
		dist: true,
		range: true,
		nugget: true,
	},
	[VariogramModel.Linear]: {
		slope: true,
		dist: true,
		nugget: true,
	},
	[VariogramModel.Power]: {
		scaling: true,
		dist: true,
		exponent: true,
		nugget: true,
	},
	[VariogramModel.HoleEffect]: {
		partialSill: true,
		range: true,
		dist: true,
		exponent: true,
		nugget: true,
	},
};

export interface ElementTopoKriggedOption
	extends ElementTopoOption<TopoType.Krigged> {
	kriggingType: KriggingType;
	variogramModel: VariogramModel;
	variogramParameters?: Partial<VariogramParameters>;
}

export type ValidationFlag = {
	isValid: boolean;
	notFilledValues: string[];
};

export class ElementTopoKrigged extends ElementTopo<TopoType.Krigged> {
	constructor(option: ElementTopoKriggedOption) {
		super(option);
		const { variogramModel, variogramParameters } = option;
		this.variogramModel = variogramModel;
		this.variogramParameters = variogramParameters;
		this.validationFlag = this.validateVariogramParameters(
			variogramModel,
			variogramParameters
		);
	}

	readonly variogramModel: VariogramModel;
	readonly variogramParameters: Partial<VariogramParameters> | undefined;
	readonly validationFlag: ValidationFlag;

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

	private validateVariogramParameters(
		variogramModel: VariogramModel,
		params?: Partial<VariogramParameters>
	): ValidationFlag {
		const required = RequiredParamsByModel[variogramModel];
		const notFilled: string[] = [];

		for (const key of Object.keys(
			required
		) as (keyof VariogramParameters)[]) {
			if (
				required[key] &&
				(params?.[key] === undefined || params?.[key] === null)
			) {
				notFilled.push(key);
			}
		}

		return {
			isValid: notFilled.length === 0,
			notFilledValues: notFilled,
		};
	}
}
