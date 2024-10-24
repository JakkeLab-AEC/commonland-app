import * as THREE from 'three';
import { SceneController } from '../SceneController';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter';

export class ThreeExporter {
    static exportAsObjAndMtl() {
        const scene = SceneController.getInstance().getScene();
        
        // OBJExporter로 obj 파일 내보내기
        const objExporter = new OBJExporter();
        const objContent = objExporter.parse(scene);

        // 재질 정보 수동 생성 (기본적으로 Lambert 재질 사용)
        const mtlContent = scene.children.map((child: any) => {
            if (child.material) {
                const material = child.material;
                return `
                    newmtl ${material.name}
                    Ka ${material.color.r} ${material.color.g} ${material.color.b}
                    Kd ${material.color.r} ${material.color.g} ${material.color.b}
                    Ks 0.000000 0.000000 0.000000
                    d 1.0
                    illum 2
                    Ns 0.000000
                    `;
                }
            return '';
        }).join('\n');

        // OBJ 파일 다운로드 링크 생성
        this.downloadFile('scene.obj', objContent);
        
        // MTL 파일 다운로드 링크 생성
        this.downloadFile('scene.mtl', mtlContent);
    }

    static downloadFile(fileName: string, content: string) {
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
    }
}