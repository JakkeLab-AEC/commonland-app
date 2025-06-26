import { v4 as uuidv4 } from 'uuid';

export class ElementId {
    private key: string;

    constructor(){
        let key = miniId();
        while(ElementId.keyHash.has(key)) {
            key = miniId();
        }

        this.key = key;
        ElementId.keyHash.add(key);
    }

    protected updateKey(uuid: string):void {
        this.key = uuid;
    }

    getValue(): string {
        return this.key;
    }

    static createByValue(uuid: string): ElementId {
        const key = new ElementId();
        key.updateKey(uuid);
        return key;
    }

    static keyHash:Set<string> = new Set();
}

function miniId(length = 8) {
    const key = uuidv4();
    return key.replace(/-/g, "").slice(0, length);
}