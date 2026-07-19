import { DataManager } from "./DataManager";

/**配置表数据文件读取模块 */
export class excel {
    public static get file() { return DataManager.instance.file; }
    /**
     * 加载配置表数据
     * @param path 配置表本地路径，传入配置表所在的目录的路径，不需要具体某个文件，会加载该目录下的所有配置表文件
     * @param nameOrUrl 资源包名或者资源包路径
     * @param onComplete 加载成功回调
     */
    public static loadJSONTable(path: string, nameOrUrl: string, onComplete?: Function): void;
    public static loadJSONTable(path: string, onComplete?: Function): void;
    public static loadJSONTable() {
        DataManager.instance.loadJSONTable.apply(DataManager.instance, arguments);
    }
}
