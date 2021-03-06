// Copyright (c) Luca Druda. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
import { IIoTCLogger } from "./types/interfaces";
import { IOTC_LOGGING } from "./types/constants";

export class ConsoleLogger implements IIoTCLogger {
    setLogLevel(logLevel: string | IOTC_LOGGING): void {
        if (typeof (logLevel) == 'string') {
            this.loggerLevel = IOTC_LOGGING[logLevel.toUpperCase()];
            if (!this.loggerLevel) {
                console.error(`LoggingLevel ${logLevel} is unsupported.\nSupported levels: ${Object.keys(IOTC_LOGGING).join(',')}`);
                throw new Error();
            }
        }
        else {
            this.loggerLevel = logLevel;
        }
    }
    constructor(private loggerLevel: IOTC_LOGGING = IOTC_LOGGING.DISABLED) {

    }
    log(message: string): void {
        if (this.loggerLevel != IOTC_LOGGING.DISABLED)
            console.log(message);
    }

}