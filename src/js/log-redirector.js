function createLogRedirector(logId, logContainerId) {
    const logTypes = {
        log: "color: silver",
        debug: "",
        warn: "color: orange; font-weight: bold",
        error: "color: red; font-weight: bold",
        info: "color: skyblue"
    };

    function rewireLoggingToElement(eleLocator, eleOverflowLocator, autoScroll) {
        Object.keys(logTypes).forEach(type => redirectLog(type));

        function redirectLog(name) {
            console['old' + name] = console[name];
            console[name] = function(...args) {
                const output = produceOutput(name, args);
                const eleLog = eleLocator();

                if (autoScroll) {
                    const eleContainerLog = eleOverflowLocator();
                    const isScrolledToBottom = eleContainerLog.scrollHeight - eleContainerLog.clientHeight <= eleContainerLog.scrollTop + 1;
                    eleLog.innerHTML += output + "<br>";
                    if (isScrolledToBottom) {
                        eleContainerLog.scrollTop = eleContainerLog.scrollHeight - eleContainerLog.clientHeight;
                    }
                } else {
                    eleLog.innerHTML += output + "<br>";
                }

                console['old' + name].apply(undefined, args);
            };
        }

        function printArg(arg) {
            if(arg instanceof Error) {
                return `${arg.message}
                ${arg.stack}`
            }

            return (typeof arg === "object" && (JSON || {}).stringify ? JSON.stringify(arg) : arg);
        }

        function produceOutput(name, args) {
            return args.reduce((output, arg) => {
                return output +
                    `<span style="${logTypes[name]}">${printArg(arg)}</span>&nbsp;`;
            }, '');
        }
    }

    function rewireLoggingBack() {
        Object.keys(logTypes).forEach(type => {
            console[type] = console['old' + type];
            delete console['old' + type];
        });
    }

    return {
        redirectLogsToElement: () => rewireLoggingToElement(
            () => document.getElementById(logId),
            () => document.getElementById(logContainerId), true),
        cleanRedirection: () => rewireLoggingBack()
    }
}

exports.createLogRedirector = createLogRedirector
