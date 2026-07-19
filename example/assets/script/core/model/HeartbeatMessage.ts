import { cc_zest_socket_data, Debug, decorator, network } from "zest";

const {zestClass} = decorator;

@zestClass("heartbeatMessage")
export class HeartbeatMessage extends network.SocketMessage<string, string> {

    protected onCreate(): cc_zest_socket_data {
        return "int";
    }

    protected onMessage(data: string): void {
        Debug.log(this.toString(), data);
    }
}