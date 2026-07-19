import { excel, app, decorator } from "zest";
import { EventType } from "../EventType";
import { HeroWeapon } from "../battleSystem/dataType";

const {zestClass, model} = decorator;

type WeaponId = {id: number}

class HeroData {
    id: number;
    name: string;
    hp: number;
    exp: number;
    level: number;
    currentHp: number;
    weapon: HeroWeapon & WeaponId = {} as HeroWeapon & WeaponId;
}

@zestClass("HeroModel")
@model(HeroData)
export class HeroModel extends app.Document<HeroData> {

    onCreate(): void {
        this.data.id = excel.file.Hero.get(1000).id;
        this.data.exp = excel.file.Hero.get(1000).exp;
        this.data.hp = excel.file.Hero.get(1000).HP;
        this.data.name = excel.file.Hero.get(1000).name;
        this.data.level = excel.file.Hero.get(1000).level;
        this.data.currentHp = excel.file.Hero.get(1000).HP;
        this.data.weapon.attack = excel.file.HeroWeapon.get(1100).attack;
        this.data.weapon.attackDistance = excel.file.HeroWeapon.get(1100).attackDistance;
        this.data.weapon.bulletCount = excel.file.HeroWeapon.get(1100).bulletCount;
        this.data.weapon.bulletSpeed = excel.file.HeroWeapon.get(1100).bulletSpeed;
        this.data.weapon.cd = excel.file.HeroWeapon.get(1100).cd;
        this.data.weapon.weaponType = excel.file.HeroWeapon.get(1100).type;
        this.data.weapon.id = excel.file.HeroWeapon.get(1100).id;
    }

    public updateHp(hp: number) {
        if (this.data.currentHp > 0) {
            this.data.currentHp -= hp;
            if (this.data.currentHp < 0) {
                this.data.currentHp = 0;
            }
        }
        this.sendNotice(EventType.UPDATE_HP, this.data.currentHp);
    }
}