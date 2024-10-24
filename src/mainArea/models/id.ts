import { v4 as uuidv4 } from 'uuid';

export class ElementId {
    private key: string;

    constructor(){
        this.key = uuidv4();
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
}