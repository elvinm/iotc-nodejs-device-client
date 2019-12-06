// Copyright (c) Luca Druda. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
import * as util from 'util';
import { Buffer } from "buffer";
import * as crypto from 'crypto';
import { ProvisioningDeviceClient, RegistrationResult } from 'azure-iot-provisioning-device';
import { DeviceProvisioningTransport, DeviceSecurityClient } from './types/interfaces';
import { X509 } from 'azure-iot-common';
import { X509Security } from 'azure-iot-security-x509';
import { DPS_DEFAULT_ENDPOINT, DeviceTransport } from './types/constants';
import { capitalizeFirst, getTransportString, getTransportMod } from './utils/commons';
import { SymmetricKeySecurityClient } from 'azure-iot-security-symmetric-key';



export class DeviceProvisioning {

    private iotcModelId: string;
    private iotcCapabilityModel: any;
    constructor(private endpoint: string = DPS_DEFAULT_ENDPOINT) {
        this.iotcCapabilityModel = {};
    }
    /**
     * Provision and register a device using provided transport type
     * @param scopeId The application scopeId
     * @param transportType Transport type (mqtt, amqp or http)
     * @param securityClient a security client to use for authentication (x509, tpm or saskey)
     * @returns RegistrationResult 
     */
    public async register(scopeId: string, transportType: DeviceTransport, securityClient: DeviceSecurityClient): Promise<RegistrationResult> {
        const transport = await this.getProvisionTransport(transportType);
        const deviceClient = ProvisioningDeviceClient.create(this.endpoint, scopeId, transport, securityClient);
        if (this.iotcModelId) {
            deviceClient.setProvisioningPayload({
                '__iot:interfaces': {
                    CapabilityModelId: this.iotcModelId,
                    CapabilityModel: this.iotcCapabilityModel
                }
            });
        }
        return util.promisify(deviceClient.register).bind(deviceClient)();
    }

    public setIoTCModelId(modelId: string) {
        this.iotcModelId = modelId;
    }

    public setCapabilityModel(model: string) {
        this.iotcCapabilityModel = model;
    }
    public generateX509SecurityClient(deviceId: string, cert: X509): DeviceSecurityClient {
        return new X509Security(deviceId, cert);
    }

    public generateSymKeySecurityClient(deviceId: string, symmetricKey: string): DeviceSecurityClient {
        // TODO: Uncomment this line when symmetricKey library will be publicly available
        return new SymmetricKeySecurityClient(deviceId, symmetricKey);
    }

    private async getProvisionTransport(transportType: DeviceTransport): Promise<DeviceProvisioningTransport> {
        const transport = (await import(`azure-iot-provisioning-device-${getTransportString(transportType)}`))[getTransportMod(transportType)];
        return new transport();
    }

    public async getConnectionTransport(transportType: DeviceTransport): Promise<any> {
        let transportCtr = (await import(`azure-iot-device-${getTransportString(transportType)}`))[getTransportMod(transportType)];
        return transportCtr;
    }

    public computeDerivedKey(masterKey: string, deviceId: string): string {
        return crypto.createHmac('SHA256', Buffer.from(masterKey, 'base64'))
            .update(deviceId, 'utf8')
            .digest('base64');
    }

}
