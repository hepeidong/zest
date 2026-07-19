import { cc_zest_socket_data, Debug, decorator, network, utils } from "zest";

const {zestClass} = decorator;

type test_t = {
    test: string
}

@zestClass("testMessage")
export class TestMessage extends network.SocketMessage<test_t, test_t> {

    protected onCreate(): cc_zest_socket_data {
        return "object";
    }

    protected onError(code: number): void {
        Debug.error("错误，错误码为：", code);
    }

    protected onMessage(data: test_t): void {
        // Debug.log(utils.StringUtil.format("消息数据：%s", JSON.stringify(data)));
        Debug.log(data);
    }
}