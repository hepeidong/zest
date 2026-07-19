import { Size, Vec3 } from "cc";
import { Debug, Direction, app, decorator } from "zest";

const {zestClass, model} = decorator;

class RockingData {
    direction: Direction.Type = Direction.Type.None;
    mapSize: Size = new Size();
    heroPos: Vec3 = new Vec3();
    radian: number;
    angle: number;
}

@zestClass("RockingModel")
@model(RockingData)
export class RockingModel extends app.Document<RockingData> {
    onCreate(): void {
        
    }

    public setAngle(angle: number) {
        this.data.angle = angle;
    }

    public setDirection(direction: Direction.Type) {
        this.data.direction = direction;
    }

    public setDirectionToNone() {
        this.data.direction = Direction.Type.None;
    }

    public setMapSize(w: number, h: number) {
        this.data.mapSize.set(w, h);
    }

    public setRadian(radian: number) {
        this.data.radian = radian;
    }
}